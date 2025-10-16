import React, { useState } from 'react';
import { X, Send, User, Mail, Phone } from 'lucide-react';

interface ContactFarmerProps {
  farmer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    specialties: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  cropName?: string;
}

const ContactFarmer: React.FC<ContactFarmerProps> = ({ farmer, isOpen, onClose, cropName }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: cropName ? `Inquiry about ${cropName}` : '',
    message: cropName 
      ? `Hi ${farmer.name},\n\nI'm interested in your ${cropName} and would like to learn more about availability, pricing, and delivery options.\n\nThank you!`
      : '',
    contactMethod: 'email' as 'email' | 'phone' | 'both'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);

    // Auto-close after success
    setTimeout(() => {
      handleClose();
    }, 3000);
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: cropName ? `Inquiry about ${cropName}` : '',
      message: cropName 
        ? `Hi ${farmer.name},\n\nI'm interested in your ${cropName} and would like to learn more about availability, pricing, and delivery options.\n\nThank you!`
        : '',
      contactMethod: 'email'
    });
    setIsSubmitted(false);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Contact {farmer.name}</h2>
              <p className="text-gray-600 mt-1">Send a message to this farmer</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-600 mb-4">
                Your message has been sent to {farmer.name}. They will get back to you soon!
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">What happens next?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• {farmer.name} will receive your message via {formData.contactMethod}</li>
                  <li>• You'll get a response within 24-48 hours</li>
                  <li>• You can track this conversation in your buyer dashboard</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              {/* Farmer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-farm-green-100 rounded-full flex items-center justify-center mr-3">
                    <User className="h-6 w-6 text-farm-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{farmer.name}</h3>
                    <p className="text-sm text-gray-600">Specializes in {farmer.specialties.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {farmer.email}
                  </span>
                  <span className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {farmer.phone}
                  </span>
                </div>
              </div>

              {/* Contact Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="contactMethod" className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Contact Method
                    </label>
                    <select
                      id="contactMethod"
                      name="contactMethod"
                      value={formData.contactMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="both">Either Email or Phone</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                    placeholder="Include details about quantities, delivery preferences, timeline, etc."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Be specific about your needs to get the most helpful response.
                  </p>
                </div>

                {/* Quick Message Templates */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Quick Templates:</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        message: `Hi ${farmer.name},\n\nI'm interested in placing a bulk order for my restaurant. Could you please share information about wholesale pricing, minimum quantities, and delivery schedules?\n\nThank you!`
                      }))}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Wholesale Inquiry
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        message: `Hi ${farmer.name},\n\nI represent a local grocery store and would like to discuss carrying your products. Can we set up a meeting to discuss partnership opportunities?\n\nBest regards!`
                      }))}
                      className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                    >
                      Partnership
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        message: `Hi ${farmer.name},\n\nI'm looking for fresh produce for my family. Could you let me know about your current availability, pricing, and if you offer direct sales or farmer's market locations?\n\nThank you!`
                      }))}
                      className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200"
                    >
                      Direct Sales
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-farm-green-600 text-white rounded-md hover:bg-farm-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactFarmer;
