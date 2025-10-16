import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, MapPin, Calendar, Bell, BellOff, Trash2, Package, User, TrendingDown, ArrowRight } from 'lucide-react';
import { wishlistService, WishlistItem, FavoritesList } from '../services/wishlistService';
import { useAuth } from '../contexts/AuthContext';

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<FavoritesList>({ crops: [], farmers: [] });
  const [activeTab, setActiveTab] = useState<'crops' | 'farmers' | 'stats'>('crops');
  const [stats, setStats] = useState<any>({});
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<WishlistItem | null>(null);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    if (user) {
      loadWishlist();
      loadStats();
    }
  }, [user]);

  const loadWishlist = () => {
    if (user) {
      const data = wishlistService.getWishlist(user.id);
      setWishlist(data);
    }
  };

  const loadStats = () => {
    if (user) {
      const statistics = wishlistService.getWishlistStats(user.id);
      setStats(statistics);
    }
  };

  const removeFromWishlist = (itemId: string, type: 'crop' | 'farmer') => {
    if (user) {
      wishlistService.removeFromWishlist(user.id, itemId, type);
      loadWishlist();
      loadStats();
    }
  };

  const togglePriceAlert = (crop: WishlistItem) => {
    if (!user) return;

    if (crop.priceAlertEnabled) {
      // Disable alert
      wishlistService.togglePriceAlert(user.id, crop.itemId, false);
      loadWishlist();
    } else {
      // Show modal to set target price
      setSelectedCrop(crop);
      setTargetPrice(crop.price?.toString() || '');
      setShowPriceAlertModal(true);
    }
  };

  const savePriceAlert = () => {
    if (user && selectedCrop && targetPrice) {
      const price = parseFloat(targetPrice);
      if (price > 0) {
        wishlistService.togglePriceAlert(user.id, selectedCrop.itemId, true, price);
        loadWishlist();
        setShowPriceAlertModal(false);
        setSelectedCrop(null);
        setTargetPrice('');
      }
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  const getAvailabilityColor = (availability?: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'pre_order': return 'bg-blue-100 text-blue-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (availability?: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'low_stock': return 'Low Stock';
      case 'pre_order': return 'Pre-Order';
      case 'out_of_stock': return 'Out of Stock';
      default: return 'Unknown';
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view your wishlist</h1>
          <p className="text-gray-600 mb-8">Save your favorite crops and farmers to keep track of them.</p>
          <Link
            to="/login"
            className="bg-farm-green-600 text-white px-6 py-3 rounded-md hover:bg-farm-green-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
        <p className="text-lg text-gray-600">Keep track of your favorite crops and farmers</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('crops')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'crops'
                ? 'border-farm-green-500 text-farm-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Crops ({wishlist.crops.length})
          </button>
          <button
            onClick={() => setActiveTab('farmers')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'farmers'
                ? 'border-farm-green-500 text-farm-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Farmers ({wishlist.farmers.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-farm-green-500 text-farm-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Statistics
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'crops' && (
        <div>
          {wishlist.crops.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No crops in your wishlist</h3>
              <p className="text-gray-600 mb-8">Start browsing and add crops you're interested in.</p>
              <Link
                to="/crops"
                className="bg-farm-green-600 text-white px-6 py-3 rounded-md hover:bg-farm-green-700 transition-colors"
              >
                Browse Crops
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.crops.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{item.itemName}</h3>
                    <button
                      onClick={() => removeFromWishlist(item.itemId, 'crop')}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Price and Availability */}
                  <div className="flex items-center justify-between mb-3">
                    {item.price && (
                      <span className="text-xl font-bold text-gray-900">
                        ${item.price.toFixed(2)}/{item.unit}
                      </span>
                    )}
                    {item.availability && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAvailabilityColor(item.availability)}`}>
                        {getAvailabilityText(item.availability)}
                      </span>
                    )}
                  </div>

                  {/* Farmer and Location */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {item.farmer && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{item.farmer.name}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{item.location.city}, {item.location.state}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Added {new Date(item.dateAdded).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Price Alert */}
                  <div className="mb-4">
                    <button
                      onClick={() => togglePriceAlert(item)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium w-full ${
                        item.priceAlertEnabled
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.priceAlertEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                      {item.priceAlertEnabled ? (
                        <>Alert at ${item.targetPrice?.toFixed(2)}</>
                      ) : (
                        <>Set Price Alert</>
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/crops/${item.itemId}`}
                      className="flex-1 bg-farm-green-600 text-white px-4 py-2 rounded-md hover:bg-farm-green-700 transition-colors text-center text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'farmers' && (
        <div>
          {wishlist.farmers.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No farmers in your favorites</h3>
              <p className="text-gray-600 mb-8">Find and follow farmers you'd like to buy from regularly.</p>
              <Link
                to="/farmers"
                className="bg-farm-green-600 text-white px-6 py-3 rounded-md hover:bg-farm-green-700 transition-colors"
              >
                Browse Farmers
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.farmers.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item.itemName}</h3>
                    <button
                      onClick={() => removeFromWishlist(item.itemId, 'farmer')}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove from favorites"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Location */}
                  {item.location && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{item.location.city}, {item.location.state}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Added {new Date(item.dateAdded).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to="/farmers"
                      className="flex-1 bg-farm-green-600 text-white px-4 py-2 rounded-md hover:bg-farm-green-700 transition-colors text-center text-sm font-medium"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Crops</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCrops || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <User className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Farmers</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFarmers || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Bell className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Price Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.priceAlertsEnabled || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {stats.averagePrice > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Price</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.averagePrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Price Drop Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 flex items-center">
                    {stats.priceDropAlerts || 0}
                    {stats.priceDropAlerts > 0 && <TrendingDown className="h-5 w-5 text-green-600 ml-2" />}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/crops"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-farm-green-300 hover:bg-farm-green-50 transition-colors"
              >
                <Package className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-gray-600">Browse Crops</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link
                to="/farmers"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-farm-green-300 hover:bg-farm-green-50 transition-colors"
              >
                <User className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-gray-600">Find Farmers</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <button
                onClick={() => {
                  if (user) {
                    const exported = wishlistService.exportWishlist(user.id);
                    const blob = new Blob([exported], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'wishlist-backup.json';
                    a.click();
                  }
                }}
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-farm-green-300 hover:bg-farm-green-50 transition-colors"
              >
                <Heart className="h-6 w-6 text-gray-400 mr-2" />
                <span className="text-gray-600">Export Wishlist</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      {showPriceAlertModal && selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Set Price Alert for {selectedCrop.itemName}
            </h3>
            <p className="text-gray-600 mb-4">
              Current price: ${selectedCrop.price?.toFixed(2)}/{selectedCrop.unit}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert me when price drops to:
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500 focus:border-farm-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={savePriceAlert}
                className="flex-1 bg-farm-green-600 text-white py-2 px-4 rounded-md hover:bg-farm-green-700 font-medium"
              >
                Set Alert
              </button>
              <button
                onClick={() => {
                  setShowPriceAlertModal(false);
                  setSelectedCrop(null);
                  setTargetPrice('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
