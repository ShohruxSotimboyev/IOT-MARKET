const { prisma } = require('../config/db');

exports.getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(suppliers);
  } catch (error) {
    next(error);
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const { name, contact, phone, address, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Postavshik nomi kiritilishi shart' });

    const supplier = await prisma.supplier.create({
      data: { name, contact, phone, address, status: status || 'active' }
    });
    res.status(201).json(supplier);
  } catch (error) {
    next(error);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, contact, phone, address, status } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: { name, contact, phone, address, status }
    });
    res.json(supplier);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Postavshik topilmadi' });
    next(error);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if any products use this supplier
    const productsCount = await prisma.product.count({ where: { supplierId: id } });
    if (productsCount > 0) {
      return res.status(400).json({ error: `Bu postavshikda ${productsCount} ta mahsulot bor. Avval ularni o'chiring yoki boshqa postavshikka o'tkazing.` });
    }

    await prisma.supplier.delete({ where: { id } });
    res.json({ message: 'Postavshik o\'chirildi' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Postavshik topilmadi' });
    next(error);
  }
};
