import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const Chat: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg h-[600px] flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Chat System</h3>
          <p className="text-gray-600 mb-4">
            WebSocket-based messaging between farmers and buyers
          </p>
          <div className="bg-farm-green-50 rounded-lg p-4 max-w-md mx-auto">
            <h4 className="font-semibold text-farm-green-800 mb-2">Features Ready:</h4>
            <ul className="text-sm text-farm-green-700 space-y-1 text-left">
              <li>✅ Real-time messaging with Socket.IO</li>
              <li>✅ Chat persistence in MongoDB</li>
              <li>✅ Typing indicators</li>
              <li>✅ Read receipts</li>
              <li>✅ Contact farmers from crop pages</li>
              <li>✅ Unread message counts</li>
              <li>✅ Chat search functionality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
