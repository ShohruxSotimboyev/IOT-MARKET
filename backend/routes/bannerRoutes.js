const express = require('express')
const router = express.Router()
const {
  getAllBanners, createBanner, updateBanner,
  deleteBanner, updateBannerStatus, updateBannerOrder, uploadBannerImage,
} = require('../controllers/bannerController')
const upload = require('../middleware/upload')
const { adminProtect } = require('../middleware/authMiddleware')

// Public routes
router.get('/', getAllBanners)                                    // ?status=active ham ishlaydi
router.get('/active', (req, res) => {                           // /active shortcut
  req.query.status = 'active'
  return getAllBanners(req, res)
})

// Admin routes
router.post('/upload', adminProtect, upload.single('image'), uploadBannerImage)
router.post('/', adminProtect, createBanner)
router.put('/:id', adminProtect, updateBanner)
router.delete('/:id', adminProtect, deleteBanner)
router.patch('/:id/status', adminProtect, updateBannerStatus)
router.patch('/:id/order', adminProtect, updateBannerOrder)

module.exports = router
