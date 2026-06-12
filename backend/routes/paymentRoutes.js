const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Faqat login qilgan foydalanuvchi to'lov qila oladi
router.post('/create-checkout-session', protect, createCheckoutSession);

module.exports = router;