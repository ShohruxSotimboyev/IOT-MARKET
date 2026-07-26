const { prisma } = require('../config/db');
const logger = require('../utils/logger');

exports.getInventoryLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (Math.max(parseInt(page), 1) - 1) * Math.min(parseInt(limit), 500);

    const where = search ? {
      product: { name: { contains: search, mode: 'insensitive' } }
    } : {};

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        where, skip, take: Math.min(parseInt(limit), 500),
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, category: true } },
          user: { select: { id: true, username: true, role: true } }
        }
      }),
      prisma.inventoryLog.count({ where })
    ]);

    res.json({ success: true, data: logs, total, page: parseInt(page), totalPages: Math.ceil(total / Math.min(parseInt(limit), 500)) });
  } catch (error) {
    next(error);
  }
};

exports.addInventoryLog = async (req, res, next) => {
  try {
    const { productId, type, quantity, reason } = req.body;

    if (!productId || !type || !quantity) {
      return res.status(400).json({ error: "productId, type, va quantity majburiy." });
    }
    if (type !== 'in' && type !== 'out') {
      return res.status(400).json({ error: "Type faqat 'in' yoki 'out' bo'lishi mumkin." });
    }
    const qty = parseInt(quantity);
    if (qty <= 0) {
      return res.status(400).json({ error: "Miqdor musbat son bo'lishi kerak." });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Mahsulot topilmadi");

      const log = await tx.inventoryLog.create({
        data: {
          productId, type, quantity: qty, reason,
          userId: req.user?.id || null
        }
      });

      const newStock = type === 'in' ? product.stockCount + qty : product.stockCount - qty;
      await tx.product.update({
        where: { id: productId },
        data: { stockCount: newStock, inStock: newStock > 0 }
      });

      return log;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.message === "Mahsulot topilmadi") {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
};

exports.exportInventory = async (req, res, next) => {
  try {
    const { from, to, type } = req.query;
    const where = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to + 'T23:59:59');
    }
    if (type && (type === 'in' || type === 'out')) {
      where.type = type;
    }

    const logs = await prisma.inventoryLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, category: true } },
        user: { select: { username: true } }
      }
    });

    const rows = logs.map(l => ({
      Sana: new Date(l.createdAt).toLocaleDateString('uz-UZ'),
      Mahsulot: l.product?.name || 'Noma\'lum',
      Kategoriya: l.product?.category || '',
      Tur: l.type === 'in' ? 'Kirim' : 'Chiqim',
      Miqdor: l.quantity,
      Sabab: l.reason || '',
      Kiritdi: l.user?.username || 'Noma\'lum'
    }));

    res.json({ success: true, data: rows, total: rows.length });
  } catch (error) {
    logger.error('Export inventory error', { error: error.message });
    next(error);
  }
};
