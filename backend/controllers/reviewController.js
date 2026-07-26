const { prisma } = require('../config/db');
const logger = require('../utils/logger');

exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    if (!productId || !comment || !comment.trim()) {
      return res.status(400).json({ message: "Mahsulot ID va sharh matni majburiy." });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ message: "Mahsulot topilmadi." });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating: Math.max(1, Math.min(5, parseInt(rating) || 5)),
        comment: comment.trim(),
        status: 'active'
      },
      include: { user: { select: { username: true } } }
    });

    logger.info('Review created', { userId, productId });

    const reviews = await prisma.review.findMany({ where: { productId, status: 'active' } });
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length : 0;
    
    await prisma.product.update({
      where: { id: productId },
      data: { 
        rating: Math.round(avgRating * 10) / 10,
        reviews: reviews.length
      }
    });

    res.status(201).json(review);
  } catch (error) {
    logger.error('Create review error', { error: error.message });
    res.status(500).json({ message: "Sharh qo'shishda xatolik" });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId, status: 'active' },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Xatolik" });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: { 
        user: { select: { username: true } },
        product: { select: { name: true, image: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error) {
    logger.error('Get all reviews error', { error: error.message });
    res.status(500).json({ message: "Xatolik" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return res.status(404).json({ message: "Sharh topilmadi" });

    await prisma.review.delete({ where: { id } });

    const reviews = await prisma.review.findMany({ where: { productId: review.productId, status: 'active' } });
    const avgRating = reviews.length > 0 ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length : 0;
    
    await prisma.product.update({
      where: { id: review.productId },
      data: { 
        rating: Math.round(avgRating * 10) / 10,
        reviews: reviews.length
      }
    });

    res.json({ message: "Sharh o'chirildi" });
  } catch (error) {
    res.status(500).json({ message: "Xatolik" });
  }
};
