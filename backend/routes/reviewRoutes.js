const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.post('/', protect, reviewController.createReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/', protect, requirePermission('reviews'), reviewController.getAllReviews);
router.delete('/:id', protect, requirePermission('reviews'), reviewController.deleteReview);

module.exports = router;
