const express = require('express')
const router = express.Router()
const {
  getAllProducts, getProductById, createProduct,
  updateProduct, deleteProduct, searchProducts,
  updateProductStatus, uploadImage,
} = require('../controllers/productController')
const upload = require('../middleware/upload')
const { protect, requirePermission } = require('../middleware/authMiddleware')

// Public routes
router.get('/', getAllProducts)
router.get('/search', searchProducts)
router.get('/:id', getProductById)

// Admin routes
router.post('/upload', protect, requirePermission('products'), upload.single('image'), uploadImage)
router.post('/', protect, requirePermission('products'), createProduct)
router.put('/:id', protect, requirePermission('products'), updateProduct)
router.delete('/:id', protect, requirePermission('products'), deleteProduct)
router.patch('/:id/status', protect, requirePermission('products'), updateProductStatus)

module.exports = router
