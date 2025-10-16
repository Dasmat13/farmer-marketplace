import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Star, Package, ChevronDown, Leaf, Award } from 'lucide-react';
import AdvancedSearch from '../components/AdvancedSearch';
import WishlistButton from '../components/WishlistButton';
import { CropSearchResult } from '../services/searchService';
import { useAuth } from '../contexts/AuthContext';
import AIPrediction from '../components/AIPrediction';

interface Crop {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  farmer: {
    name: string;
    id: string;
  };
  location: {
    city: string;
    state: string;
  };
  harvestDate: string;
  certifications: string[];
  availability: 'available' | 'low_stock' | 'pre_order';
}

const CropsList: React.FC = () => {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState<CropSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState({});

  const handleSearchResults = (results: CropSearchResult[], total: number) => {
    setSearchResults(results);
    setTotalCount(total);
  };

  const handleFiltersChange = (filters: any) => {
    setCurrentFilters(filters);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'pre_order': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Available';
      case 'low_stock': return 'Low Stock';
      case 'pre_order': return 'Pre-Order';
      default: return 'Unknown';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Crops</h1>
        <p className="text-lg text-gray-600">
          Discover fresh, local produce with AI-powered search and filtering
        </p>
      </div>

      {/* Advanced Search Component */}
      <AdvancedSearch
        onSearchResults={handleSearchResults}
        onFiltersChange={handleFiltersChange}
        userId={user?.id}
      />

      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          {totalCount} {totalCount === 1 ? 'crop' : 'crops'} found
        </h2>
      </div>

      {/* Results */}
      {searchResults.length === 0 && totalCount === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No crops found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {searchResults.map((crop) => (
            <div key={crop.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Crop Image Placeholder */}
                <div className="lg:col-span-1">
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                
                {/* Crop Info */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">{crop.name}</h2>
                      <WishlistButton
                        type="crop"
                        itemId={crop.id}
                        itemData={{
                          name: crop.name,
                          price: crop.price,
                          unit: crop.unit,
                          farmerName: crop.farmer.name,
                          farmerId: crop.farmer.id,
                          location: crop.location,
                          availability: crop.availability
                        }}
                        showText={false}
                        className="p-1"
                      />
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      crop.availability === 'available' ? 'bg-green-100 text-green-800' :
                      crop.availability === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                      crop.availability === 'pre_order' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {crop.availability === 'available' ? 'Available' :
                       crop.availability === 'low_stock' ? 'Low Stock' :
                       crop.availability === 'pre_order' ? 'Pre-Order' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3 line-clamp-2">{crop.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {crop.location.city}, {crop.location.state}
                      {crop.location.distance && (
                        <span className="ml-1">({crop.location.distance} mi)</span>
                      )}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(crop.harvestDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      {crop.farmer.verified && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          Verified
                        </span>
                      )}
                      By {crop.farmer.name}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-farm-green-100 text-farm-green-800 text-xs rounded">
                      {crop.category}
                    </span>
                    {crop.isOrganic && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center">
                        <Leaf className="h-3 w-3 mr-1" />
                        Organic
                      </span>
                    )}
                    {crop.certifications.slice(0, 3).map((cert, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {cert}
                      </span>
                    ))}
                    {crop.certifications.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{crop.certifications.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <div className="flex mr-1">
                        {renderStars(crop.reviews.averageRating)}
                      </div>
                      <span className="text-sm text-gray-600">({crop.reviews.totalReviews})</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Sustainability: {crop.sustainabilityScore}/100
                    </div>
                  </div>
                </div>
                
                {/* Price and Actions */}
                <div className="lg:col-span-1 flex flex-col justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      ${crop.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">per {crop.unit}</div>
                    
                    {crop.quantity > 0 && (
                      <div className="text-sm text-gray-500 mb-4">
                        {crop.quantity} {crop.unit}s available
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      to={`/crops/${crop.id}`}
                      className="w-full bg-farm-green-600 text-white px-4 py-2 rounded-md hover:bg-farm-green-700 transition-colors text-center block font-medium"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/compare?crops=${crop.id}`}
                      className="w-full border border-farm-green-600 text-farm-green-600 px-4 py-2 rounded-md hover:bg-farm-green-50 transition-colors text-center block font-medium flex items-center justify-center gap-1"
                    >
                      <Award className="h-4 w-4" />
                      Compare
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropsList;
