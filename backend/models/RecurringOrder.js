const mongoose = require('mongoose');

// Schema for recurring order items
const recurringItemSchema = new mongoose.Schema({
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  maxPricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  substitutionAllowed: {
    type: Boolean,
    default: false
  },
  acceptableSubstitutes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }],
  seasonalAdjustment: {
    enabled: { type: Boolean, default: true },
    minQuantity: Number,
    maxQuantity: Number
  }
});

// Main recurring order schema
const recurringOrderSchema = new mongoose.Schema({
  subscriptionId: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Subscription details
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: String,
  
  // Items in the subscription
  items: [recurringItemSchema],
  
  // Delivery schedule
  frequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'custom'],
    required: true
  },
  customFrequencyDays: {
    type: Number,
    min: 1,
    max: 365
  },
  
  // Delivery preferences
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' },
    deliveryInstructions: String,
    contactPhone: String
  },
  
  deliveryWindow: {
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime']
    },
    avoidDates: [Date] // Holidays, vacation dates, etc.
  },
  
  // Subscription status and lifecycle
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  
  // Billing and pricing
  budget: {
    maxPerDelivery: {
      type: Number,
      min: 0
    },
    maxPerMonth: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  pricing: {
    baseDeliveryFee: {
      type: Number,
      default: 0
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    loyaltyDiscount: {
      type: Number,
      min: 0,
      max: 50,
      default: 0
    }
  },
  
  // Subscription lifecycle dates
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  nextDeliveryDate: Date,
  lastDeliveryDate: Date,
  
  // Delivery history and tracking
  deliveryHistory: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderTracking'
    },
    deliveredDate: Date,
    totalAmount: Number,
    itemsDelivered: [{
      crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
      quantity: Number,
      price: Number
    }],
    customerSatisfaction: {
      rating: { type: Number, min: 1, max: 5 },
      feedback: String,
      timestamp: Date
    }
  }],
  
  // Flexible delivery options
  flexibility: {
    allowQuantityAdjustment: {
      type: Boolean,
      default: true
    },
    allowPriceAdjustment: {
      type: Boolean,
      default: false
    },
    allowItemSubstitution: {
      type: Boolean,
      default: false
    },
    allowDateShifting: {
      type: Boolean,
      default: true
    },
    maxDateShiftDays: {
      type: Number,
      default: 3
    }
  },
  
  // Notifications and communication
  notifications: {
    upcomingDelivery: {
      enabled: { type: Boolean, default: true },
      daysBefore: { type: Number, default: 1 }
    },
    priceChanges: {
      enabled: { type: Boolean, default: true },
      threshold: { type: Number, default: 10 } // percentage
    },
    itemUnavailable: {
      enabled: { type: Boolean, default: true }
    },
    deliveryConfirmation: {
      enabled: { type: Boolean, default: true }
    }
  },
  
  // Advanced features
  seasonalAdjustments: {
    enabled: { type: Boolean, default: true },
    adjustmentRules: [{
      season: {
        type: String,
        enum: ['spring', 'summer', 'fall', 'winter']
      },
      cropAdjustments: [{
        crop: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
        quantityMultiplier: { type: Number, default: 1 },
        substitute: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }
      }]
    }]
  },
  
  // Subscription metrics
  metrics: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    satisfactionScore: { type: Number, default: 0 },
    missedDeliveries: { type: Number, default: 0 },
    pausedDays: { type: Number, default: 0 }
  },
  
  // Payment information
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'bank_account', 'digital_wallet']
    },
    isDefault: { type: Boolean, default: false },
    lastFour: String,
    expiryDate: String,
    paymentProcessorId: String // Stripe customer ID, etc.
  },
  
  // Special instructions and notes
  customerNotes: String,
  farmerNotes: String,
  internalNotes: String,
  
  // Cancellation and pause tracking
  pauseHistory: [{
    pausedDate: Date,
    resumedDate: Date,
    reason: String,
    pausedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  cancellationDetails: {
    cancelledDate: Date,
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundAmount: Number,
    feedbackProvided: Boolean
  }
}, {
  timestamps: true
});

// Indexes for performance
recurringOrderSchema.index({ customer: 1, status: 1 });
recurringOrderSchema.index({ farmer: 1, status: 1 });
recurringOrderSchema.index({ subscriptionId: 1 });
recurringOrderSchema.index({ nextDeliveryDate: 1 });
recurringOrderSchema.index({ status: 1, nextDeliveryDate: 1 });

// Generate unique subscription ID
recurringOrderSchema.pre('save', function(next) {
  if (this.isNew && !this.subscriptionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.subscriptionId = `SUB-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Instance methods
recurringOrderSchema.methods.calculateNextDeliveryDate = function() {
  const currentDate = this.nextDeliveryDate || new Date();
  let nextDate = new Date(currentDate);
  
  switch (this.frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'custom':
      if (this.customFrequencyDays) {
        nextDate.setDate(nextDate.getDate() + this.customFrequencyDays);
      }
      break;
  }
  
  // Avoid delivery on avoided dates
  while (this.deliveryWindow.avoidDates.some(date => 
    date.toDateString() === nextDate.toDateString()
  )) {
    nextDate.setDate(nextDate.getDate() + 1);
  }
  
  this.nextDeliveryDate = nextDate;
  return nextDate;
};

recurringOrderSchema.methods.pause = function(reason, pausedBy) {
  this.status = 'paused';
  this.pauseHistory.push({
    pausedDate: new Date(),
    reason,
    pausedBy
  });
  return this.save();
};

recurringOrderSchema.methods.resume = function() {
  if (this.status === 'paused') {
    this.status = 'active';
    const lastPause = this.pauseHistory[this.pauseHistory.length - 1];
    if (lastPause && !lastPause.resumedDate) {
      lastPause.resumedDate = new Date();
      
      // Update paused days metric
      const pausedDays = Math.ceil((new Date() - lastPause.pausedDate) / (1000 * 60 * 60 * 24));
      this.metrics.pausedDays += pausedDays;
    }
    
    // Recalculate next delivery date
    this.calculateNextDeliveryDate();
  }
  return this.save();
};

recurringOrderSchema.methods.cancel = function(reason, cancelledBy, refundAmount = 0) {
  this.status = 'cancelled';
  this.cancellationDetails = {
    cancelledDate: new Date(),
    reason,
    cancelledBy,
    refundAmount,
    feedbackProvided: false
  };
  return this.save();
};

recurringOrderSchema.methods.addDeliveryRecord = function(orderId, deliveredItems, totalAmount) {
  this.deliveryHistory.push({
    orderId,
    deliveredDate: new Date(),
    totalAmount,
    itemsDelivered: deliveredItems
  });
  
  // Update metrics
  this.metrics.totalOrders += 1;
  this.metrics.totalSpent += totalAmount;
  this.metrics.averageOrderValue = this.metrics.totalSpent / this.metrics.totalOrders;
  this.lastDeliveryDate = new Date();
  
  // Calculate next delivery date
  this.calculateNextDeliveryDate();
  
  return this.save();
};

recurringOrderSchema.methods.updateSatisfactionRating = function(rating, feedback) {
  const lastDelivery = this.deliveryHistory[this.deliveryHistory.length - 1];
  if (lastDelivery) {
    lastDelivery.customerSatisfaction = {
      rating,
      feedback,
      timestamp: new Date()
    };
    
    // Update average satisfaction score
    const ratingsCount = this.deliveryHistory.filter(d => d.customerSatisfaction?.rating).length;
    const totalRating = this.deliveryHistory.reduce((sum, d) => sum + (d.customerSatisfaction?.rating || 0), 0);
    this.metrics.satisfactionScore = ratingsCount > 0 ? totalRating / ratingsCount : 0;
  }
  return this.save();
};

// Static methods
recurringOrderSchema.statics.getDueDeliveries = function(date = new Date()) {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    status: 'active',
    nextDeliveryDate: { $lte: endOfDay }
  })
  .populate('customer', 'name email phone')
  .populate('farmer', 'name email phone')
  .populate('items.crop', 'name category price availability')
  .sort({ nextDeliveryDate: 1 });
};

recurringOrderSchema.statics.getUpcomingDeliveries = function(daysAhead = 7) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  
  return this.find({
    status: 'active',
    nextDeliveryDate: { $gte: now, $lte: futureDate }
  })
  .populate('customer', 'name email phone')
  .populate('farmer', 'name email phone')
  .sort({ nextDeliveryDate: 1 });
};

recurringOrderSchema.statics.getSubscriptionAnalytics = function(farmerId, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  return this.aggregate([
    {
      $match: {
        farmer: farmerId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$metrics.totalSpent' },
        averageSatisfaction: { $avg: '$metrics.satisfactionScore' }
      }
    }
  ]);
};

module.exports = mongoose.model('RecurringOrder', recurringOrderSchema);
