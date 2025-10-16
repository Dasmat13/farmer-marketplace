const express = require('express');
const router = express.Router();
const OrderTracking = require('../models/OrderTracking');
const auth = require('../middleware/auth');

// Create a new order with tracking
router.post('/orders', auth, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      buyer: req.user.id
    };
    
    const order = new OrderTracking(orderData);
    await order.save();
    
    // Populate order details for response
    await order.populate([
      { path: 'buyer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'items.crop', select: 'name category images price' }
    ]);
    
    res.status(201).json({
      success: true,
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Get all orders for a user (buyer or farmer)
router.get('/orders', auth, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query based on user type
    let query = {};
    if (req.user.type === 'farmer') {
      query.farmer = req.user.id;
    } else {
      query.buyer = req.user.id;
    }
    
    if (status) {
      query.currentStatus = status;
    }
    
    const orders = await OrderTracking.find(query)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name email phone')
      .populate('items.crop', 'name category images')
      .sort({ orderDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const totalOrders = await OrderTracking.countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        hasNext: skip + orders.length < totalOrders,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Get specific order details by ID
router.get('/orders/:orderId', auth, async (req, res) => {
  try {
    const order = await OrderTracking.findOne({
      $or: [{ orderId: req.params.orderId }, { _id: req.params.orderId }]
    })
    .populate('buyer', 'name email phone')
    .populate('farmer', 'name email phone')
    .populate('items.crop', 'name category images price')
    .populate('tracking.updatedBy', 'name');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user has permission to view this order
    if (order.buyer._id.toString() !== req.user.id && 
        order.farmer._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      order,
      estimatedDelivery: order.getEstimatedDelivery()
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
});

// Track order by tracking number (public endpoint)
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const order = await OrderTracking.findByTrackingNumber(req.params.trackingNumber);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this tracking number'
      });
    }
    
    // Return limited public information
    const publicOrderInfo = {
      orderId: order.orderId,
      currentStatus: order.currentStatus,
      tracking: order.tracking.map(t => ({
        status: t.status,
        timestamp: t.timestamp,
        location: t.location,
        notes: t.notes,
        estimatedDelivery: t.estimatedDelivery
      })),
      estimatedDelivery: order.getEstimatedDelivery(),
      deliveryMethod: order.deliveryMethod,
      logisticsProvider: {
        name: order.logisticsProvider.name,
        serviceLevel: order.logisticsProvider.serviceLevel
      }
    };
    
    res.json({
      success: true,
      order: publicOrderInfo
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track order'
    });
  }
});

// Add tracking update (farmers and logistics providers)
router.post('/orders/:orderId/tracking', auth, async (req, res) => {
  try {
    const { status, location, notes, estimatedDelivery, driverInfo } = req.body;
    
    const order = await OrderTracking.findOne({
      $or: [{ orderId: req.params.orderId }, { _id: req.params.orderId }]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user has permission to update tracking
    if (order.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Add tracking update
    const trackingUpdate = {
      status,
      location,
      notes,
      updatedBy: req.user.id,
      timestamp: new Date()
    };
    
    if (estimatedDelivery) {
      trackingUpdate.estimatedDelivery = new Date(estimatedDelivery);
    }
    
    if (driverInfo) {
      trackingUpdate.driverInfo = driverInfo;
    }
    
    order.tracking.push(trackingUpdate);
    order.currentStatus = status;
    
    // Send notifications to buyer
    const notificationMessage = getStatusUpdateMessage(status, order.items[0]?.crop?.name);
    await order.sendNotification('in_app', order.buyer, notificationMessage);
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Tracking updated successfully',
      currentStatus: order.currentStatus,
      estimatedDelivery: order.getEstimatedDelivery()
    });
  } catch (error) {
    console.error('Add tracking update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tracking'
    });
  }
});

// Update delivery window
router.patch('/orders/:orderId/delivery-window', auth, async (req, res) => {
  try {
    const { startTime, endTime, timeSlot } = req.body;
    
    const order = await OrderTracking.findOne({
      $or: [{ orderId: req.params.orderId }, { _id: req.params.orderId }]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check permissions
    if (order.farmer.toString() !== req.user.id && 
        order.buyer.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    order.deliveryWindow = {
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      timeSlot
    };
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Delivery window updated successfully',
      deliveryWindow: order.deliveryWindow
    });
  } catch (error) {
    console.error('Update delivery window error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update delivery window'
    });
  }
});

// Rate order quality (buyers only)
router.post('/orders/:orderId/rate', auth, async (req, res) => {
  try {
    const { rating, feedback, photos } = req.body;
    
    const order = await OrderTracking.findOne({
      $or: [{ orderId: req.params.orderId }, { _id: req.params.orderId }]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Only buyers can rate orders
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers can rate orders'
      });
    }
    
    // Only rate delivered orders
    if (order.currentStatus !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }
    
    order.qualityRating = {
      rating,
      feedback,
      photos: photos || [],
      timestamp: new Date()
    };
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order rated successfully'
    });
  } catch (error) {
    console.error('Rate order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate order'
    });
  }
});

// Get orders scheduled for delivery today
router.get('/logistics/daily-deliveries', auth, async (req, res) => {
  try {
    const { date = new Date() } = req.query;
    const deliveryDate = new Date(date);
    
    const orders = await OrderTracking.getOrdersForDelivery(deliveryDate);
    
    res.json({
      success: true,
      orders,
      date: deliveryDate.toISOString().split('T')[0],
      totalDeliveries: orders.length
    });
  } catch (error) {
    console.error('Get daily deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily deliveries'
    });
  }
});

// Cancel order
router.patch('/orders/:orderId/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await OrderTracking.findOne({
      $or: [{ orderId: req.params.orderId }, { _id: req.params.orderId }]
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check permissions and cancellation eligibility
    if (order.buyer.toString() !== req.user.id && 
        order.farmer.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (!['pending', 'confirmed', 'preparing'].includes(order.currentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }
    
    // Add cancellation tracking
    await order.addTrackingUpdate('cancelled', null, reason || 'Order cancelled', req.user.id);
    
    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

// Get order statistics
router.get('/analytics/order-stats', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    let matchQuery = { orderDate: { $gte: startDate } };
    if (req.user.type === 'farmer') {
      matchQuery.farmer = req.user.id;
    } else {
      matchQuery.buyer = req.user.id;
    }
    
    const stats = await OrderTracking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageOrderValue: { $avg: '$totalAmount' },
          statusBreakdown: {
            $push: {
              status: '$currentStatus',
              amount: '$totalAmount'
            }
          }
        }
      }
    ]);
    
    const statusStats = await OrderTracking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$currentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      timeframe,
      stats: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
      statusBreakdown: statusStats
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics'
    });
  }
});

// Helper function for status update messages
function getStatusUpdateMessage(status, cropName = 'crops') {
  const messages = {
    confirmed: `Your order for ${cropName} has been confirmed and is being prepared.`,
    preparing: `Your ${cropName} order is being prepared for shipment.`,
    packed: `Your ${cropName} order has been packed and is ready for pickup/shipment.`,
    shipped: `Your ${cropName} order is on its way! You'll receive tracking details soon.`,
    out_for_delivery: `Your ${cropName} order is out for delivery and will arrive today.`,
    delivered: `Your ${cropName} order has been delivered! We hope you enjoy your fresh produce.`,
    cancelled: `Your ${cropName} order has been cancelled. If you have questions, please contact support.`,
    returned: `Your ${cropName} order is being returned. Please check your account for details.`
  };
  
  return messages[status] || `Your ${cropName} order status has been updated to ${status}.`;
}

module.exports = router;
