const express = require('express');
const router = express.Router();
const { createCheckoutSession, paymeWebhook, clickWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Buyurtma yaratish va to'lov url olish (Himoyalangan emas, xohlasangiz auth qo'shing)
router.post('/create-checkout-session', protect, createCheckoutSession);

router.post('/payme/webhook', paymeWebhook);
router.post('/click/webhook', clickWebhook);

module.exports = router;