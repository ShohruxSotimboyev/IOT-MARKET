# Backend API Integratsiya Qo'llanmasi

## 1. Prisma Schema Yangilash

Avval `prisma/schema.prisma` faylini yangilang:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// --- User Model ---
model User {
  id           String    @id @default(uuid())
  username     String
  email        String    @unique
  phone        String    @default("Kiritilmagan")
  password     String?
  isVerified   Boolean   @default(false)

  otpHash      String?
  otpExpires   DateTime?
  otpAttempts  Int       @default(0)

  refreshToken String?
  googleId     String?

  lastLogin    DateTime?
  loginCount   Int       @default(0)

  role         String    @default("user") // user, admin

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  orders       Order[]
  messages     Message[]
}

// --- Product Model ---
model Product {
  id          String   @id @default(uuid())
  name        String
  category    String
  price       Float
  oldPrice    Float?
  badge       String?  // HOT, NEW, SALE, BEST
  inStock     Boolean  @default(true)
  rating      Float    @default(0)
  reviews     Int      @default(0)
  image       String
  description String?

  status      String   @default("active") // active, inactive

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orderItems  OrderItem[]
}

// --- Order Model ---
model Order {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id])

  items           OrderItem[]

  subtotal        Float
  commission      Float
  discount        Float     @default(0)
  total           Float
  currency        String    @default("UZS")

  payment         Json

  status          String    @default("pending") // pending, paid, shipped, delivered, cancelled

  shippingAddress Json?
  note            String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId, createdAt(sort: Desc)])
}

// --- OrderItem Model ---
model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  
  quantity  Int
  price     Float

  createdAt DateTime @default(now())
}

// --- Message Model ---
model Message {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  
  name        String
  email       String
  phone       String?
  subject     String
  message     String
  
  status      String   @default("unread") // unread, read, replied
  reply       String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status, createdAt(sort: Desc)])
}

// --- Banner Model ---
model Banner {
  id          String   @id @default(uuid())
  title       String
  description String?
  link        String?
  image       String
  
  status      String   @default("active") // active, inactive
  order       Int      @default(0)
  
  startDate   DateTime?
  endDate     DateTime?
  
  clicks      Int      @default(0)
  views       Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status, order])
}
```

## 2. Database Migration

```bash
# Prisma client generatsiya qilish
npx prisma generate

# Database migratsiya qilish
npx prisma migrate dev --name init

# Production uchun
npx prisma migrate deploy
```

## 3. Prisma Client Yaratish

`config/db.js` faylini yaratish:

```javascript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma
```

## 4. Controller Yaratish

### Product Controller

`controllers/productController.js`:

```javascript
const prisma = require('../config/db')

// Barcha mahsulotlarni olish
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query

    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) where.category = category
    if (status) where.status = status

    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.product.count({ where })

    res.json({
      success: true,
      data: products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Bitta mahsulotni olish
exports.getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    })

    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' })
    }

    res.json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mahsulot yaratish
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, oldPrice, badge, inStock, rating, reviews, image, description } = req.body

    const product = await prisma.product.create({
      data: {
        name,
        category,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        badge,
        inStock,
        rating,
        reviews,
        image,
        description,
      },
    })

    res.status(201).json({ success: true, data: product })
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
        name,
        category,
        price: parseFloat(price),
        oldPrice: oldPrice ? parseFloat(oldPrice) : null,
        badge,
        inStock,
        rating,
        reviews,
        image,
        description,
        status,
      },
    })

    res.json({ success: true, data: product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mahsulot o'chirish
exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    })

    res.json({ success: true, message: 'Mahsulot o\'chirildi' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Mahsulot qidirish
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 1) return res.json({ success: true, data: [] })

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 8,
    })

    res.json({ success: true, data: products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
```

### Banner Controller

`controllers/bannerController.js`:

```javascript
const prisma = require('../config/db')

// Barcha bannerlarni olish
exports.getAllBanners = async (req, res) => {
  try {
    const { status } = req.query
    const where = status ? { status } : {}

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })

    res.json({ success: true, data: banners })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Banner yaratish
exports.createBanner = async (req, res) => {
  try {
    const { title, description, link, image, status, order, startDate, endDate } = req.body

    const banner = await prisma.banner.create({
      data: {
        title,
        description,
        link,
        image,
        status,
        order: parseInt(order) || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    res.status(201).json({ success: true, data: banner })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Banner yangilash
exports.updateBanner = async (req, res) => {
  try {
    const { title, description, link, image, status, order, startDate, endDate } = req.body

    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        link,
        image,
        status,
        order: parseInt(order) || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    })

    res.json({ success: true, data: banner })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Banner o'chirish
exports.deleteBanner = async (req, res) => {
  try {
    await prisma.banner.delete({
      where: { id: req.params.id },
    })

    res.json({ success: true, message: 'Banner o\'chirildi' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
```

### Message Controller

`controllers/messageController.js`:

```javascript
const prisma = require('../config/db')

// Barcha xabarlarni olish
exports.getAllMessages = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const where = status ? { status } : {}

    const messages = await prisma.message.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, email: true } } },
    })

    const total = await prisma.message.count({ where })

    res.json({
      success: true,
      data: messages,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Xabar yaratish
exports.createMessage = async (req, res) => {
  try {
    const { userId, name, email, phone, subject, message } = req.body

    const newMessage = await prisma.message.create({
      data: {
        userId,
        name,
        email,
        phone,
        subject,
        message,
      },
    })

    res.status(201).json({ success: true, data: newMessage })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Xabarni o'qish
exports.markAsRead = async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { status: 'read' },
    })

    res.json({ success: true, data: message })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Xabarga javob berish
exports.replyToMessage = async (req, res) => {
  try {
    const { reply } = req.body

    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { reply, status: 'replied' },
    })

    res.json({ success: true, data: message })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
```

## 5. Routes Yaratish

### Product Routes

`routes/productRoutes.js`:

```javascript
const express = require('express')
const router = express.Router()
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require('../controllers/productController')

// Public routes
router.get('/', getAllProducts)
router.get('/search', searchProducts)
router.get('/:id', getProductById)

// Admin routes (authentication middleware qo'shish kerak)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

module.exports = router
```

### Banner Routes

`routes/bannerRoutes.js`:

```javascript
const express = require('express')
const router = express.Router()
const {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController')

// Public routes
router.get('/', getAllBanners)

// Admin routes
router.post('/', createBanner)
router.put('/:id', updateBanner)
router.delete('/:id', deleteBanner)

module.exports = router
```

### Message Routes

`routes/messageRoutes.js`:

```javascript
const express = require('express')
const router = express.Router()
const {
  getAllMessages,
  createMessage,
  markAsRead,
  replyToMessage,
} = require('../controllers/messageController')

// Public route
router.post('/', createMessage)

// Admin routes
router.get('/', getAllMessages)
router.patch('/:id/read', markAsRead)
router.patch('/:id/reply', replyToMessage)

module.exports = router
```

## 6. Server.js ga Routes Qo'shish

```javascript
const bannerRoutes = require('./routes/bannerRoutes')
const messageRoutes = require('./routes/messageRoutes')

// Routes qo'shish
app.use('/api/banners', bannerRoutes)
app.use('/api/messages', messageRoutes)
```

## 7. File Upload (Multer)

`middleware/upload.js`:

```javascript
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (extname && mimetype) {
      return cb(null, true)
    }
    cb(new Error('Only images are allowed'))
  },
})

module.exports = upload
```

## 8. Authentication Middleware

`middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }
    next()
  })
}

module.exports = { auth, adminAuth }
```

## 9. Environment Variables

`.env` fayliga qo'shing:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/iot_market"
JWT_SECRET="your-secret-key"
FRONTEND_URL="http://localhost:5173"
ADMIN_PANEL_URL="http://localhost:5174"
```

## 10. Test Qilish

```bash
# Server ishga tushurish
npm run dev

# Test qilish (curl yoki Postman)
curl http://localhost:5000/api/products
curl http://localhost:5000/api/banners
curl http://localhost:5000/api/messages
```

## 11. Frontend va Admin Panel bilan Bog'lash

Frontend va Admin Panel API URL ni `.env` faylida sozlash:

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

**Admin Panel (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

## 12. Deployment

```bash
# Production build
npm run build

# Database migration
npx prisma migrate deploy

# Start server
npm start
```
