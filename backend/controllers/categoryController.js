const { prisma } = require('../config/db');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Nomi kiritilishi shart' });
    
    // Check if category exists
    const exists = await prisma.category.findUnique({ where: { name } });
    if (exists) return res.status(400).json({ error: 'Bu kategoriya allaqachon mavjud' });

    const category = await prisma.category.create({
      data: { name, status: status || 'active' }
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    
    if (name) {
      const exists = await prisma.category.findUnique({ where: { name } });
      if (exists && exists.id !== id) {
        return res.status(400).json({ error: 'Bu nomli kategoriya allaqachon mavjud' });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name, status }
    });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if any products use this category
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: 'Kategoriya topilmadi' });
    
    const productsCount = await prisma.product.count({ where: { category: category.name } });
    if (productsCount > 0) {
      return res.status(400).json({ error: `Bu kategoriyada ${productsCount} ta mahsulot bor. Avval ularni o'chiring.` });
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Kategoriya o\'chirildi' });
  } catch (error) {
    next(error);
  }
};
