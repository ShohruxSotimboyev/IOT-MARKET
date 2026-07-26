const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/readyProductController')
const { protect, requirePermission } = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

router.post('/upload', protect, requirePermission('products'), upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Rasm topilmadi' })
  const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
  const url = `${baseUrl}/uploads/${req.file.filename}`
  res.json({ success: true, url, path: `/uploads/${req.file.filename}` })
})

router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)
router.post('/', protect, requirePermission('products'), ctrl.create)
router.put('/:id', protect, requirePermission('products'), ctrl.update)
router.delete('/:id', protect, requirePermission('products'), ctrl.remove)
router.patch('/:id/status', protect, requirePermission('products'), ctrl.updateStatus)

module.exports = router
