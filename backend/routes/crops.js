const express = require('express');
const Crop = require('../models/Crop');
const { protect, requireFarmer, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all crops with filtering, search, and pagination
// @route   GET /api/crops
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      location,
      organic,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {
      status: 'active',
      'availability.isAvailable': true,
      'quantity.available': { $gt: 0 }
    };

    // Add filters
    if (category) query.category = category;
    if (organic === 'true') query['quality.organic'] = true;
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Location-based search
    let locationFilter = {};
    if (location) {
      const [longitude, latitude, radius] = location.split(',').map(Number);
      if (longitude && latitude) {
        locationFilter = {
          'location.coordinates': {
            $near: {
              $geometry: { type: 'Point', coordinates: [longitude, latitude] },
              $maxDistance: (radius || 50) * 1000 // Default 50km radius
            }
          }
        };
      }
    }

    const finalQuery = { ...query, ...locationFilter };

    // Execute query with pagination
    const crops = await Crop.find(finalQuery)
      .populate('farmer', 'name profileImage address.city')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Crop.countDocuments(finalQuery);

    res.json({
      success: true,
      data: crops,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crops',
      error: error.message
    });
  }
});

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmer', 'name profileImage phone address rating');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Increment view count
    crop.statistics.views += 1;
    await crop.save();

    res.json({
      success: true,
      data: crop
    });
  } catch (error) {
    console.error('Get crop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crop',
      error: error.message
    });
  }
});

// @desc    Create new crop
// @route   POST /api/crops
// @access  Private (Farmers only)
router.post('/', protect, requireFarmer, async (req, res) => {
  try {
    const cropData = {
      ...req.body,
      farmer: req.user.userId
    };

    const crop = await Crop.create(cropData);
    await crop.populate('farmer', 'name profileImage address.city');

    res.status(201).json({
      success: true,
      message: 'Crop listed successfully',
      data: crop
    });
  } catch (error) {
    console.error('Create crop error:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating crop listing',
      error: error.message
    });
  }
});

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private (Crop owner only)
router.put('/:id', protect, requireFarmer, checkOwnership(Crop), async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('farmer', 'name profileImage address.city');

    res.json({
      success: true,
      message: 'Crop updated successfully',
      data: crop
    });
  } catch (error) {
    console.error('Update crop error:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating crop',
      error: error.message
    });
  }
});

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private (Crop owner only)
router.delete('/:id', protect, requireFarmer, checkOwnership(Crop), async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting crop',
      error: error.message
    });
  }
});

// @desc    Get nearby crops
// @route   GET /api/crops/nearby/:longitude/:latitude
// @access  Public
router.get('/nearby/:longitude/:latitude', async (req, res) => {
  try {
    const { longitude, latitude } = req.params;
    const { radius = 50 } = req.query; // Default 50km radius

    const crops = await Crop.findNearby(
      [parseFloat(longitude), parseFloat(latitude)], 
      parseFloat(radius)
    ).populate('farmer', 'name profileImage address.city');

    res.json({
      success: true,
      data: crops,
      count: crops.length
    });
  } catch (error) {
    console.error('Nearby crops error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding nearby crops',
      error: error.message
    });
  }
});

// @desc    Get crop categories with counts
// @route   GET /api/crops/stats/categories
// @access  Public
router.get('/stats/categories', async (req, res) => {
  try {
    const categories = await Crop.aggregate([
      {
        $match: {
          status: 'active',
          'availability.isAvailable': true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$pricing.basePrice' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Categories stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category statistics',
      error: error.message
    });
  }
});

module.exports = router;
