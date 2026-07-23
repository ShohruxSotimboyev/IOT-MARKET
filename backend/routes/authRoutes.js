const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { prisma } = require('../config/db')
const passport = require('passport')
const { protect, adminProtect } = require('../middleware/authMiddleware')
const { loginLimiter, otpLimiter, registerLimiter } = require('../middleware/rateLimiter')
const {
  register, login, verifyOTP, resendOTP, refreshToken, logoutUser,
} = require('../controllers/authController')

// ── Public auth (Frontend uchun) ─────────────────────────────────────────────
router.post('/register',   registerLimiter, register)
router.post('/login',      loginLimiter,    login)
router.post('/verify-otp', otpLimiter,      verifyOTP)
router.post('/resend-otp', otpLimiter,      resendOTP)
router.post('/refresh',                     refreshToken)
router.post('/logout',     protect,         logoutUser)

// ── Admin direct login (OTP siz) ─────────────────────────────────────────────
router.post('/admin-login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email va parol kiritilishi shart' })
  try {
    const user = await prisma.user.findFirst({ where: { email: email.toLowerCase().trim() } })
    if (!user || !user.password) return res.status(401).json({ message: "Email yoki parol noto'g'ri" })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: "Email yoki parol noto'g'ri" })
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ message: "Sizda admin huquqi yo'q" })
    }
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
      { expiresIn: '7d' }
    )
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLogin: new Date(), loginCount: { increment: 1 }, isVerified: true },
    })
    res.json({ accessToken, refreshToken, user: { id: user.id, username: user.username, email: user.email, role: user.role } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── Google OAuth (Frontend uchun) ─────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google` }),
  (req, res) => {
    if (!req.user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth`)
    const jwt = require('jsonwebtoken')
    const user = req.user
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
    const userStr = encodeURIComponent(JSON.stringify({ id: user.id, name: user.username, email: user.email }))
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/success?token=${accessToken}&user=${userStr}`)
  }
)

// ── Verify token (Frontend uchun) ─────────────────────────────────────────────
router.get('/verify', protect, (req, res) => {
  res.json({ success: true, user: req.user })
})

// ── Admin verify token (Admin panel uchun) ────────────────────────────────────
router.get('/admin-verify', adminProtect, (req, res) => {
  res.json({ success: true, user: req.user })
})

// ── Superadmin: add new manager ───────────────────────────────────────────────
router.post('/add-manager', require('../middleware/authMiddleware').superadminProtect, async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: "Barcha maydonlarni to'ldiring." });
    }
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Bu email band." });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase().trim(),
        phone,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      }
    });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
})

// ── Admin: get all users ──────────────────────────────────────────────────────
router.get('/users', adminProtect, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query
    const where = search ? {
      OR: [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    } : {}
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, email: true, phone: true, role: true, isVerified: true, loginCount: true, createdAt: true, _count: { select: { orders: true } } },
      }),
      prisma.user.count({ where }),
    ])
    res.json({ success: true, data: users, total })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── Logout session ────────────────────────────────────────────────────────────
router.get('/logout-session', (req, res) => {
  req.logout?.()
  req.session?.destroy?.(() => res.json({ success: true }))
})

module.exports = router
