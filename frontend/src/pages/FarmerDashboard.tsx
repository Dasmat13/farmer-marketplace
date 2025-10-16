import React, { useState } from 'react';
import { Plus, Package, TrendingUp, DollarSign, Users, Eye, Edit, Trash2, BarChart3 } from 'lucide-react';
import AIPrediction from '../components/AIPrediction';

interface Crop {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  status: 'available' | 'low_stock' | 'sold_out';
  harvestDate: string;
  views: number;
  orders: number;
}

interface Order {
  id: string;
  cropName: string;
  buyerName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  orderDate: string;
}

const FarmerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'crops' | 'orders' | 'analytics'>('overview');
  const [showAddCrop, setShowAddCrop] = useState(false);
  
  // Mock data
  const farmerStats = {
    totalCrops: 12,
    totalRevenue: 15420,
    pendingOrders: 8,
    totalViews: 2340
  };
  
  const crops: Crop[] = [
    {
      id: '1',
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      price: 3.50,
      quantity: 500,
      unit: 'lb',
      status: 'available',
      harvestDate: '2024-10-10',
      views: 234,
      orders: 12
    },
    {
      id: '2',
      name: 'Sweet Corn',
      category: 'Grains',
      price: 4.50,
      quantity: 50,
      unit: 'dozen',
      status: 'low_stock',
      harvestDate: '2024-10-05',
      views: 189,
      orders: 8
    },
    {
      id: '3',
      name: 'Fresh Lettuce',
      category: 'Leafy Greens',
      price: 2.25,
      quantity: 0,
      unit: 'head',
      status: 'sold_out',
      harvestDate: '2024-09-28',
      views: 156,
      orders: 15
    }
  ];
  
  const recentOrders: Order[] = [
    {
      id: '001',
      cropName: 'Organic Tomatoes',
      buyerName: 'Sarah Johnson',
      quantity: 25,
      totalPrice: 87.50,
      status: 'pending',
      orderDate: '2024-10-14'
    },
    {
      id: '002',
      cropName: 'Sweet Corn',
      buyerName: 'Mike Chen',
      quantity: 10,
      totalPrice: 45.00,
      status: 'confirmed',
      orderDate: '2024-10-13'
    },
    {
      id: '003',
      cropName: 'Fresh Lettuce',
      buyerName: 'Emma Davis',
      quantity: 20,
      totalPrice: 45.00,
      status: 'shipped',
      orderDate: '2024-10-12'
    }
  ];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'sold_out': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-farm-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Crops</p>
              <p className="text-2xl font-bold text-gray-900">{farmerStats.totalCrops}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${farmerStats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{farmerStats.pendingOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{farmerStats.totalViews.toLocaleString()}</p>
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
                    <p className="text-sm text-gray-600">{order.buyerName} • {order.quantity} units</p>
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
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Crops</h3>
            <div className="space-y-4">
              {crops.filter(c => c.orders > 0).sort((a, b) => b.orders - a.orders).slice(0, 3).map((crop) => (
                <div key={crop.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{crop.name}</p>
                    <p className="text-sm text-gray-600">{crop.views} views • {crop.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${crop.price}/{crop.unit}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(crop.status)}`}>
                      {crop.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Market Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Market Insights</h3>
        <AIPrediction 
          cropName="tomatoes"
          currentPrice={3.50}
          location={{ city: "Fresno", state: "California" }}
        />
      </div>
    </div>
  );
  
  const renderCrops = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Crops</h2>
        <button 
          onClick={() => setShowAddCrop(true)}
          className="bg-farm-green-600 text-white px-4 py-2 rounded-md hover:bg-farm-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Crop
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {crops.map((crop) => (
              <tr key={crop.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{crop.name}</div>
                    <div className="text-sm text-gray-500">{crop.category}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${crop.price}/{crop.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {crop.quantity} {crop.unit}s
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(crop.status)}`}>
                    {crop.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {crop.views} views • {crop.orders} orders
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-farm-green-600 hover:text-farm-green-900">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const renderOrders = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <tr key={order.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.cropName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.buyerName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.quantity}
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
  
  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-6 w-6 text-farm-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p>Revenue chart visualization would go here</p>
            <p className="text-sm mt-2">Integration with charting library needed</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Crop Performance</h3>
          </div>
          <div className="space-y-4">
            {crops.map((crop) => (
              <div key={crop.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{crop.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-900">{crop.views} views</span>
                  <span className="text-sm font-medium text-farm-green-600">{crop.orders} orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* AI-Powered Market Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Market Analysis for Your Top Crops</h3>
        <div className="space-y-8">
          <AIPrediction 
            cropName="corn"
            currentPrice={4.50}
            location={{ city: "Des Moines", state: "Iowa" }}
          />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your crops, track orders, and monitor performance</p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'crops', label: 'My Crops', icon: Package },
            { id: 'orders', label: 'Orders', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
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
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'crops' && renderCrops()}
      {activeTab === 'orders' && renderOrders()}
      {activeTab === 'analytics' && renderAnalytics()}
      
      {/* Add Crop Modal Placeholder */}
      {showAddCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add New Crop</h3>
            <p className="text-gray-600 mb-4">Crop creation form would be implemented here</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowAddCrop(false)}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-farm-green-600 text-white rounded hover:bg-farm-green-700">
                Add Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
