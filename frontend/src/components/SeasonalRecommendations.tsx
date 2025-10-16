import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService, Recommendation } from '../services/recommendationService';
import { Leaf, Calendar, MapPin, User, TrendingUp, ArrowRight } from 'lucide-react';

interface SeasonalRecommendationsProps {
  title?: string;
  showHeader?: boolean;
  maxItems?: number;
  className?: string;
}

const SeasonalRecommendations: React.FC<SeasonalRecommendationsProps> = ({ 
  title = "In Season Now", 
  showHeader = true,
  maxItems = 4,
  className = ""
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSeason, setCurrentSeason] = useState('');

  useEffect(() => {
    const fetchSeasonalRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const recs = await recommendationService.getSeasonalRecommendations();
        setRecommendations(recs.slice(0, maxItems));
        
        // Determine current season
        const month = new Date().getMonth() + 1;
        let season = '';
        if (month >= 3 && month <= 5) season = 'Spring';
        else if (month >= 6 && month <= 8) season = 'Summer';
        else if (month >= 9 && month <= 11) season = 'Fall';
        else season = 'Winter';
        
        setCurrentSeason(season);
      } catch (err) {
        setError('Failed to load seasonal recommendations');
        console.error('Error fetching seasonal recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasonalRecommendations();
  }, [maxItems]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].slice(0, maxItems).map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-24 rounded-lg mb-3"></div>
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
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="text-center py-8">
          <p className="text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="text-center py-8">
          <p className="text-gray-500">No seasonal recommendations available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>{currentSeason} 2024</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((recommendation) => (
          <Link
            key={recommendation.cropId}
            to={`/crops/${recommendation.cropId}`}
            className="group block bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 hover:from-green-100 hover:to-emerald-100 hover:shadow-md transition-all duration-200 border border-green-100 hover:border-green-200"
          >
            {/* Header with price and trend */}
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold text-gray-900 group-hover:text-green-700 line-clamp-1">
                {recommendation.cropName}
              </h4>
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-green-600">
                  ${recommendation.price.toFixed(2)}
                </span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
            </div>

            {/* Reason */}
            <div className="mb-3">
              <p className="text-sm text-green-700 font-medium">
                {recommendation.reason}
              </p>
            </div>

            {/* Farmer and Location */}
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">{recommendation.farmer}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{recommendation.location}</span>
              </div>
            </div>

            {/* Seasonal Badge */}
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                Peak Season
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Call to action */}
      <div className="mt-6 text-center border-t pt-4">
        <Link 
          to="/crops" 
          className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center justify-center gap-1"
        >
          Explore all seasonal crops
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default SeasonalRecommendations;
