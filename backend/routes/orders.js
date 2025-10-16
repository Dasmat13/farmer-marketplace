const express = require('express');
const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Buyers only)
router.post('/', (req, res) => {
  res.json({ success: true, message: 'Create order endpoint' });
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Get orders endpoint' });
});

module.exports = router;
