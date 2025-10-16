import React, { useState, useEffect } from 'react';
import { recommendationService } from '../services/recommendationService';
import { Bell, X, TrendingDown, Check } from 'lucide-react';

interface NotificationsProps {
  userId?: string;
}

const Notifications: React.FC<NotificationsProps> = ({ userId }) => {
  const [triggeredAlerts, setTriggeredAlerts] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;

    const checkAlerts = () => {
      const alerts = recommendationService.checkPriceAlerts(userId);
      const newAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
      
      if (newAlerts.length > 0) {
        setTriggeredAlerts(newAlerts);
        setIsVisible(true);
      }
    };

    // Check alerts immediately
    checkAlerts();

    // Set up periodic checking (every 30 seconds in real app, for demo we'll use 5 seconds)
    const interval = setInterval(checkAlerts, 5000);

    return () => clearInterval(interval);
  }, [userId, dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set(Array.from(prev).concat(alertId)));
    setTriggeredAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    if (triggeredAlerts.length <= 1) {
      setIsVisible(false);
    }
  };

  const dismissAll = () => {
    const allIds = triggeredAlerts.map(alert => alert.id);
    setDismissedAlerts(prev => new Set(Array.from(prev).concat(allIds)));
    setTriggeredAlerts([]);
    setIsVisible(false);
  };

  if (!isVisible || triggeredAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-50 px-4 py-3 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Price Alerts</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {triggeredAlerts.length}
              </span>
            </div>
            <button
              onClick={dismissAll}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Dismiss All
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="max-h-96 overflow-y-auto">
          {triggeredAlerts.map((alert) => (
            <div key={alert.id} className="p-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {alert.cropName}
                    </h4>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">
                    Target: ${alert.targetPrice.toFixed(2)} → Current: ${alert.currentPrice.toFixed(2)}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                      <Check className="h-3 w-3" />
                      Target reached!
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Footer */}
        <div className="bg-gray-50 px-4 py-3">
          <div className="text-center">
            <a
              href="/crops"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={dismissAll}
            >
              View Crops →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
