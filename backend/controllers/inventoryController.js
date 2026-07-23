const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all inventory logs (with pagination and product details)
exports.getInventoryLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (Math.max(parseInt(page), 1) - 1) * Math.min(parseInt(limit), 500);

    const [logs, total] = await Promise.all([
      prisma.inventoryLog.findMany({
        skip,
        take: Math.min(parseInt(limit), 500),
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { name: true, category: true }
          }
        }
      }),
      prisma.inventoryLog.count()
    ]);

    res.json({
      success: true,
      data: logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / Math.min(parseInt(limit), 500))
    });
  } catch (error) {
    next(error);
  }
};

// Add inventory (adjusts stockCount)
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

    // Wrap in a transaction to ensure both log creation and product stock update succeed
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new Error("Mahsulot topilmadi");
      }

      const log = await tx.inventoryLog.create({
        data: {
          productId,
          type,
          quantity: qty,
          reason
        }
      });

      const newStock = type === 'in' ? product.stockCount + qty : product.stockCount - qty;

      await tx.product.update({
        where: { id: productId },
        data: { stockCount: newStock }
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
