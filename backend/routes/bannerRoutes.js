const express = require('express')
const router = express.Router()
const {
  getAllBanners, createBanner, updateBanner,
  deleteBanner, updateBannerStatus, updateBannerOrder, uploadBannerImage,
} = require('../controllers/bannerController')
const upload = require('../middleware/upload')
const { protect, requirePermission } = require('../middleware/authMiddleware')

// Public routes
router.get('/', getAllBanners)
router.get('/active', (req, res) => {
  req.query.status = 'active'
  return getAllBanners(req, res)
})

// Admin routes
router.post('/upload', protect, requirePermission('banners'), upload.single('image'), uploadBannerImage)
router.post('/', protect, requirePermission('banners'), createBanner)
router.put('/:id', protect, requirePermission('banners'), updateBanner)
router.delete('/:id', protect, requirePermission('banners'), deleteBanner)
router.patch('/:id/status', protect, requirePermission('banners'), updateBannerStatus)
router.patch('/:id/order', protect, requirePermission('banners'), updateBannerOrder)

module.exports = router
