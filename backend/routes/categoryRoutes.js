const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.route('/')
  .get(categoryController.getAllCategories)
  .post(protect, requirePermission('products'), categoryController.createCategory);

router.route('/:id')
  .put(protect, requirePermission('products'), categoryController.updateCategory)
  .delete(protect, requirePermission('products'), categoryController.deleteCategory);

module.exports = router;
