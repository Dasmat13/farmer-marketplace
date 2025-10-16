import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingCart, CreditCard, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart: React.FC = () => {
  const { items, itemCount, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would make API calls to process payment
    alert('Checkout simulation complete! Orders have been sent to farmers.');
    clearCart();
    setIsCheckingOut(false);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Start shopping to add items to your cart.
          </p>
          <Link
            to="/crops"
            className="bg-farm-green-600 text-white px-6 py-3 rounded-md hover:bg-farm-green-700 transition-colors"
          >
            Browse Crops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-8">
        <Link to="/crops" className="flex items-center text-farm-green-600 hover:text-farm-green-800 mr-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Continue Shopping
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Shopping Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
            </h1>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Clear Cart
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 border-b border-gray-200 pb-6">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.cropName}</h3>
                  <p className="text-gray-600">From {item.farmerName}</p>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)} per {item.unit}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="bg-gray-200 text-gray-700 p-1 rounded hover:bg-gray-300"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 bg-gray-100 rounded text-center min-w-[3rem]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="bg-gray-200 text-gray-700 p-1 rounded hover:bg-gray-300"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center mt-1"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            
            <div className="text-sm text-gray-600 mb-6">
              <p>• Items will be ordered directly from individual farmers</p>
              <p>• Delivery times may vary by farmer and location</p>
              <p>• You'll receive order confirmations from each farmer</p>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 text-center">
                  Please log in to complete your purchase
                </p>
                <div className="flex space-x-3">
                  <Link
                    to="/login"
                    className="flex-1 bg-farm-green-600 text-white py-3 px-6 rounded-md hover:bg-farm-green-700 transition-colors text-center"
                  >
                    Login to Checkout
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition-colors text-center"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-farm-green-600 text-white py-3 px-6 rounded-md hover:bg-farm-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
