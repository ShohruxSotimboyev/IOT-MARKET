const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, adminProtect: admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(categoryController.getAllCategories)
  .post(protect, admin, categoryController.createCategory);

router.route('/:id')
  .put(protect, admin, categoryController.updateCategory)
  .delete(protect, admin, categoryController.deleteCategory);

module.exports = router;
