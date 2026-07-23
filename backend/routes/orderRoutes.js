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
          items: true
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count(),
    ])
    const mappedOrders = orders.map(o => ({
      ...o,
      payment: o.payment ? JSON.parse(o.payment) : {},
      shippingAddress: o.shippingAddress ? JSON.parse(o.shippingAddress) : null,
    }))
    res.json({ success: true, orders: mappedOrders, data: mappedOrders, total })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.get('/admin/stats', adminProtect, async (req, res) => {
  try {
    const totalOrders = await prisma.order.count()
    const totalRevenue = await prisma.order.aggregate({ _sum: { total: true } }).then(r => r._sum.total || 0)
    const totalCustomers = await prisma.user.count({ where: { role: 'user' } })
    const totalProducts = await prisma.product.count()
    
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, total: true }
    })
    
    const chartData = []
    for(let i=6; i>=0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayStr = d.toISOString().split('T')[0]
      const sum = recentOrders.filter(o => o.createdAt.toISOString().split('T')[0] === dayStr)
                              .reduce((acc, o) => acc + o.total, 0)
      chartData.push({ name: dayStr, value: sum })
    }

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalProducts,
        chartData
      }
    })
  } catch(err) {
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
