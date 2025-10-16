import React, { useState } from 'react';
import { ShoppingCart, Heart, Clock, CheckCircle, Star, MapPin, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import AIPrediction from '../components/AIPrediction';
import SeasonalRecommendations from '../components/SeasonalRecommendations';

interface SavedFarmer {
  id: string;
  name: string;
  location: {
    city: string;
    state: string;
  };
  rating: number;
  specialties: string[];
  totalCrops: number;
}

interface Order {
  id: string;
  cropName: string;
  farmerName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  orderDate: string;
  estimatedDelivery: string;
}

interface CartItem {
  id: string;
  cropName: string;
  farmerName: string;
  price: number;
  quantity: number;
  unit: string;
}

const BuyerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'saved' | 'cart'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data
  const buyerStats = {
    totalOrders: 24,
    totalSpent: 1850,
    savedFarmers: 8,
    cartItems: 3
  };
  
  const recentOrders: Order[] = [
    {
      id: '001',
      cropName: 'Organic Tomatoes',
      farmerName: 'Maria Garcia',
      quantity: 25,
      totalPrice: 87.50,
      status: 'delivered',
      orderDate: '2024-10-10',
      estimatedDelivery: '2024-10-12'
    },
    {
      id: '002',
      cropName: 'Sweet Corn',
      farmerName: 'John Smith',
      quantity: 10,
      totalPrice: 45.00,
      status: 'shipped',
      orderDate: '2024-10-13',
      estimatedDelivery: '2024-10-16'
    },
    {
      id: '003',
      cropName: 'Fresh Apples',
      farmerName: 'Sarah Chen',
      quantity: 15,
      totalPrice: 52.50,
      status: 'confirmed',
      orderDate: '2024-10-14',
      estimatedDelivery: '2024-10-18'
    },
    {
      id: '004',
      cropName: 'Organic Potatoes',
      farmerName: 'Mike Thompson',
      quantity: 20,
      totalPrice: 35.00,
      status: 'pending',
      orderDate: '2024-10-15',
      estimatedDelivery: '2024-10-19'
    }
  ];
  
  const savedFarmers: SavedFarmer[] = [
    {
      id: '1',
      name: 'Maria Garcia',
      location: { city: 'Fresno', state: 'California' },
      rating: 4.9,
      specialties: ['Tomatoes', 'Lettuce', 'Peppers'],
      totalCrops: 25
    },
    {
      id: '2',
      name: 'John Smith',
      location: { city: 'Des Moines', state: 'Iowa' },
      rating: 4.8,
      specialties: ['Corn', 'Soybeans', 'Wheat'],
      totalCrops: 12
    },
    {
      id: '3',
      name: 'Sarah Chen',
      location: { city: 'Portland', state: 'Oregon' },
      rating: 4.9,
      specialties: ['Apples', 'Pears', 'Berries'],
      totalCrops: 18
    }
  ];
  
  const cartItems: CartItem[] = [
    {
      id: '1',
      cropName: 'Organic Carrots',
      farmerName: 'Mike Thompson',
      price: 2.75,
      quantity: 10,
      unit: 'lb'
    },
    {
      id: '2',
      cropName: 'Fresh Lettuce',
      farmerName: 'Maria Garcia',
      price: 2.25,
      quantity: 5,
      unit: 'head'
    },
    {
      id: '3',
      cropName: 'Sweet Peppers',
      farmerName: 'David Johnson',
      price: 4.50,
      quantity: 3,
      unit: 'lb'
    }
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
    }

    return stars;
  };
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{buyerStats.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${buyerStats.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Saved Farmers</p>
              <p className="text-2xl font-bold text-gray-900">{buyerStats.savedFarmers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <ShoppingCart className="h-8 w-8 text-farm-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cart Items</p>
              <p className="text-2xl font-bold text-gray-900">{buyerStats.cartItems}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
            <div className="space-y-4">
              {recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.cropName}</p>
                    <p className="text-sm text-gray-600">{order.farmerName} • {order.quantity} units</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.totalPrice}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/buyer/dashboard" className="block mt-4 text-farm-green-600 hover:text-farm-green-800 text-sm">
              View all orders →
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Farmers</h3>
            <div className="space-y-4">
              {savedFarmers.slice(0, 3).map((farmer) => (
                <div key={farmer.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{farmer.name}</p>
                    <p className="text-sm text-gray-600">{farmer.location.city}, {farmer.location.state}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      <div className="flex mr-1">
                        {renderStars(farmer.rating)}
                      </div>
                      <span className="text-xs text-gray-600">({farmer.rating})</span>
                    </div>
                    <p className="text-xs text-gray-500">{farmer.totalCrops} crops</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/crops" className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-farm-green-300 hover:bg-farm-green-50 transition-colors">
            <Search className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-gray-600">Browse Crops</span>
          </Link>
          <Link to="/farmers" className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-farm-green-300 hover:bg-farm-green-50 transition-colors">
            <Heart className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-gray-600">Find Farmers</span>
          </Link>
          <button className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-farm-green-300 hover:bg-farm-green-50 transition-colors">
            <ShoppingCart className="h-6 w-6 text-gray-400 mr-2" />
            <span className="text-gray-600">View Cart</span>
          </button>
        </div>
      </div>
      
      {/* Seasonal Recommendations */}
      <SeasonalRecommendations
        title="Seasonal Recommendations for You"
        maxItems={4}
        className="mb-6"
      />
      
      {/* AI Market Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
        <p className="text-gray-600 mb-4">Based on your purchase history and preferences</p>
        <AIPrediction 
          cropName="tomatoes"
          currentPrice={3.50}
          location={{ city: "Local Area", state: "" }}
        />
      </div>
    </div>
  );
  
  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
      
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                    <div className="text-sm text-gray-500">{order.cropName}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.farmerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.quantity} units
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.totalPrice}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const renderSavedFarmers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Saved Farmers</h2>
        <Link to="/farmers" className="bg-farm-green-600 text-white px-4 py-2 rounded-md hover:bg-farm-green-700">
          Find More Farmers
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedFarmers.map((farmer) => (
          <div key={farmer.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-farm-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-lg font-bold text-farm-green-600">
                  {farmer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{farmer.name}</h3>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{farmer.location.city}, {farmer.location.state}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mb-3">
              <div className="flex mr-2">
                {renderStars(farmer.rating)}
              </div>
              <span className="text-sm text-gray-600">({farmer.rating})</span>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">{farmer.totalCrops} crops available</p>
              <div className="flex flex-wrap gap-1">
                {farmer.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-block bg-farm-green-100 text-farm-green-800 text-xs px-2 py-1 rounded"
                  >
                    {specialty}
                  </span>
                ))}
                {farmer.specialties.length > 3 && (
                  <span className="text-xs text-gray-500">+{farmer.specialties.length - 3} more</span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex-1 bg-farm-green-600 text-white py-2 px-3 rounded text-sm hover:bg-farm-green-700">
                View Crops
              </button>
              <button className="flex-1 border border-gray-300 text-gray-600 py-2 px-3 rounded text-sm hover:bg-gray-50">
                Message
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderCart = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.cropName}</h3>
                  <p className="text-sm text-gray-600">From {item.farmerName}</p>
                  <p className="text-sm text-gray-500">${item.price} per {item.unit}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 text-sm">
                      -
                    </button>
                    <span className="px-3 py-1 bg-gray-100 rounded text-sm">{item.quantity}</span>
                    <button className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 text-sm">
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <button className="text-red-600 hover:text-red-800 text-sm">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-gray-900">
                ${cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
              </span>
            </div>
            <div className="flex space-x-4">
              <Link to="/crops" className="flex-1 border border-gray-300 text-gray-600 py-3 px-6 rounded-md text-center hover:bg-gray-50">
                Continue Shopping
              </Link>
              <button className="flex-1 bg-farm-green-600 text-white py-3 px-6 rounded-md hover:bg-farm-green-700">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-600 mt-2">Track orders, manage favorites, and discover fresh produce</p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: CheckCircle },
            { id: 'orders', label: 'Orders', icon: Clock },
            { id: 'saved', label: 'Saved Farmers', icon: Heart },
            { id: 'cart', label: 'Cart', icon: ShoppingCart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-farm-green-500 text-farm-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.id === 'cart' && cartItems.length > 0 && (
                  <span className="ml-2 bg-farm-green-600 text-white text-xs rounded-full px-2 py-1">
                    {cartItems.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'saved' && renderSavedFarmers()}
      {activeTab === 'cart' && renderCart()}
    </div>
  );
};

export default BuyerDashboard;
