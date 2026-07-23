const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, adminProtect, supplierController.getAllSuppliers)
  .post(protect, adminProtect, supplierController.createSupplier);

router.route('/:id')
  .put(protect, adminProtect, supplierController.updateSupplier)
  .delete(protect, adminProtect, supplierController.deleteSupplier);

module.exports = router;
