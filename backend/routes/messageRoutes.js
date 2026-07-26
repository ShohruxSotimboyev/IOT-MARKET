const express = require('express')
const router = express.Router()
const {
  getAllMessages,
  getMessageById,
  createMessage,
  markAsRead,
  replyToMessage,
  deleteMessage,
} = require('../controllers/messageController')
const { protect, requirePermission } = require('../middleware/authMiddleware')

// Public
router.post('/', createMessage)

// Admin
router.get('/', protect, requirePermission('messages'), getAllMessages)
router.get('/:id', protect, requirePermission('messages'), getMessageById)
router.patch('/:id/read', protect, requirePermission('messages'), markAsRead)
router.patch('/:id/reply', protect, requirePermission('messages'), replyToMessage)
router.post('/:id/reply', protect, requirePermission('messages'), replyToMessage)
router.delete('/:id', protect, requirePermission('messages'), deleteMessage)

module.exports = router
