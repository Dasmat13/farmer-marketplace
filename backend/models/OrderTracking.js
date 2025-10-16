const mongoose = require('mongoose');

// Delivery tracking schema for GPS and status updates
const deliveryTrackingSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  notes: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  driverInfo: {
    name: String,
    phone: String,
    vehicleType: String,
    licensePlate: String
  }
});

// Main order schema with enhanced tracking
const orderTrackingSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
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
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    specialInstructions: String
  }],
  
  // Order totals
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Delivery information
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'USA' },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    deliveryInstructions: String,
    contactPhone: String
  },
  
  // Pickup information (if customer pickup)
  pickupAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    availableHours: String,
    contactPhone: String
  },
  
  // Delivery method and logistics
  deliveryMethod: {
    type: String,
    enum: ['home_delivery', 'pickup', 'local_hub', 'shipping'],
    default: 'home_delivery'
  },
  deliveryWindow: {
    startTime: Date,
    endTime: Date,
    timeSlot: String // e.g., "9 AM - 12 PM"
  },
  
  // Enhanced tracking
  tracking: [deliveryTrackingSchema],
  currentStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  // Logistics provider integration
  logisticsProvider: {
    name: String, // e.g., "FedEx", "Local Delivery", "Farmer Direct"
    trackingNumber: String,
    serviceLevel: String, // e.g., "standard", "express", "same_day"
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  
  // Quality and satisfaction tracking
  qualityRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    photos: [String],
    timestamp: Date
  },
  
  // Communication and notifications
  notifications: [{
    type: {
      type: String,
      enum: ['sms', 'email', 'push', 'in_app']
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Weather and external factors
  weatherImpact: {
    forecast: String,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    adjustments: String
  },
  
  // Financial tracking
  payment: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    method: String,
    transactionId: String,
    paidAt: Date,
    farmerPayout: {
      amount: Number,
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
      },
      paidAt: Date,
      transactionId: String
    }
  },
  
  // Order lifecycle dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Additional metadata
  orderSource: {
    type: String,
    enum: ['web', 'mobile', 'recurring', 'bulk'],
    default: 'web'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringOrder'
  },
  specialRequests: String,
  internalNotes: String
}, {
  timestamps: true
});

// Indexes for efficient queries
orderTrackingSchema.index({ orderId: 1 });
orderTrackingSchema.index({ buyer: 1, orderDate: -1 });
orderTrackingSchema.index({ farmer: 1, orderDate: -1 });
orderTrackingSchema.index({ currentStatus: 1 });
orderTrackingSchema.index({ 'deliveryWindow.startTime': 1 });
orderTrackingSchema.index({ 'logisticsProvider.trackingNumber': 1 });

// Generate unique order ID
orderTrackingSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.orderId = `FM-${timestamp}-${random}`.toUpperCase();
  }
  
  // Update currentStatus from latest tracking entry
  if (this.tracking && this.tracking.length > 0) {
    this.currentStatus = this.tracking[this.tracking.length - 1].status;
  }
  
  // Set delivery timestamps based on status
  if (this.currentStatus === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  if (this.currentStatus === 'shipped' && !this.shippedAt) {
    this.shippedAt = new Date();
  }
  if (this.currentStatus === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  
  next();
});

// Instance methods
orderTrackingSchema.methods.addTrackingUpdate = function(status, location, notes, updatedBy) {
  this.tracking.push({
    status,
    location,
    notes,
    updatedBy,
    timestamp: new Date()
  });
  this.currentStatus = status;
  return this.save();
};

orderTrackingSchema.methods.updateDeliveryEstimate = function(estimatedDelivery) {
  if (this.tracking.length > 0) {
    this.tracking[this.tracking.length - 1].estimatedDelivery = estimatedDelivery;
  }
  this.logisticsProvider.estimatedDelivery = estimatedDelivery;
  return this.save();
};

orderTrackingSchema.methods.sendNotification = function(type, recipient, message) {
  this.notifications.push({
    type,
    recipient,
    message,
    timestamp: new Date()
  });
  return this.save();
};

orderTrackingSchema.methods.getEstimatedDelivery = function() {
  if (this.logisticsProvider.estimatedDelivery) {
    return this.logisticsProvider.estimatedDelivery;
  }
  
  if (this.tracking.length > 0) {
    const latestTracking = this.tracking[this.tracking.length - 1];
    if (latestTracking.estimatedDelivery) {
      return latestTracking.estimatedDelivery;
    }
  }
  
  // Default estimation based on delivery method
  const now = new Date();
  switch (this.deliveryMethod) {
    case 'pickup':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next day
    case 'home_delivery':
      return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
    case 'shipping':
      return new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days
    default:
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
  }
};

// Static methods
orderTrackingSchema.statics.findByTrackingNumber = function(trackingNumber) {
  return this.findOne({ 'logisticsProvider.trackingNumber': trackingNumber })
    .populate('buyer', 'name email phone')
    .populate('farmer', 'name email phone')
    .populate('items.crop', 'name category images');
};

orderTrackingSchema.statics.getOrdersForDelivery = function(date, status = 'out_for_delivery') {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.find({
    currentStatus: status,
    'deliveryWindow.startTime': { $gte: startOfDay, $lte: endOfDay }
  })
  .populate('buyer', 'name phone')
  .populate('farmer', 'name phone')
  .sort({ 'deliveryWindow.startTime': 1 });
};

module.exports = mongoose.model('OrderTracking', orderTrackingSchema);
