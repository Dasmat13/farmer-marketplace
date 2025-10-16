import React, { useState, useEffect } from 'react';
import { TrendingUp, Cloud, Activity, AlertCircle } from 'lucide-react';
import { getPricePrediction, getMarketAnalysis, checkAIServiceHealth, CropData, PredictionResponse, MarketAnalysis } from '../utils/aiService';

interface AIPredictionProps {
  cropName: string;
  currentPrice: number;
  location?: {
    city?: string;
    state?: string;
  };
}

const AIPrediction: React.FC<AIPredictionProps> = ({ cropName, currentPrice, location }) => {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(false);

  useEffect(() => {
    checkAIHealth();
  }, []);

  useEffect(() => {
    if (aiServiceAvailable && cropName && currentPrice) {
      loadPredictions();
    }
  }, [cropName, currentPrice, aiServiceAvailable]);

  const checkAIHealth = async () => {
    try {
      const healthy = await checkAIServiceHealth();
      setAiServiceAvailable(healthy);
    } catch (error) {
      setAiServiceAvailable(false);
    }
  };

  const loadPredictions = async () => {
    setLoading(true);
    setError(null);

    try {
      const cropData: CropData = {
        name: cropName,
        category: getCropCategory(cropName),
        current_price: currentPrice,
        location: location || { city: 'Unknown', state: 'Unknown' }
      };

      const [predictionData, analysisData] = await Promise.all([
        getPricePrediction(cropData, undefined, 7), // 7-day prediction
        getMarketAnalysis(cropName)
      ]);

      setPrediction(predictionData);
      setMarketAnalysis(analysisData);
    } catch (err) {
      setError('Failed to load AI predictions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getCropCategory = (name: string): string => {
    const categories: { [key: string]: string } = {
      tomatoes: 'Vegetables',
      corn: 'Grains',
      wheat: 'Grains',
      lettuce: 'Leafy Greens',
      carrots: 'Root Vegetables',
      apples: 'Fruits',
      potatoes: 'Root Vegetables'
    };
    return categories[name.toLowerCase()] || 'Other';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-green-600';
      case 'decreasing': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!aiServiceAvailable) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">AI Service Unavailable</h3>
            <p className="text-sm text-yellow-700 mt-1">
              The AI prediction service is currently unavailable. Please check that the AI service is running on port 8000.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-gray-400 mr-2" />
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={loadPredictions}
              className="text-sm text-red-600 hover:text-red-800 mt-2 underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Predictions */}
      {prediction && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-6 w-6 text-farm-green-600 mr-2" />
            <h3 className="text-lg font-semibold">AI Price Predictions</h3>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Current Price: <span className="font-semibold text-gray-900">${prediction.current_price}</span></span>
              <span className={`font-medium ${getTrendColor(prediction.market_trend)}`}>
                Trend: {prediction.market_trend}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {prediction.predictions.slice(0, 6).map((pred, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <div className="text-sm text-gray-600">{pred.date}</div>
                <div className="text-lg font-semibold">${pred.predicted_price}</div>
                <div className="text-xs text-gray-500">
                  Confidence: {Math.round(pred.confidence * 100)}%
                </div>
                <div className="text-xs text-gray-500">
                  Demand: {pred.demand_level}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Cloud className="h-4 w-4 mr-1" />
            {prediction.weather_impact}
          </div>
        </div>
      )}

      {/* Market Analysis */}
      {marketAnalysis && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-farm-green-600 mr-2" />
            <h3 className="text-lg font-semibold">Market Analysis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className="text-2xl font-bold text-gray-900">${marketAnalysis.current_price}</div>
              <div className="text-sm text-gray-600">Current Price</div>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className="text-2xl font-bold text-gray-900">${marketAnalysis.avg_price_30d}</div>
              <div className="text-sm text-gray-600">30-Day Average</div>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className="text-2xl font-bold text-gray-900">{marketAnalysis.price_volatility.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Volatility</div>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className={`text-lg font-semibold ${getSentimentColor(marketAnalysis.market_sentiment)}`}>
                {marketAnalysis.market_sentiment}
              </div>
              <div className="text-sm text-gray-600">Market Sentiment</div>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className="text-lg font-semibold text-gray-900">{marketAnalysis.supply_level}</div>
              <div className="text-sm text-gray-600">Supply Level</div>
            </div>
            
            <div className="text-center p-4 border border-gray-200 rounded">
              <div className="text-lg font-semibold text-gray-900">{marketAnalysis.demand_forecast}</div>
              <div className="text-sm text-gray-600">Demand Forecast</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPrediction;
