const express = require('express');
const router = express.Router();

// @desc    Get buyer dashboard
// @route   GET /api/buyers/dashboard
// @access  Private (Buyers only)
router.get('/dashboard', (req, res) => {
  res.json({ success: true, message: 'Buyer dashboard endpoint' });
});

module.exports = router;
