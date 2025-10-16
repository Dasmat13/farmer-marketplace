import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService, Recommendation } from '../services/recommendationService';
import { Sparkles, TrendingUp, Clock, MapPin, User } from 'lucide-react';

interface CropRecommendationsProps {
  currentCropId: string;
  userId?: string;
}

const CropRecommendations: React.FC<CropRecommendationsProps> = ({ currentCropId, userId }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const recs = await recommendationService.getRecommendationsFor(currentCropId, userId);
        setRecommendations(recs);
      } catch (err) {
        setError('Failed to load recommendations');
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentCropId) {
      fetchRecommendations();
    }
  }, [currentCropId, userId]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.8) return 'Good';
    return 'Fair';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-farm-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-farm-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-farm-green-600 hover:text-farm-green-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-farm-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">No recommendations available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-farm-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <span className="text-sm text-gray-500 flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          Powered by AI
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((recommendation) => (
          <Link
            key={recommendation.cropId}
            to={`/crops/${recommendation.cropId}`}
            className="group block bg-gray-50 rounded-lg p-4 hover:bg-farm-green-50 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-farm-green-200"
          >
            {/* Crop Name and Price */}
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-900 group-hover:text-farm-green-700 line-clamp-1">
                {recommendation.cropName}
              </h4>
              <span className="text-lg font-bold text-farm-green-600 ml-2">
                ${recommendation.price.toFixed(2)}
              </span>
            </div>

            {/* Recommendation Reason */}
            <div className="mb-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {recommendation.reason}
              </p>
            </div>

            {/* Farmer and Location */}
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">{recommendation.farmer}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{recommendation.location}</span>
              </div>
            </div>

            {/* Confidence Badge */}
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                {getConfidenceText(recommendation.confidence)} Match
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>Just now</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      <div className="mt-6 text-center border-t pt-4">
        <Link 
          to="/crops" 
          className="text-farm-green-600 hover:text-farm-green-700 font-medium text-sm"
        >
          View all crops →
        </Link>
      </div>
    </div>
  );
};

export default CropRecommendations;
