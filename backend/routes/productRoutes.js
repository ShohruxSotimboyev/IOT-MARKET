const express = require('express')
const router = express.Router()
const {
  getAllProducts, getProductById, createProduct,
  updateProduct, deleteProduct, searchProducts,
  updateProductStatus, uploadImage,
} = require('../controllers/productController')
const upload = require('../middleware/upload')
const { adminProtect } = require('../middleware/authMiddleware')

// Public routes
router.get('/', getAllProducts)
router.get('/search', searchProducts)
router.get('/:id', getProductById)

// Admin routes
router.post('/upload', adminProtect, upload.single('image'), uploadImage)
router.post('/', adminProtect, createProduct)
router.put('/:id', adminProtect, updateProduct)
router.delete('/:id', adminProtect, deleteProduct)
router.patch('/:id/status', adminProtect, updateProductStatus)

module.exports = router
