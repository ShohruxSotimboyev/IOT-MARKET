const prisma = require('../config/db').prisma;
const logger = require('../utils/logger');

// ─── POST /api/orders — yangi buyurtma ──────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, commission, discount, total, payment, shippingAddress, note } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Buyurtmada kamida 1 ta mahsulot bo'lishi shart." });
    }

    for (const item of items) {
      if (!item.name || item.price == null || item.quantity == null) {
        return res.status(400).json({ message: "Har bir mahsulot nomi, narxi va miqdori bo'lishi shart." });
      }
    }

    const calcSubtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const calcCommission = Math.floor(calcSubtotal * 0.01);
    const calcTotal = calcSubtotal + calcCommission - (discount || 0);

    if (Math.abs(calcTotal - total) > calcTotal * 0.05) {
      logger.warn('Possible price manipulation', { userId: req.user.id, sentTotal: total, calcTotal });
      return res.status(400).json({ message: "To'lov summasi noto'g'ri." });
    }

    const txId = `TX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const formattedItems = items.map(i => ({
      productId: String(i.productId || i.id || 'local'),
      name:      String(i.name).slice(0, 200),
      price:     Number(i.price),
      quantity:  Math.max(1, Number(i.quantity) || 1),
      image:     String(i.image || '').slice(0, 500),
      category:  String(i.category || ''),
    }));

    const formattedPayment = {
      cardLast4:  String(payment?.cardLast4 || '').slice(-4),
      cardScheme: payment?.cardScheme || 'unknown',
      cardHolder: String(payment?.cardHolder || '').slice(0, 100),
      method:     'card',
    };

    const order = await prisma.$transaction(async (tx) => {
      // 1. Списание остатков
      for (const item of formattedItems) {
        if (item.productId !== 'local') {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const newStock = Math.max(0, product.stockCount - item.quantity);
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockCount: newStock,
                inStock: newStock > 0
              }
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                type: 'out',
                quantity: item.quantity,
                reason: `Sotuv (Buyurtma ID: ${txId})`
              }
            });
          }
        }
      }

      // 2. Создание заказа и OrderItem
      return tx.order.create({
        data: {
          userId: req.user.id,
          subtotal: calcSubtotal,
          commission: calcCommission,
          discount: discount || 0,
          total: calcTotal,
          payment: JSON.stringify(formattedPayment),
          shippingAddress: JSON.stringify(shippingAddress || {}),
          note: note ? String(note).slice(0, 500) : '',
          txId,
          status: 'pending', // Webhook will set to paid
          items: {
            create: formattedItems.map(i => ({
              productId: i.productId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              image: i.image,
              category: i.category
            }))
          }
        },
        include: { items: true }
      });
    });

    const itemsCount = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
    const summary = formattedItems.length === 1 
      ? formattedItems[0].name 
      : `${formattedItems[0].name} va yana ${formattedItems.length - 1} ta mahsulot`;

    logger.info('Order created', { orderId: order.id, userId: req.user.id, total: calcTotal });

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        txId: order.txId,
        total: order.total,
        status: order.status,
        itemsCount,
        summary,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    logger.error('Create order error', { error: err.message, userId: req.user?.id });
    res.status(500).json({ message: "Buyurtmani saqlashda xatolik yuz berdi." });
  }
};

// ─── GET /api/orders — foydalanuvchi buyurtmalari ───────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 10);
    const status = req.query.status;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders: orders.map(o => ({
        ...o,
        payment: o.payment ? (() => { try { return JSON.parse(o.payment) } catch { return {} } })() : {},
        shippingAddress: o.shippingAddress ? (() => { try { return JSON.parse(o.shippingAddress) } catch { return null } })() : null,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error('Get orders error', { error: err.message });
    res.status(500).json({ message: "Buyurtmalarni olishda xatolik." });
  }
};

// ─── GET /api/orders/:id — bitta buyurtma ───────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: { items: true }
    });

    if (!order) {
      return res.status(404).json({ message: "Buyurtma topilmadi." });
    }

    res.json({
      ...order,
      payment: order.payment ? (() => { try { return JSON.parse(order.payment) } catch { return {} } })() : {},
      shippingAddress: order.shippingAddress ? (() => { try { return JSON.parse(order.shippingAddress) } catch { return null } })() : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Xatolik yuz berdi." });
  }
};

// ─── GET /api/orders/stats — statistika ─────────────────────────────────────
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await prisma.order.aggregate({
      where: { userId: req.user.id, status: 'paid' },
      _count: { id: true },
      _sum: { total: true },
      _avg: { total: true },
    });

    const orders = await prisma.order.findMany({
      where: { userId: req.user.id, status: 'paid' },
      select: { items: true }
    });

    let totalItems = 0;
    orders.forEach(order => {
      totalItems += order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    });

    res.json({
      totalOrders: stats._count.id || 0,
      totalSpent: stats._sum.total || 0,
      avgOrder: stats._avg.total || 0,
      totalItems,
    });
  } catch (err) {
    res.status(500).json({ message: "Statistika olishda xatolik." });
  }
};
