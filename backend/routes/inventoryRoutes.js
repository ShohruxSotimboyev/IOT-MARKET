const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.get('/export', protect, requirePermission('inventory'), inventoryController.exportInventory);
router.route('/')
  .get(protect, requirePermission('inventory'), inventoryController.getInventoryLogs)
  .post(protect, requirePermission('inventory'), inventoryController.addInventoryLog);

module.exports = router;
