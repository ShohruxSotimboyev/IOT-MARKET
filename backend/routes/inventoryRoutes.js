const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, adminProtect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, adminProtect, inventoryController.getInventoryLogs)
  .post(protect, adminProtect, inventoryController.addInventoryLog);

module.exports = router;
