const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { superadminProtect, protect } = require('../middleware/authMiddleware');

router.post('/managers', superadminProtect, userController.createManager);
router.get('/managers', superadminProtect, userController.getManagers);
router.put('/managers/:id', superadminProtect, userController.updateManager);
router.delete('/managers/:id', superadminProtect, userController.deleteManager);

// Profile
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
