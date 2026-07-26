const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.route('/')
  .get(supplierController.getAllSuppliers)
  .post(protect, requirePermission('products'), supplierController.createSupplier);

router.route('/:id')
  .put(protect, requirePermission('products'), supplierController.updateSupplier)
  .delete(protect, requirePermission('products'), supplierController.deleteSupplier);

module.exports = router;
