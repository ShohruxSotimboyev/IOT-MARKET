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
const { adminProtect } = require('../middleware/authMiddleware')

// Public
router.post('/', createMessage)

// Admin
router.get('/', adminProtect, getAllMessages)
router.get('/:id', adminProtect, getMessageById)
router.patch('/:id/read', adminProtect, markAsRead)
router.patch('/:id/reply', adminProtect, replyToMessage)
router.post('/:id/reply', adminProtect, replyToMessage)   // API dan ham ishlashi uchun
router.delete('/:id', adminProtect, deleteMessage)

module.exports = router
