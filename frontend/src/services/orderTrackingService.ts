import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface DeliveryLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface TrackingUpdate {
  _id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  timestamp: string;
  location?: DeliveryLocation;
  notes?: string;
  updatedBy: {
    _id: string;
    name: string;
  };
  estimatedDelivery?: string;
  actualDelivery?: string;
  driverInfo?: {
    name: string;
    phone: string;
    vehicleType: string;
    licensePlate: string;
  };
}

export interface OrderItem {
  crop: {
    _id: string;
    name: string;
    category: string;
    images: string[];
    price: number;
  };
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  deliveryInstructions?: string;
  contactPhone?: string;
}

export interface Order {
  _id: string;
  orderId: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  farmer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  deliveryMethod: 'home_delivery' | 'pickup' | 'local_hub' | 'shipping';
  deliveryWindow?: {
    startTime: string;
    endTime: string;
    timeSlot: string;
  };
  tracking: TrackingUpdate[];
  currentStatus: 'pending' | 'confirmed' | 'preparing' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  logisticsProvider: {
    name?: string;
    trackingNumber?: string;
    serviceLevel?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
  };
  qualityRating?: {
    rating: number;
    feedback: string;
    photos: string[];
    timestamp: string;
  };
  payment: {
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    method: string;
    transactionId: string;
    paidAt?: string;
  };
  orderDate: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  estimatedDelivery?: string;
}

export interface CreateOrderData {
  farmer: string;
  items: {
    crop: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    specialInstructions?: string;
  }[];
  subtotal: number;
  deliveryFee?: number;
  tax?: number;
  discount?: number;
  totalAmount: number;
  deliveryAddress: DeliveryAddress;
  deliveryMethod: 'home_delivery' | 'pickup' | 'local_hub' | 'shipping';
  deliveryWindow?: {
    startTime: string;
    endTime: string;
    timeSlot: string;
  };
  specialRequests?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: {
    _id: string;
    count: number;
    totalAmount: number;
  }[];
}

class OrderTrackingService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Create a new order
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData, {
        headers: this.getAuthHeader()
      });
      return response.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  }

  // Get user's orders (buyer or farmer)
  async getOrders(params?: { 
    status?: string; 
    limit?: number; 
    page?: number; 
  }): Promise<{ orders: Order[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await axios.get(`${API_URL}/orders?${queryParams}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  }

  // Get specific order details
  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: this.getAuthHeader()
      });
      return response.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  }

  // Track order by tracking number (public)
  async trackOrder(trackingNumber: string): Promise<Partial<Order>> {
    try {
      const response = await axios.get(`${API_URL}/track/${trackingNumber}`);
      return response.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Order not found');
    }
  }

  // Add tracking update (farmers only)
  async addTrackingUpdate(
    orderId: string, 
    update: {
      status: string;
      location?: DeliveryLocation;
      notes?: string;
      estimatedDelivery?: string;
      driverInfo?: any;
    }
  ): Promise<void> {
    try {
      await axios.post(`${API_URL}/orders/${orderId}/tracking`, update, {
        headers: this.getAuthHeader()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update tracking');
    }
  }

  // Update delivery window
  async updateDeliveryWindow(
    orderId: string,
    deliveryWindow: {
      startTime: string;
      endTime: string;
      timeSlot: string;
    }
  ): Promise<void> {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/delivery-window`, deliveryWindow, {
        headers: this.getAuthHeader()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update delivery window');
    }
  }

  // Rate order quality (buyers only)
  async rateOrder(
    orderId: string,
    rating: {
      rating: number;
      feedback: string;
      photos?: string[];
    }
  ): Promise<void> {
    try {
      await axios.post(`${API_URL}/orders/${orderId}/rate`, rating, {
        headers: this.getAuthHeader()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to rate order');
    }
  }

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<void> {
    try {
      await axios.patch(`${API_URL}/orders/${orderId}/cancel`, { reason }, {
        headers: this.getAuthHeader()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  }

  // Get order statistics
  async getOrderStats(timeframe = '30d'): Promise<OrderStats> {
    try {
      const response = await axios.get(`${API_URL}/analytics/order-stats?timeframe=${timeframe}`, {
        headers: this.getAuthHeader()
      });
      return response.data.stats;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order statistics');
    }
  }

  // Get daily deliveries (for logistics)
  async getDailyDeliveries(date?: string): Promise<Order[]> {
    try {
      const queryParams = date ? `?date=${date}` : '';
      const response = await axios.get(`${API_URL}/logistics/daily-deliveries${queryParams}`, {
        headers: this.getAuthHeader()
      });
      return response.data.orders;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch daily deliveries');
    }
  }

  // Utility functions
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100',
      preparing: 'text-orange-600 bg-orange-100',
      packed: 'text-purple-600 bg-purple-100',
      shipped: 'text-indigo-600 bg-indigo-100',
      out_for_delivery: 'text-green-600 bg-green-100',
      delivered: 'text-green-800 bg-green-200',
      cancelled: 'text-red-600 bg-red-100',
      returned: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      packed: 'Packed',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned'
    };
    return labels[status] || status;
  }

  getProgressPercentage(status: string): number {
    const statusOrder = ['pending', 'confirmed', 'preparing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isDelivered(status: string): boolean {
    return status === 'delivered';
  }

  isCancellable(status: string): boolean {
    return ['pending', 'confirmed', 'preparing'].includes(status);
  }

  isRatable(status: string): boolean {
    return status === 'delivered';
  }
}

export const orderTrackingService = new OrderTrackingService();
