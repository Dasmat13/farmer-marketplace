const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true,
    maxLength: [100, 'Crop name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Vegetables', 'Fruits', 'Grains', 'Herbs', 'Legumes', 
      'Root Vegetables', 'Leafy Greens', 'Berries', 'Other'
    ]
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    url: String,
    alt: String
  }],
  quantity: {
    available: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'lbs', 'tons', 'pieces', 'boxes', 'bags']
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    pricePerUnit: String, // e.g., "per kg", "per piece"
    bulkDiscounts: [{
      minQuantity: Number,
      discountPercentage: Number
    }]
  },
  location: {
    farmName: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  availability: {
    harvestDate: Date,
    expiryDate: Date,
    isAvailable: {
      type: Boolean,
      default: true
    },
    seasonality: {
      seasons: [String], // ['Spring', 'Summer', 'Fall', 'Winter']
      months: [Number] // [1-12]
    }
  },
  quality: {
    organic: {
      type: Boolean,
      default: false
    },
    certifications: [String], // ['USDA Organic', 'Fair Trade', etc.]
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'Premium']
    }
  },
  shipping: {
    methods: [{
      type: String,
      enum: ['pickup', 'local_delivery', 'shipping']
    }],
    deliveryRadius: Number, // in miles/km
    shippingCost: Number
  },
  statistics: {
    views: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold_out', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
cropSchema.index({ farmer: 1 });
cropSchema.index({ category: 1 });
cropSchema.index({ 'location.coordinates': '2dsphere' });
cropSchema.index({ name: 'text', description: 'text', tags: 'text' });
cropSchema.index({ createdAt: -1 });
cropSchema.index({ 'availability.harvestDate': 1 });

// Virtual for predicted price
cropSchema.virtual('predictedPrice', {
  ref: 'Prediction',
  localField: '_id',
  foreignField: 'crop',
  justOne: true
});

// Method to check if crop is available
cropSchema.methods.isCurrentlyAvailable = function() {
  const now = new Date();
  return this.availability.isAvailable && 
         this.quantity.available > 0 &&
         (!this.availability.expiryDate || this.availability.expiryDate > now) &&
         this.status === 'active';
};

// Static method to find nearby crops
cropSchema.statics.findNearby = function(coordinates, maxDistance = 50) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    status: 'active',
    'availability.isAvailable': true,
    'quantity.available': { $gt: 0 }
  });
};

module.exports = mongoose.model('Crop', cropSchema);
