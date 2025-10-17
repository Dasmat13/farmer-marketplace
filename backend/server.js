const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 
      ['https://your-frontend-domain.com'] : 
      ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://your-frontend-domain.com'] : 
    ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api', require('./routes/chat'));
app.use('/api', require('./routes/orderTracking'));
app.use('/api', require('./routes/subscriptions'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: '🌾 Farmer Marketplace API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Socket.IO connection handling
const Chat = require('./models/Chat');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return next(new Error('User not found'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

io.use(authenticateSocket);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`User ${socket.user.name} connected`);

  // Join user to their personal room
  socket.join(`user_${socket.userId}`);

  // Join chat rooms
  socket.on('join_chat', async (chatId) => {
    try {
      // Verify user is part of this chat
      const chat = await Chat.findOne({
        _id: chatId,
        'participants.user': socket.userId
      });
      
      if (chat) {
        socket.join(`chat_${chatId}`);
        console.log(`User ${socket.user.name} joined chat ${chatId}`);
      }
    } catch (error) {
      console.error('Join chat error:', error);
    }
  });

  // Handle new messages
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content, type = 'text' } = data;

      // Find and validate chat
      const chat = await Chat.findOne({
        _id: chatId,
        'participants.user': socket.userId
      });

      if (!chat) {
        socket.emit('error', { message: 'Chat not found' });
        return;
      }

      // Add message to chat
      await chat.addMessage(socket.userId, content, type);

      // Populate sender info for the new message
      await chat.populate('messages.sender', 'name avatar');
      const newMessage = chat.messages[chat.messages.length - 1];

      // Broadcast to all participants in the chat
      io.to(`chat_${chatId}`).emit('new_message', {
        chatId,
        message: newMessage
      });

      // Send push notifications to offline users
      const otherParticipants = chat.participants.filter(p => 
        p.user.toString() !== socket.userId
      );

      otherParticipants.forEach(participant => {
        io.to(`user_${participant.user}`).emit('chat_notification', {
          chatId,
          message: newMessage,
          sender: socket.user.name
        });
      });

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { chatId, isTyping } = data;
    socket.to(`chat_${chatId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.user.name,
      isTyping
    });
  });

  // Handle marking messages as read
  socket.on('mark_read', async (data) => {
    try {
      const { chatId } = data;
      
      const chat = await Chat.findOne({
        _id: chatId,
        'participants.user': socket.userId
      });

      if (chat) {
        await chat.markAsRead(socket.userId);
        
        // Notify other participants that messages were read
        socket.to(`chat_${chatId}`).emit('messages_read', {
          chatId,
          readBy: socket.userId
        });
      }
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.user.name} disconnected`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`💬 Socket.IO enabled for real-time chat`);
});
