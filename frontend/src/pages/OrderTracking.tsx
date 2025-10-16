import React, { useEffect, useState } from 'react';
import { Package, Truck, MapPin, Clock, ChevronRight, AlertTriangle, CheckCircle2, MessageCircle } from 'lucide-react';
import { orderTrackingService, Order } from '../services/orderTrackingService';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const OrderTrackingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!isAuthenticated) return;
    loadOrders();
  }, [isAuthenticated, filter]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (filter !== 'all') params.status = filter;
      const { orders } = await orderTrackingService.getOrders(params);
      setOrders(orders);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Please sign in to view your orders</h2>
        <p className="text-gray-600">Track your deliveries, view statuses, and get delivery estimates.</p>
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
          <Truck className="w-6 h-6 text-farm-green-600" />
          Order Tracking
        </h1>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">Loading orders...</div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 rounded-lg p-4">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold">No orders found</h3>
          <p className="text-gray-600">Your orders will appear here once you place one.</p>
          <Link to="/crops" className="inline-block mt-4 bg-farm-green-600 text-white px-6 py-2 rounded-lg hover:bg-farm-green-700">
            Browse Crops
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-semibold">{order.orderId}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${orderTrackingService.getStatusColor(order.currentStatus)}`}>
                  {orderTrackingService.getStatusLabel(order.currentStatus)}
                </span>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium">Delivery Address</p>
                  <p>{order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium">Estimated Delivery</p>
                  <p>{order.logisticsProvider?.estimatedDelivery ? new Date(order.logisticsProvider.estimatedDelivery).toLocaleString() : 'TBD'}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-700 font-medium mb-2">Items</p>
                <ul className="space-y-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between text-sm">
                      <span>{item.crop.name} x {item.quantity}</span>
                      <span className="text-gray-600">{orderTrackingService.formatCurrency(item.totalPrice)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t pt-2 text-sm">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">{orderTrackingService.formatCurrency(order.totalAmount)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Link to={`/orders/${order._id}`} className="text-farm-green-600 hover:underline flex items-center gap-1">
                  View details <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to={`/chat`} className="text-sm text-gray-600 hover:text-farm-green-700 flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> Contact support
                </Link>
              </div>

              {order.currentStatus === 'delivered' && (
                <div className="mt-4 bg-green-50 text-green-700 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Delivered on {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'N/A'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
