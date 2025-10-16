const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const User = require('../models/User');
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');

// Get user's chat list
router.get('/chats', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      'participants.user': req.user.id,
      status: 'active'
    })
    .populate('participants.user', 'name email type avatar')
    .populate('relatedCrop', 'name category farmer images')
    .sort({ lastActivity: -1 })
    .limit(50);

    // Format response with unread counts
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => 
        p.user._id.toString() !== req.user.id.toString()
      );
      
      const userType = req.user.type === 'farmer' ? 'farmer' : 'buyer';
      const unreadCount = chat.metadata.unreadCount[userType] || 0;
      
      const lastMessage = chat.messages.length > 0 ? 
        chat.messages[chat.messages.length - 1] : null;

      return {
        id: chat._id,
        otherUser: otherParticipant?.user,
        relatedCrop: chat.relatedCrop,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          timestamp: lastMessage.timestamp,
          sender: lastMessage.sender
        } : null,
        unreadCount,
        lastActivity: chat.lastActivity
      };
    });

    res.json({ chats: formattedChats });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific chat messages
router.get('/chats/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user.id
    })
    .populate('participants.user', 'name email type avatar')
    .populate('relatedCrop', 'name category farmer images')
    .populate('messages.sender', 'name avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Mark messages as read
    await chat.markAsRead(req.user.id);

    res.json({ chat });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start new chat or get existing one
router.post('/chats/start', auth, async (req, res) => {
  try {
    const { recipientId, cropId, initialMessage } = req.body;

    // Validate recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if chat already exists
    let chat = await Chat.findChatBetweenUsers(req.user.id, recipientId, cropId);

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [
          { user: req.user.id },
          { user: recipientId }
        ],
        relatedCrop: cropId || null
      });
    }

    // Add initial message if provided
    if (initialMessage) {
      await chat.addMessage(req.user.id, initialMessage);
    }

    // Populate data for response
    await chat.populate([
      { path: 'participants.user', select: 'name email type avatar' },
      { path: 'relatedCrop', select: 'name category farmer images' },
      { path: 'messages.sender', select: 'name avatar' }
    ]);

    res.status(201).json({ chat });
  } catch (error) {
    console.error('Start chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message via REST (backup for when WebSocket is unavailable)
router.post('/chats/:chatId/messages', auth, async (req, res) => {
  try {
    const { content, type = 'text' } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user.id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    await chat.addMessage(req.user.id, content, type);

    // Get the newly added message with populated sender
    await chat.populate('messages.sender', 'name avatar');
    const newMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive/delete chat
router.patch('/chats/:chatId/archive', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user.id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    chat.status = 'archived';
    await chat.save();

    res.json({ message: 'Chat archived successfully' });
  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search chat messages
router.get('/chats/:chatId/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query required' });
    }

    const chat = await Chat.findOne({
      _id: req.params.chatId,
      'participants.user': req.user.id
    }).populate('messages.sender', 'name avatar');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Simple text search in messages
    const searchResults = chat.messages.filter(message =>
      message.content.toLowerCase().includes(q.toLowerCase())
    ).slice(-50); // Limit to last 50 matches

    res.json({ results: searchResults, query: q });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/chats/unread/count', auth, async (req, res) => {
  try {
    const userType = req.user.type === 'farmer' ? 'farmer' : 'buyer';
    
    const chats = await Chat.find({
      'participants.user': req.user.id,
      status: 'active'
    });

    const totalUnread = chats.reduce((total, chat) => {
      return total + (chat.metadata.unreadCount[userType] || 0);
    }, 0);

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
