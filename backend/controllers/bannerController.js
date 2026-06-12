const { prisma } = require('../config/db')

exports.getAllBanners = async (req, res) => {
  try {
    const { status } = req.query
    const where = {}
    if (status) where.status = status
    const banners = await prisma.banner.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    res.json({ success: true, data: banners, banners })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.createBanner = async (req, res) => {
  try {
    const { title, description, link, image, status, order } = req.body
    if (!title) return res.status(400).json({ success: false, message: 'Sarlavha kiritilishi shart' })
    const banner = await prisma.banner.create({
      data: {
        title,
        description: description || '',
        link: link || '/products',
        image: image || 'https://picsum.photos/seed/banner/1920/600',
        status: status || 'active',
        order: parseInt(order) || 0,
      },
    })
    res.status(201).json({ success: true, data: banner })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateBanner = async (req, res) => {
  try {
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        ...(req.body.order !== undefined && { order: parseInt(req.body.order) }),
      },
    })
    res.json({ success: true, data: banner })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Banner topilmadi' })
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteBanner = async (req, res) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } })
    res.json({ success: true, message: "Banner o'chirildi" })
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Banner topilmadi' })
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateBannerStatus = async (req, res) => {
  try {
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    })
    res.json({ success: true, data: banner })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateBannerOrder = async (req, res) => {
  try {
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: { order: parseInt(req.body.order) },
    })
    res.json({ success: true, data: banner })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.uploadBannerImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Rasm topilmadi' })
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
    const url = `${baseUrl}/uploads/${req.file.filename}`
    res.json({ success: true, url, path: `/uploads/${req.file.filename}` })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
