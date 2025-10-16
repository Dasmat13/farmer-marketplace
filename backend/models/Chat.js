const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'order_inquiry', 'system'],
    default: 'text'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  attachments: [{
    type: String,
    url: String
  }]
});

const chatSchema = new mongoose.Schema({
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [messageSchema],
  relatedCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'blocked'],
    default: 'active'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    unreadCount: {
      farmer: { type: Number, default: 0 },
      buyer: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSchema.index({ participants: 1, lastActivity: -1 });
chatSchema.index({ 'messages.timestamp': -1 });
chatSchema.index({ relatedCrop: 1 });

// Update last activity when messages are added
chatSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = Date.now();
    this.metadata.totalMessages = this.messages.length;
  }
  next();
});

// Static method to find chat between two users
chatSchema.statics.findChatBetweenUsers = function(userId1, userId2, cropId = null) {
  const query = {
    'participants.user': { $all: [userId1, userId2] }
  };
  
  if (cropId) {
    query.relatedCrop = cropId;
  }
  
  return this.findOne(query)
    .populate('participants.user', 'name email type avatar')
    .populate('relatedCrop', 'name category farmer')
    .populate('messages.sender', 'name avatar');
};

// Instance method to add message
chatSchema.methods.addMessage = function(senderId, content, type = 'text') {
  this.messages.push({
    sender: senderId,
    content,
    type,
    timestamp: new Date()
  });
  
  // Update unread counts
  this.participants.forEach(participant => {
    if (participant.user.toString() !== senderId.toString()) {
      const userType = participant.user.type === 'farmer' ? 'farmer' : 'buyer';
      this.metadata.unreadCount[userType]++;
    }
  });
  
  return this.save();
};

// Instance method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
  this.messages.forEach(message => {
    if (message.sender.toString() !== userId.toString()) {
      message.isRead = true;
    }
  });
  
  // Reset unread count for this user
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    const userType = participant.user.type === 'farmer' ? 'farmer' : 'buyer';
    this.metadata.unreadCount[userType] = 0;
    participant.lastSeen = new Date();
  }
  
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
