import React, { useState, useEffect } from 'react';
import { recommendationService } from '../services/recommendationService';
import { TrendingUp, TrendingDown, Minus, Bell, BellOff, AlertCircle, Target } from 'lucide-react';

interface PricePredictionProps {
  cropId: string;
  cropName: string;
  currentPrice: number;
  userId?: string;
}

const PricePrediction: React.FC<PricePredictionProps> = ({ cropId, cropName, currentPrice, userId }) => {
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const pred = await recommendationService.getPricePrediction(cropId);
        setPrediction(pred);
      } catch (error) {
        console.error('Error fetching price prediction:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadAlerts = () => {
      if (userId) {
        const userAlerts = recommendationService.getPriceAlerts(userId);
        const cropAlerts = userAlerts.filter(alert => 
          alert.cropName.toLowerCase().includes(cropName.toLowerCase()) && alert.isActive
        );
        setAlerts(cropAlerts);
      }
    };

    fetchPrediction();
    loadAlerts();
  }, [cropId, cropName, userId]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendText = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'Expected to rise';
      case 'down':
        return 'Expected to fall';
      default:
        return 'Expected to remain stable';
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !targetPrice) return;

    try {
      const price = parseFloat(targetPrice);
      if (price <= 0) {
        setAlertMessage('Please enter a valid price');
        return;
      }

      const alert = recommendationService.createPriceAlert(cropName, price, userId);
      setAlerts([...alerts, alert]);
      setTargetPrice('');
      setShowAlertForm(false);
      setAlertMessage(`Alert set! You'll be notified when ${cropName} drops to $${price.toFixed(2)} or below.`);
      
      setTimeout(() => setAlertMessage(''), 5000);
    } catch (error) {
      setAlertMessage('Failed to create price alert');
      setTimeout(() => setAlertMessage(''), 3000);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Price Prediction</h3>
        </div>
        <div className="animate-pulse">
          <div className="bg-gray-200 h-20 rounded mb-4"></div>
          <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-200 h-4 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Price Prediction</h3>
        </div>
        <p className="text-gray-500">Price prediction unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Price Prediction</h3>
        </div>
        <span className="text-sm text-gray-500">Next {prediction.timeframe}</span>
      </div>

      {/* Current vs Predicted Price */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Current Price</div>
          <div className="text-2xl font-bold text-gray-900">${currentPrice.toFixed(2)}</div>
        </div>
        
        <div className="text-center p-4 border border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Predicted Price</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-bold text-gray-900">${prediction.predicted.toFixed(2)}</span>
            {getTrendIcon(prediction.trend)}
          </div>
        </div>
      </div>

      {/* Prediction Details */}
      <div className="mb-6">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getTrendColor(prediction.trend)}`}>
          {getTrendIcon(prediction.trend)}
          <span className="font-medium">{getTrendText(prediction.trend)}</span>
          <span className="ml-auto text-sm">
            {Math.abs(((prediction.predicted - currentPrice) / currentPrice) * 100).toFixed(1)}% change
          </span>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          <span>Confidence: </span>
          <span className={`font-medium ${getConfidenceColor(prediction.confidence)}`}>
            {(prediction.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Price Alerts Section */}
      {userId && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">Price Alerts</span>
            </div>
            <button
              onClick={() => setShowAlertForm(!showAlertForm)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              <Bell className="h-4 w-4" />
              Set Alert
            </button>
          </div>

          {alertMessage && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <AlertCircle className="h-4 w-4" />
                {alertMessage}
              </div>
            </div>
          )}

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Active Alerts:</div>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="text-sm text-gray-700">
                      Alert when price drops to <span className="font-medium">${alert.targetPrice.toFixed(2)}</span>
                    </div>
                    <BellOff className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alert Form */}
          {showAlertForm && (
            <form onSubmit={handleCreateAlert} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alert me when {cropName} price drops to:
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
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium text-sm"
                >
                  Create Alert
                </button>
                <button
                  type="button"
                  onClick={() => setShowAlertForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default PricePrediction;
