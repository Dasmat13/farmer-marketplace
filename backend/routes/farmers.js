const express = require('express');
const User = require('../models/User');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const { protect, requireFarmer } = require('../middleware/auth');

const router = express.Router();

// @desc    Get farmer dashboard data
// @route   GET /api/farmers/dashboard
// @access  Private (Farmers only)
router.get('/dashboard', protect, requireFarmer, async (req, res) => {
  try {
    const farmerId = req.user.userId;

    // Get farmer's crops
    const crops = await Crop.find({ farmer: farmerId })
      .sort('-createdAt')
      .limit(10);

    // Get recent orders
    const recentOrders = await Order.find({ farmer: farmerId })
      .populate('buyer', 'name email')
      .sort('-createdAt')
      .limit(10);

    // Get statistics
    const stats = await Order.getStatistics(farmerId);

    res.json({
      success: true,
      data: {
        crops,
        recentOrders,
        statistics: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0
        }
      }
    });
  } catch (error) {
    console.error('Farmer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

// @desc    Get all farmers (for buyers to browse)
// @route   GET /api/farmers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, location } = req.query;

    const query = { role: 'farmer', isActive: true };

    // Location filter if provided
    let locationFilter = {};
    if (location) {
      const [longitude, latitude, radius] = location.split(',').map(Number);
      if (longitude && latitude) {
        locationFilter = {
          'address.coordinates': {
            $near: {
              $geometry: { type: 'Point', coordinates: [longitude, latitude] },
              $maxDistance: (radius || 50) * 1000
            }
          }
        };
      }
    }

    const finalQuery = { ...query, ...locationFilter };

    const farmers = await User.find(finalQuery)
      .select('name profileImage address phone email')
      .sort('name')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(finalQuery);

    res.json({
      success: true,
      data: farmers,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farmers',
      error: error.message
    });
  }
});

module.exports = router;
