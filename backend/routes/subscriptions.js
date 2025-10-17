const express = require('express');
const router = express.Router();
const RecurringOrder = require('../models/RecurringOrder');
const OrderTracking = require('../models/OrderTracking');
const auth = require('../middleware/auth');

// Create a new subscription
router.post('/subscriptions', auth, async (req, res) => {
  try {
    const subscriptionData = {
      ...req.body,
      customer: req.user.id
    };
    
    // Set initial next delivery date if not provided
    if (!subscriptionData.nextDeliveryDate) {
      const subscription = new RecurringOrder(subscriptionData);
      subscription.calculateNextDeliveryDate();
      subscriptionData.nextDeliveryDate = subscription.nextDeliveryDate;
    }
    
    const subscription = new RecurringOrder(subscriptionData);
    await subscription.save();
    
    // Populate subscription details for response
    await subscription.populate([
      { path: 'customer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'items.crop', select: 'name category images price' }
    ]);
    
    res.status(201).json({
      success: true,
      subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
});

// Get user's subscriptions
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query based on user type
    let query = {};
    if (req.user.type === 'farmer') {
      query.farmer = req.user.id;
    } else {
      query.customer = req.user.id;
    }
    
    if (status) {
      query.status = status;
    }
    
    const subscriptions = await RecurringOrder.find(query)
      .populate('customer', 'name email phone')
      .populate('farmer', 'name email phone')
      .populate('items.crop', 'name category images price')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const totalSubscriptions = await RecurringOrder.countDocuments(query);
    
    res.json({
      success: true,
      subscriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalSubscriptions / limit),
        totalSubscriptions,
        hasNext: skip + subscriptions.length < totalSubscriptions,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions'
    });
  }
});

// Get specific subscription details
router.get('/subscriptions/:subscriptionId', auth, async (req, res) => {
  try {
    const subscription = await RecurringOrder.findOne({
      $or: [
        { subscriptionId: req.params.subscriptionId },
        { _id: req.params.subscriptionId }
      ]
    })
    .populate('customer', 'name email phone')
    .populate('farmer', 'name email phone')
    .populate('items.crop', 'name category images price')
    .populate('deliveryHistory.orderId');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check if user has permission to view this subscription
    if (subscription.customer._id.toString() !== req.user.id && 
        subscription.farmer._id.toString() !== req.user.id &&
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get subscription details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details'
    });
  }
});

// Update subscription details
router.patch('/subscriptions/:subscriptionId', auth, async (req, res) => {
  try {
    const subscription = await RecurringOrder.findOne({
      $or: [
        { subscriptionId: req.params.subscriptionId },
        { _id: req.params.subscriptionId }
      ]
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check permissions
    if (subscription.customer.toString() !== req.user.id && 
        subscription.farmer.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'items', 'deliveryAddress', 'deliveryWindow',
      'budget', 'flexibility', 'notifications', 'customerNotes', 'farmerNotes'
    ];
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        subscription[key] = req.body[key];
      }
    });
    
    // Recalculate next delivery if frequency changed
    if (req.body.frequency) {
      subscription.frequency = req.body.frequency;
      if (req.body.customFrequencyDays) {
        subscription.customFrequencyDays = req.body.customFrequencyDays;
      }
      subscription.calculateNextDeliveryDate();
    }
    
    await subscription.save();
    
    res.json({
      success: true,
      subscription,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription'
    });
  }
});

// Pause subscription
router.patch('/subscriptions/:subscriptionId/pause', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const subscription = await RecurringOrder.findOne({
      $or: [
        { subscriptionId: req.params.subscriptionId },
        { _id: req.params.subscriptionId }
      ]
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check permissions
    if (subscription.customer.toString() !== req.user.id && 
        subscription.farmer.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active subscriptions can be paused'
      });
    }
    
    await subscription.pause(reason, req.user.id);
    
    res.json({
      success: true,
      message: 'Subscription paused successfully'
    });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause subscription'
    });
  }
});

// Resume subscription
router.patch('/subscriptions/:subscriptionId/resume', auth, async (req, res) => {
  try {
    const subscription = await RecurringOrder.findOne({
      $or: [
        { subscriptionId: req.params.subscriptionId },
        { _id: req.params.subscriptionId }
      ]
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check permissions
    if (subscription.customer.toString() !== req.user.id && 
        subscription.farmer.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (subscription.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Only paused subscriptions can be resumed'
      });
    }
    
    await subscription.resume();
    
    res.json({
      success: true,
      message: 'Subscription resumed successfully',
      nextDeliveryDate: subscription.nextDeliveryDate
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume subscription'
    });
  }
});

// Cancel subscription
router.patch('/subscriptions/:subscriptionId/cancel', auth, async (req, res) => {
  try {
    const { reason, refundAmount } = req.body;
    
    const subscription = await RecurringOrder.findOne({
      $or: [
        { subscriptionId: req.params.subscriptionId },
        { _id: req.params.subscriptionId }
      ]
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check permissions
    if (subscription.customer.toString() !== req.user.id && 
        subscription.farmer.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled'
      });
    }
    
    await subscription.cancel(reason, req.user.id, refundAmount || 0);
    
    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription'
    });
  }
});

// Rate a delivery
router.post('/subscriptions/:subscriptionId/rate', auth, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    const subscription = await RecurringOrder.findOne({
      $or: [
        { subscriptionId: req.params.subscriptionId },
        { _id: req.params.subscriptionId }
      ]
    });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Only customers can rate deliveries
    if (subscription.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only customers can rate deliveries'
      });
    }
    
    await subscription.updateSatisfactionRating(rating, feedback);
    
    res.json({
      success: true,
      message: 'Delivery rated successfully'
    });
  } catch (error) {
    console.error('Rate delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate delivery'
    });
  }
});

// Get due deliveries (for automated processing)
router.get('/subscriptions/due/deliveries', auth, async (req, res) => {
  try {
    // Only allow admin or system users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const dueDeliveries = await RecurringOrder.getDueDeliveries(targetDate);
    
    res.json({
      success: true,
      deliveries: dueDeliveries,
      count: dueDeliveries.length,
      date: targetDate.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Get due deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch due deliveries'
    });
  }
});

// Get upcoming deliveries
router.get('/subscriptions/upcoming/deliveries', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // Build query based on user type
    let upcomingDeliveries = await RecurringOrder.getUpcomingDeliveries(parseInt(days));
    
    // Filter by user permissions
    if (req.user.type === 'farmer') {
      upcomingDeliveries = upcomingDeliveries.filter(sub => 
        sub.farmer._id.toString() === req.user.id
      );
    } else if (req.user.type !== 'admin') {
      upcomingDeliveries = upcomingDeliveries.filter(sub => 
        sub.customer._id.toString() === req.user.id
      );
    }
    
    res.json({
      success: true,
      deliveries: upcomingDeliveries,
      count: upcomingDeliveries.length,
      daysAhead: parseInt(days)
    });
  } catch (error) {
    console.error('Get upcoming deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming deliveries'
    });
  }
});

// Process a subscription delivery (create order)
router.post('/subscriptions/:subscriptionId/process-delivery', auth, async (req, res) => {
  try {
    const subscription = await RecurringOrder.findOne({
      $or: [
        { subscriptionId: req.params.subscriptionId },
        { _id: req.params.subscriptionId }
      ]
    })
    .populate('items.crop', 'name category price availability')
    .populate('customer', 'name email phone')
    .populate('farmer', 'name email phone');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Only farmers or admins can process deliveries
    if (subscription.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is not active'
      });
    }
    
    // Create order from subscription
    const orderData = {
      buyer: subscription.customer._id,
      farmer: subscription.farmer._id,
      items: subscription.items.map(item => ({
        crop: item.crop._id,
        quantity: item.quantity,
        pricePerUnit: item.crop.price,
        totalPrice: item.quantity * item.crop.price,
        specialInstructions: item.specialInstructions
      })),
      subtotal: subscription.items.reduce((sum, item) => sum + (item.quantity * item.crop.price), 0),
      deliveryFee: subscription.pricing.baseDeliveryFee,
      totalAmount: 0, // Will be calculated
      deliveryAddress: subscription.deliveryAddress,
      deliveryMethod: 'home_delivery',
      isRecurring: true,
      recurringOrderId: subscription._id,
      orderSource: 'recurring'
    };
    
    // Apply discounts
    const discountAmount = orderData.subtotal * (subscription.pricing.discountPercentage / 100);
    orderData.discount = discountAmount;
    orderData.totalAmount = orderData.subtotal + orderData.deliveryFee - discountAmount;
    
    // Create the order
    const order = new OrderTracking(orderData);
    await order.save();
    
    // Update subscription delivery history
    const deliveredItems = subscription.items.map(item => ({
      crop: item.crop._id,
      quantity: item.quantity,
      price: item.crop.price
    }));
    
    await subscription.addDeliveryRecord(order._id, deliveredItems, orderData.totalAmount);
    
    res.json({
      success: true,
      message: 'Delivery processed successfully',
      order: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        nextDeliveryDate: subscription.nextDeliveryDate
      }
    });
  } catch (error) {
    console.error('Process delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process delivery'
    });
  }
});

// Get subscription analytics
router.get('/analytics/subscriptions', auth, async (req, res) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    let timeframeDays;
    switch (timeframe) {
      case '7d':
        timeframeDays = 7;
        break;
      case '30d':
        timeframeDays = 30;
        break;
      case '90d':
        timeframeDays = 90;
        break;
      default:
        timeframeDays = 30;
    }
    
    let matchQuery = {};
    if (req.user.type === 'farmer') {
      matchQuery.farmer = req.user.id;
    } else if (req.user.type !== 'admin') {
      matchQuery.customer = req.user.id;
    }
    
    const analytics = await RecurringOrder.getSubscriptionAnalytics(
      req.user.type === 'farmer' ? req.user.id : null,
      timeframeDays
    );
    
    // Get additional metrics
    const totalSubscriptions = await RecurringOrder.countDocuments(matchQuery);
    const activeSubscriptions = await RecurringOrder.countDocuments({
      ...matchQuery,
      status: 'active'
    });
    
    res.json({
      success: true,
      timeframe,
      analytics,
      summary: {
        totalSubscriptions,
        activeSubscriptions,
        activeRate: totalSubscriptions > 0 ? (activeSubscriptions / totalSubscriptions) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Get subscription analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription analytics'
    });
  }
});

module.exports = router;
