import React, { useState, useEffect } from 'react';
import { Calendar, Package, Pause, Play, X, Plus, Clock, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { subscriptionService, Subscription } from '../services/subscriptionService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const SubscriptionsPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadSubscriptions();
  }, [isAuthenticated, filter]);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filter !== 'all') params.status = filter;
      const { subscriptions } = await subscriptionService.getSubscriptions(params);
      setSubscriptions(subscriptions);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (subscriptionId: string, reason: string) => {
    setProcessingId(subscriptionId);
    try {
      await subscriptionService.pauseSubscription(subscriptionId, reason);
      await loadSubscriptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleResume = async (subscriptionId: string) => {
    setProcessingId(subscriptionId);
    try {
      await subscriptionService.resumeSubscription(subscriptionId);
      await loadSubscriptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (subscriptionId: string, reason: string) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    
    setProcessingId(subscriptionId);
    try {
      await subscriptionService.cancelSubscription(subscriptionId, reason);
      await loadSubscriptions();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'expired', label: 'Expired' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please sign in to view your subscriptions</h2>
        <p className="text-gray-600">Manage your recurring deliveries and get fresh produce automatically.</p>
        <Link to="/login" className="inline-block mt-4 bg-farm-green-600 text-white px-6 py-2 rounded-lg hover:bg-farm-green-700">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-farm-green-600" />
          My Subscriptions
        </h1>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Link
            to="/subscriptions/create"
            className="bg-farm-green-600 text-white px-4 py-2 rounded-lg hover:bg-farm-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Subscription
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">Loading subscriptions...</div>
      ) : subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold">No subscriptions found</h3>
          <p className="text-gray-600 mb-4">Set up recurring deliveries to get fresh produce automatically.</p>
          <Link
            to="/subscriptions/create"
            className="inline-block bg-farm-green-600 text-white px-6 py-2 rounded-lg hover:bg-farm-green-700"
          >
            Create Your First Subscription
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subscriptions.map((subscription) => {
            const daysUntilNext = subscriptionService.getDaysUntilNextDelivery(subscription.nextDeliveryDate);
            const isProcessing = processingId === subscription._id;

            return (
              <div key={subscription._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {subscription.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${subscriptionService.getStatusColor(subscription.status)}`}>
                    {subscriptionService.getStatusLabel(subscription.status)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">Items</p>
                      <ul>
                        {subscription.items.slice(0, 2).map((item, idx) => (
                          <li key={idx}>
                            {item.crop.name} x {item.quantity}
                          </li>
                        ))}
                        {subscription.items.length > 2 && (
                          <li className="text-gray-500">+{subscription.items.length - 2} more</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">Delivery</p>
                      <p>{subscriptionService.getFrequencyLabel(subscription.frequency)}</p>
                      {subscription.status === 'active' && (
                        <p className={`${daysUntilNext <= 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                          {daysUntilNext > 0 
                            ? `Next delivery in ${daysUntilNext} ${daysUntilNext === 1 ? 'day' : 'days'}`
                            : 'Due today'
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">Performance</p>
                      <p>{subscription.metrics.totalOrders} deliveries completed</p>
                      <p>{subscriptionService.formatCurrency(subscription.metrics.totalSpent)} total spent</p>
                      {subscription.metrics.satisfactionScore > 0 && (
                        <p>★ {subscription.metrics.satisfactionScore.toFixed(1)} satisfaction</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {subscription.status === 'active' && subscriptionService.canPause(subscription.status) && (
                      <button
                        onClick={() => handlePause(subscription._id, 'User requested pause')}
                        disabled={isProcessing}
                        className="text-yellow-600 hover:text-yellow-700 p-1 rounded"
                        title="Pause subscription"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    
                    {subscription.status === 'paused' && subscriptionService.canResume(subscription.status) && (
                      <button
                        onClick={() => handleResume(subscription._id)}
                        disabled={isProcessing}
                        className="text-green-600 hover:text-green-700 p-1 rounded"
                        title="Resume subscription"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    {subscriptionService.canCancel(subscription.status) && (
                      <button
                        onClick={() => handleCancel(subscription._id, 'User requested cancellation')}
                        disabled={isProcessing}
                        className="text-red-600 hover:text-red-700 p-1 rounded"
                        title="Cancel subscription"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <Link
                      to={`/subscriptions/${subscription._id}/edit`}
                      className="text-gray-600 hover:text-gray-700 p-1 rounded"
                      title="Edit subscription"
                    >
                      <Settings className="w-4 h-4" />
                    </Link>
                  </div>

                  <Link
                    to={`/subscriptions/${subscription._id}`}
                    className="text-farm-green-600 hover:underline text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>

                {isProcessing && (
                  <div className="mt-3 text-center">
                    <div className="inline-block w-4 h-4 border-2 border-farm-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-sm text-gray-600">Processing...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      {subscriptions.length > 0 && (
        <div className="mt-8 bg-farm-green-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-farm-green-800 mb-4">Subscription Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-farm-green-700">
                {subscriptions.filter(s => s.status === 'active').length}
              </p>
              <p className="text-sm text-farm-green-600">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-farm-green-700">
                {subscriptions.reduce((sum, s) => sum + s.metrics.totalSpent, 0).toFixed(0)}
              </p>
              <p className="text-sm text-farm-green-600">Total Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-farm-green-700">
                {subscriptions.reduce((sum, s) => sum + s.metrics.totalOrders, 0)}
              </p>
              <p className="text-sm text-farm-green-600">Deliveries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-farm-green-700">
                {subscriptions
                  .filter(s => s.metrics.satisfactionScore > 0)
                  .reduce((sum, s, _, arr) => sum + s.metrics.satisfactionScore / arr.length, 0)
                  .toFixed(1) || '0.0'}
              </p>
              <p className="text-sm text-farm-green-600">Avg Rating</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
