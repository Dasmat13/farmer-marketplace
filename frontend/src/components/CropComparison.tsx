import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  X, 
  Star, 
  Award, 
  Leaf, 
  Droplets, 
  Zap, 
  Calendar,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Shield
} from 'lucide-react';
import { ComparisonCrop, ComparisonResult, cropComparisonService } from '../services/cropComparisonService';

interface CropComparisonProps {
  initialCropIds?: string[];
  maxCrops?: number;
}

const CropComparison: React.FC<CropComparisonProps> = ({ 
  initialCropIds = [], 
  maxCrops = 4 
}) => {
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>(initialCropIds);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ComparisonCrop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Load comparison when crop IDs change
  useEffect(() => {
    if (selectedCropIds.length > 0) {
      loadComparison();
    } else {
      setComparisonResult(null);
    }
  }, [selectedCropIds]);

  const loadComparison = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await cropComparisonService.compareCrops(selectedCropIds);
      setComparisonResult(result);
    } catch (err) {
      setError('Failed to load crop comparison');
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await cropComparisonService.searchCropsForComparison(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const addCropToComparison = (cropId: string) => {
    if (selectedCropIds.length >= maxCrops) {
      alert(`Maximum ${maxCrops} crops can be compared at once`);
      return;
    }

    if (!selectedCropIds.includes(cropId)) {
      setSelectedCropIds([...selectedCropIds, cropId]);
    }
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeCropFromComparison = (cropId: string) => {
    setSelectedCropIds(selectedCropIds.filter(id => id !== cropId));
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

  const getSustainabilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFreshnessColor = (freshness: number) => {
    if (freshness >= 90) return 'text-green-600';
    if (freshness >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isHighlighted = (crop: ComparisonCrop, metric: string) => {
    if (!comparisonResult) return false;
    
    switch (metric) {
      case 'price':
        return crop.id === comparisonResult.bestValues.lowestPrice.id;
      case 'protein':
        return crop.id === comparisonResult.bestValues.highestProtein.id;
      case 'sustainability':
        return crop.id === comparisonResult.bestValues.bestSustainability.id;
      case 'rating':
        return crop.id === comparisonResult.bestValues.highestRated.id;
      case 'freshness':
        return crop.id === comparisonResult.bestValues.freshest.id;
      default:
        return false;
    }
  };

  const getHighlightClass = (isHighlighted: boolean) => {
    return isHighlighted ? 'bg-green-50 border-green-200 font-semibold' : '';
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crop Comparison</h2>
            <p className="text-gray-600">Compare crops side by side to make informed decisions</p>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            disabled={selectedCropIds.length >= maxCrops}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              selectedCropIds.length >= maxCrops
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-farm-green-600 text-white hover:bg-farm-green-700'
            }`}
          >
            <Plus className="h-4 w-4" />
            Add Crop ({selectedCropIds.length}/{maxCrops})
          </button>
        </div>

        {/* Search Interface */}
        {showSearch && (
          <div className="border-t pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for crops to compare..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchResults.slice(0, 6).map((crop) => (
                  <div
                    key={crop.id}
                    className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => addCropToComparison(crop.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{crop.name}</h4>
                        <p className="text-sm text-gray-600">${crop.price} per {crop.unit}</p>
                      </div>
                      <Plus className="h-4 w-4 text-farm-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Crops Summary */}
        {selectedCropIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {comparisonResult?.crops.map((crop) => (
              <div
                key={crop.id}
                className="flex items-center gap-2 bg-farm-green-100 text-farm-green-800 px-3 py-1 rounded-full"
              >
                <span className="text-sm font-medium">{crop.name}</span>
                <button
                  onClick={() => removeCropFromComparison(crop.id)}
                  className="hover:bg-farm-green-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green-600"></div>
          <span className="ml-2 text-gray-600">Loading comparison...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonResult && comparisonResult.crops.length > 0 && !loading && (
        <>
          {/* Quick Insights */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Insights</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Award className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Best Value</div>
                <div className="text-xs text-gray-600">{comparisonResult.recommendations.bestForBudget.name}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Leaf className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Most Nutritious</div>
                <div className="text-xs text-gray-600">{comparisonResult.recommendations.bestForNutrition.name}</div>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <Shield className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Most Sustainable</div>
                <div className="text-xs text-gray-600">{comparisonResult.recommendations.bestForEnvironment.name}</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-900">Overall Best</div>
                <div className="text-xs text-gray-600">{comparisonResult.recommendations.bestOverall.name}</div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Attribute</th>
                    {comparisonResult.crops.map((crop) => (
                      <th key={crop.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900 min-w-48">
                        <div className="space-y-2">
                          <img 
                            src={crop.images[0]} 
                            alt={crop.name}
                            className="w-20 h-20 object-cover rounded-lg mx-auto"
                          />
                          <div className="font-semibold">{crop.name}</div>
                          <div className="text-xs text-gray-600">{crop.category}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Price */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Price</td>
                    {comparisonResult.crops.map((crop) => (
                      <td key={crop.id} className={`px-4 py-3 text-center ${getHighlightClass(isHighlighted(crop, 'price'))}`}>
                        <div className="text-lg font-semibold text-gray-900">
                          ${crop.price}
                        </div>
                        <div className="text-sm text-gray-600">per {crop.unit}</div>
                      </td>
                    ))}
                  </tr>

                  {/* Farmer */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Farmer</td>
                    {comparisonResult.crops.map((crop) => (
                      <td key={crop.id} className="px-4 py-3 text-center">
                        <div className="font-medium text-gray-900">{crop.farmer.name}</div>
                        <div className="flex items-center justify-center mt-1">
                          <div className="flex mr-1">
                            {renderStars(crop.farmer.rating)}
                          </div>
                          <span className="text-sm text-gray-600">({crop.farmer.rating})</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 inline mr-1" />
                          {crop.farmer.location}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Nutrition Facts */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Nutrition (per 100g)</td>
                    {comparisonResult.crops.map((crop) => (
                      <td key={crop.id} className="px-4 py-3 text-center">
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">{crop.nutritionFacts.calories}</span> cal</div>
                          <div className={`${isHighlighted(crop, 'protein') ? 'font-semibold text-green-600' : ''}`}>
                            <span className="font-medium">{crop.nutritionFacts.protein}g</span> protein
                          </div>
                          <div><span className="font-medium">{crop.nutritionFacts.fiber}g</span> fiber</div>
                          {crop.nutritionFacts.vitaminC && (
                            <div><span className="font-medium">{crop.nutritionFacts.vitaminC}mg</span> Vit C</div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Sustainability */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Sustainability</td>
                    {comparisonResult.crops.map((crop) => (
                      <td key={crop.id} className={`px-4 py-3 text-center ${getHighlightClass(isHighlighted(crop, 'sustainability'))}`}>
                        <div className={`text-2xl font-bold ${getSustainabilityColor(crop.sustainabilityMetrics.score)}`}>
                          {crop.sustainabilityMetrics.score}/100
                        </div>
                        <div className="text-xs text-gray-600 space-y-1 mt-2">
                          <div className="flex items-center justify-center">
                            <Zap className="h-3 w-3 mr-1" />
                            {crop.sustainabilityMetrics.carbonFootprint}kg CO₂
                          </div>
                          <div className="flex items-center justify-center">
                            <Droplets className="h-3 w-3 mr-1" />
                            {crop.sustainabilityMetrics.waterUsage}L water
                          </div>
                          {crop.sustainabilityMetrics.organicCertified && (
                            <div className="text-green-600 font-medium">Organic</div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Quality */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Quality</td>
                    {comparisonResult.crops.map((crop) => (
                      <td key={crop.id} className={`px-4 py-3 text-center ${getHighlightClass(isHighlighted(crop, 'freshness'))}`}>
                        <div className={`text-lg font-bold ${getFreshnessColor(crop.qualityMetrics.freshness)}`}>
                          {crop.qualityMetrics.freshness}% Fresh
                        </div>
                        <div className="text-xs text-gray-600 space-y-1 mt-2">
                          <div className="flex items-center justify-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {crop.qualityMetrics.shelfLife} days shelf life
                          </div>
                          <div>Harvested: {new Date(crop.qualityMetrics.harvestDate).toLocaleDateString()}</div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Reviews */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Customer Reviews</td>
                    {comparisonResult.crops.map((crop) => (
                      <td key={crop.id} className={`px-4 py-3 text-center ${getHighlightClass(isHighlighted(crop, 'rating'))}`}>
                        <div className="flex items-center justify-center mb-1">
                          <div className="flex mr-1">
                            {renderStars(crop.reviews.averageRating)}
                          </div>
                          <span className="font-semibold">{crop.reviews.averageRating}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {crop.reviews.totalReviews} reviews
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Certifications */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Certifications</td>
                    {comparisonResult.crops.map((crop) => (
                      <td key={crop.id} className="px-4 py-3 text-center">
                        <div className="space-y-1">
                          {crop.certifications.slice(0, 3).map((cert, index) => (
                            <div key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                              {cert}
                            </div>
                          ))}
                          {crop.certifications.length > 3 && (
                            <div className="text-xs text-gray-500">+{crop.certifications.length - 3} more</div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Actions</td>
                    {comparisonResult.crops.map((crop) => (
                      <td key={crop.id} className="px-4 py-3 text-center">
                        <div className="space-y-2">
                          <button className="w-full bg-farm-green-600 text-white py-2 px-3 rounded-md hover:bg-farm-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1">
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </button>
                          <div className="text-xs text-gray-600">
                            {crop.quantity} {crop.unit}s available
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {selectedCropIds.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="max-w-md mx-auto">
            <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Start Comparing Crops</h3>
            <p className="text-gray-600 mb-6">
              Add crops to compare their prices, nutrition, sustainability, and quality metrics side by side.
            </p>
            <button
              onClick={() => setShowSearch(true)}
              className="bg-farm-green-600 text-white px-6 py-2 rounded-md hover:bg-farm-green-700 transition-colors font-medium"
            >
              Add Your First Crop
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropComparison;
