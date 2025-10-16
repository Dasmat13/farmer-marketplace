import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  type: 'text' | 'image' | 'order_inquiry' | 'system';
  timestamp: string;
  isRead: boolean;
  editedAt?: string;
  attachments?: Array<{
    type: string;
    url: string;
  }>;
}

export interface ChatParticipant {
  user: {
    _id: string;
    name: string;
    email: string;
    type: 'farmer' | 'buyer';
    avatar?: string;
  };
  joinedAt: string;
  lastSeen: string;
}

export interface Chat {
  _id: string;
  participants: ChatParticipant[];
  messages: ChatMessage[];
  relatedCrop?: {
    _id: string;
    name: string;
    category: string;
    farmer: string;
    images: string[];
  };
  relatedOrder?: string;
  status: 'active' | 'archived' | 'blocked';
  lastActivity: string;
  metadata: {
    totalMessages: number;
    unreadCount: {
      farmer: number;
      buyer: number;
    };
  };
}

export interface ChatListItem {
  id: string;
  otherUser: {
    _id: string;
    name: string;
    email: string;
    type: 'farmer' | 'buyer';
    avatar?: string;
  };
  relatedCrop?: {
    _id: string;
    name: string;
    category: string;
    farmer: string;
    images: string[];
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    sender: string;
  };
  unreadCount: number;
  lastActivity: string;
}

class ChatService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Event listeners
  private messageListeners: Array<(message: ChatMessage, chatId: string) => void> = [];
  private chatNotificationListeners: Array<(notification: any) => void> = [];
  private typingListeners: Array<(data: { userId: string; userName: string; isTyping: boolean; chatId: string }) => void> = [];
  private connectionListeners: Array<(connected: boolean) => void> = [];

  connect(token: string) {
    if (this.socket?.connected) return;

    this.token = token;
    this.socket = io(this.baseURL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Chat service connected');
      this.connectionListeners.forEach(listener => listener(true));
    });

    this.socket.on('disconnect', () => {
      console.log('Chat service disconnected');
      this.connectionListeners.forEach(listener => listener(false));
    });

    this.socket.on('new_message', (data: { chatId: string; message: ChatMessage }) => {
      this.messageListeners.forEach(listener => listener(data.message, data.chatId));
    });

    this.socket.on('chat_notification', (notification) => {
      this.chatNotificationListeners.forEach(listener => listener(notification));
    });

    this.socket.on('user_typing', (data) => {
      this.typingListeners.forEach(listener => listener(data));
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a specific chat room
  joinChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', chatId);
    }
  }

  // Send message via WebSocket
  sendMessage(chatId: string, content: string, type: 'text' | 'image' | 'order_inquiry' = 'text') {
    if (this.socket?.connected) {
      this.socket.emit('send_message', { chatId, content, type });
    }
  }

  // Send typing indicator
  setTyping(chatId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }

  // Mark messages as read
  markAsRead(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('mark_read', { chatId });
    }
  }

  // Event listener management
  onMessage(listener: (message: ChatMessage, chatId: string) => void) {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }

  onChatNotification(listener: (notification: any) => void) {
    this.chatNotificationListeners.push(listener);
    return () => {
      this.chatNotificationListeners = this.chatNotificationListeners.filter(l => l !== listener);
    };
  }

  onTyping(listener: (data: { userId: string; userName: string; isTyping: boolean }) => void) {
    this.typingListeners.push(listener);
    return () => {
      this.typingListeners = this.typingListeners.filter(l => l !== listener);
    };
  }

  onConnectionChange(listener: (connected: boolean) => void) {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }

  // REST API methods (fallback)
  async getChats(): Promise<ChatListItem[]> {
    const response = await fetch(`${this.baseURL}/api/chats`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }

    const data = await response.json();
    return data.chats;
  }

  async getChat(chatId: string): Promise<Chat> {
    const response = await fetch(`${this.baseURL}/api/chats/${chatId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch chat');
    }

    const data = await response.json();
    return data.chat;
  }

  async startChat(recipientId: string, cropId?: string, initialMessage?: string): Promise<Chat> {
    const response = await fetch(`${this.baseURL}/api/chats/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ recipientId, cropId, initialMessage })
    });

    if (!response.ok) {
      throw new Error('Failed to start chat');
    }

    const data = await response.json();
    return data.chat;
  }

  async sendMessageREST(chatId: string, content: string, type: 'text' | 'image' | 'order_inquiry' = 'text'): Promise<ChatMessage> {
    const response = await fetch(`${this.baseURL}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, type })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data.message;
  }

  async searchMessages(chatId: string, query: string): Promise<ChatMessage[]> {
    const response = await fetch(`${this.baseURL}/api/chats/${chatId}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search messages');
    }

    const data = await response.json();
    return data.results;
  }

  async getUnreadCount(): Promise<number> {
    const response = await fetch(`${this.baseURL}/api/chats/unread/count`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get unread count');
    }

    const data = await response.json();
    return data.unreadCount;
  }

  async archiveChat(chatId: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/chats/${chatId}/archive`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to archive chat');
    }
  }
}

export const chatService = new ChatService();
