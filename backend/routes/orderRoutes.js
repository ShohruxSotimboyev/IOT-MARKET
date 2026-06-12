const express = require('express')
const router = express.Router()
const { createOrder, getMyOrders, getOrderById, getOrderStats } = require('../controllers/orderController')
const { protect, adminProtect } = require('../middleware/authMiddleware')
const { generalLimiter } = require('../middleware/rateLimiter')
const { prisma } = require('../config/db')

// Admin routes
router.get('/admin/all', adminProtect, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        include: {
          user: { select: { id: true, username: true, email: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count(),
    ])
    res.json({ success: true, orders, data: orders, total })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.patch('/:id/status', adminProtect, async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    })
    res.json({ success: true, data: order })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// User routes
router.use(protect)
router.use(generalLimiter)
router.post('/', createOrder)
router.get('/', getMyOrders)
router.get('/stats', getOrderStats)
router.get('/:id', getOrderById)

module.exports = router
