import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { useNavigate } from 'react-router-dom';

interface ContactFarmerChatProps {
  farmerId: string;
  farmerName: string;
  cropId?: string;
  cropName?: string;
  className?: string;
}

const ContactFarmerChat: React.FC<ContactFarmerChatProps> = ({
  farmerId,
  farmerName,
  cropId,
  cropName,
  className = ''
}) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!message.trim()) {
      try {
        // Start chat without initial message
        const chat = await chatService.startChat(farmerId, cropId);
        navigate(`/chat/${chat._id}`);
      } catch (error) {
        console.error('Failed to start chat:', error);
        alert('Failed to start conversation. Please try again.');
      }
      return;
    }

    setLoading(true);
    try {
      const chat = await chatService.startChat(farmerId, cropId, message.trim());
      navigate(`/chat/${chat._id}`);
      setShowModal(false);
    } catch (error) {
      console.error('Failed to start chat:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickChat = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    handleStartChat();
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={handleQuickChat}
          className="flex-1 bg-farm-green-600 text-white px-4 py-2 rounded-lg hover:bg-farm-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Chat Now
        </button>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-farm-green-100 text-farm-green-700 px-4 py-2 rounded-lg hover:bg-farm-green-200 transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Message {farmerName}
                </h3>
                {cropName && (
                  <p className="text-sm text-gray-600 mt-1">
                    About: {cropName}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your message (optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${farmerName}! I'm interested in${cropName ? ` your ${cropName}` : ' your crops'}. Could you tell me more about availability and pricing?`}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleStartChat}
                disabled={loading}
                className="bg-farm-green-600 text-white px-6 py-2 rounded-lg hover:bg-farm-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Start Chat
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactFarmerChat;
