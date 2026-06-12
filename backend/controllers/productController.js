const { prisma } = require('../config/db')

// Product ni frontend formatiga o'girish
const toFrontend = (p) => ({
  ...p,
  cat: p.category,   // frontend 'cat' kutadi
  img: p.image,      // frontend 'img' ham kutadi
})

// ─── Barcha mahsulotlarni olish (pagination bilan) ────────────────────────
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, cat, status, page = 1, limit = 20 } = req.query
    const catFilter = category || cat

    // limit: 1 dan 5000 gacha bo'lishi mumkin (default 20)
    const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 5000)
    const safePage  = Math.max(parseInt(page) || 1, 1)
    const skip      = (safePage - 1) * safeLimit

    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (catFilter) where.category = catFilter
    if (status) where.status = status
    // Agar status berilmagan bo'lsa, frontend uchun faqat active, admin uchun barchasi
    else if (!req.headers.authorization) where.status = 'active'

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    res.json({
      success: true,
      data: products.map(toFrontend),
      products: products.map(toFrontend),
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Bitta mahsulot
exports.getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!product) return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })
    res.json({ success: true, data: toFrontend(product) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mahsulot yaratish
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, oldPrice, badge, inStock, rating, reviews, image, description, status } = req.body
    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Nomi, kategoriyasi va narxi kiritilishi shart' })
    }
    const product = await prisma.product.create({
      data: {
        name, category,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        badge: badge || null,
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        rating: parseFloat(rating) || 0,
        reviews: parseInt(reviews) || 0,
        image: image || 'https://picsum.photos/seed/default/400/400',
        description: description || '',
        status: status || 'active',
      },
    })
    res.status(201).json({ success: true, data: toFrontend(product) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mahsulot yangilash
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, oldPrice, badge, inStock, rating, reviews, image, description, status } = req.body
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(oldPrice !== undefined && { oldPrice: oldPrice ? parseFloat(oldPrice) : null }),
        ...(badge !== undefined && { badge: badge || null }),
        ...(inStock !== undefined && { inStock: Boolean(inStock) }),
        ...(rating !== undefined && { rating: parseFloat(rating) }),
        ...(reviews !== undefined && { reviews: parseInt(reviews) }),
        ...(image && { image }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    })
    res.json({ success: true, data: toFrontend(product) })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mahsulot o'chirish
exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: "Mahsulot o'chirildi" })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })
    res.status(500).json({ success: false, message: error.message })
  }
}

// Qidirish
exports.searchProducts = async (req, res) => {
  try {
    const { q, query } = req.query
    const term = q || query || ''
    if (!term.trim()) return res.json({ success: true, data: [] })
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: 30,
      orderBy: { rating: 'desc' },
    })
    res.json({ success: true, data: products.map(toFrontend) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Status yangilash
exports.updateProductStatus = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    })
    res.json({ success: true, data: toFrontend(product) })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Rasm yuklash
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Rasm topilmadi' })
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
    const url = `${baseUrl}/uploads/${req.file.filename}`
    res.json({ success: true, url, path: `/uploads/${req.file.filename}` })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}