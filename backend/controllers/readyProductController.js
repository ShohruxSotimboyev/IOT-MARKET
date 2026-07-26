const { prisma } = require('../config/db')
const logger = require('../utils/logger')

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, status } = req.query
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 500)
    const safePage = Math.max(parseInt(page) || 1, 1)
    const skip = (safePage - 1) * safeLimit

    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) where.categoryId = category
    if (status) where.status = status
    else if (!req.user) where.status = 'active'

    const [items, total] = await Promise.all([
      prisma.readyProduct.findMany({
        where, skip, take: safeLimit,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
      }),
      prisma.readyProduct.count({ where }),
    ])

    res.json({ success: true, data: items, total, page: safePage, totalPages: Math.ceil(total / safeLimit) })
  } catch (error) {
    logger.error('ReadyProduct getAll error', { error: error.message })
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getById = async (req, res) => {
  try {
    const item = await prisma.readyProduct.findUnique({
      where: { id: req.params.id },
      include: { category: true }
    })
    if (!item) return res.status(404).json({ success: false, message: 'Topilmadi' })
    res.json({ success: true, data: item })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.create = async (req, res) => {
  try {
    const { name, description, price, oldPrice, image, categoryId, status, inStock, stockCount, rating, reviews, features } = req.body
    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Nomi va narxi shart' })
    }
    const item = await prisma.readyProduct.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        image: image || 'https://picsum.photos/seed/default/400/400',
        categoryId: categoryId || null,
        status: status || 'active',
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        stockCount: parseInt(stockCount) || 0,
        rating: parseFloat(rating) || 0,
        reviews: parseInt(reviews) || 0,
        features: features || [],
      },
      include: { category: true }
    })
    res.status(201).json({ success: true, data: item })
  } catch (error) {
    logger.error('ReadyProduct create error', { error: error.message })
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.update = async (req, res) => {
  try {
    const { name, description, price, oldPrice, image, categoryId, status, inStock, stockCount, rating, reviews, features } = req.body
    const item = await prisma.readyProduct.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(oldPrice !== undefined && { oldPrice: oldPrice ? parseFloat(oldPrice) : null }),
        ...(image !== undefined && { image }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(status && { status }),
        ...(inStock !== undefined && { inStock: Boolean(inStock) }),
        ...(stockCount !== undefined && { stockCount: parseInt(stockCount) }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(reviews !== undefined && { reviews: parseInt(reviews) }),
        ...(features !== undefined && { features }),
      },
      include: { category: true }
    })
    res.json({ success: true, data: item })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Topilmadi' })
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.remove = async (req, res) => {
  try {
    await prisma.readyProduct.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: "O'chirildi" })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Topilmadi' })
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateStatus = async (req, res) => {
  try {
    if (!['active', 'inactive'].includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Noto'g'ri status qiymati" })
    }
    const item = await prisma.readyProduct.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    })
    res.json({ success: true, data: item })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Topilmadi' })
    res.status(500).json({ success: false, message: error.message })
  }
}
