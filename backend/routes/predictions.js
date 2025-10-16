const express = require('express');
const router = express.Router();

// @desc    Get crop price predictions
// @route   GET /api/predictions/:cropId
// @access  Public
router.get('/:cropId', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Crop price prediction endpoint',
    data: {
      cropId: req.params.cropId,
      predictions: {
        nextWeek: { price: 2.50, demand: 'high' },
        nextMonth: { price: 2.75, demand: 'medium' }
      }
    }
  });
});

module.exports = router;
