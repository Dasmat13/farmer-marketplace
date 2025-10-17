import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface SubscriptionItem {
  crop: {
    _id: string;
    name: string;
    category: string;
    images: string[];
    price: number;
  };
  quantity: number;
  maxPricePerUnit: number;
  substitutionAllowed: boolean;
  acceptableSubstitutes?: string[];
  seasonalAdjustment?: {
    enabled: boolean;
    minQuantity?: number;
    maxQuantity?: number;
  };
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  deliveryInstructions?: string;
  contactPhone?: string;
}

export interface DeliveryWindow {
  preferredDays: string[];
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'anytime';
  avoidDates: string[];
}

export interface Budget {
  maxPerDelivery?: number;
  maxPerMonth?: number;
  currency: string;
}

export interface Subscription {
  _id: string;
  subscriptionId: string;
  customer: {
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
  title: string;
  description?: string;
  items: SubscriptionItem[];
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'custom';
  customFrequencyDays?: number;
  deliveryAddress: DeliveryAddress;
  deliveryWindow: DeliveryWindow;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  budget: Budget;
  pricing: {
    baseDeliveryFee: number;
    discountPercentage: number;
    loyaltyDiscount: number;
  };
  startDate: string;
  endDate?: string;
  nextDeliveryDate: string;
  lastDeliveryDate?: string;
  deliveryHistory: DeliveryRecord[];
  flexibility: {
    allowQuantityAdjustment: boolean;
    allowPriceAdjustment: boolean;
    allowItemSubstitution: boolean;
    allowDateShifting: boolean;
    maxDateShiftDays: number;
  };
  notifications: {
    upcomingDelivery: { enabled: boolean; daysBefore: number };
    priceChanges: { enabled: boolean; threshold: number };
    itemUnavailable: { enabled: boolean };
    deliveryConfirmation: { enabled: boolean };
  };
  metrics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    satisfactionScore: number;
    missedDeliveries: number;
    pausedDays: number;
  };
  paymentMethod?: {
    type: 'credit_card' | 'debit_card' | 'bank_account' | 'digital_wallet';
    lastFour: string;
    expiryDate: string;
  };
  customerNotes?: string;
  farmerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRecord {
  orderId: string;
  deliveredDate: string;
  totalAmount: number;
  itemsDelivered: {
    crop: string;
    quantity: number;
    price: number;
  }[];
  customerSatisfaction?: {
    rating: number;
    feedback: string;
    timestamp: string;
  };
}

export interface CreateSubscriptionData {
  farmer: string;
  title: string;
  description?: string;
  items: {
    crop: string;
    quantity: number;
    maxPricePerUnit: number;
    substitutionAllowed?: boolean;
    acceptableSubstitutes?: string[];
  }[];
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'custom';
  customFrequencyDays?: number;
  deliveryAddress: DeliveryAddress;
  deliveryWindow: DeliveryWindow;
  budget?: Budget;
  startDate: string;
  endDate?: string;
  flexibility?: {
    allowQuantityAdjustment?: boolean;
    allowPriceAdjustment?: boolean;
    allowItemSubstitution?: boolean;
    allowDateShifting?: boolean;
    maxDateShiftDays?: number;
  };
  notifications?: {
    upcomingDelivery?: { enabled: boolean; daysBefore: number };
    priceChanges?: { enabled: boolean; threshold: number };
    itemUnavailable?: { enabled: boolean };
    deliveryConfirmation?: { enabled: boolean };
  };
  customerNotes?: string;
}

export interface SubscriptionAnalytics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  activeRate: number;
  analytics: {
    _id: string;
    count: number;
    totalRevenue: number;
    averageSatisfaction: number;
  }[];
}

class SubscriptionService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Create a new subscription
  async createSubscription(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
    try {
      const response = await axios.post(`${API_URL}/subscriptions`, subscriptionData, {
        headers: this.getAuthHeader()
      });
      return response.data.subscription;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create subscription');
    }
  }

  // Get user's subscriptions
  async getSubscriptions(params?: {
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<{ subscriptions: Subscription[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await axios.get(`${API_URL}/subscriptions?${queryParams}`, {
        headers: this.getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }

  // Get specific subscription details
  async getSubscriptionById(subscriptionId: string): Promise<Subscription> {
    try {
      const response = await axios.get(`${API_URL}/subscriptions/${subscriptionId}`, {
        headers: this.getAuthHeader()
      });
      return response.data.subscription;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId: string, updateData: Partial<CreateSubscriptionData>): Promise<Subscription> {
    try {
      const response = await axios.patch(`${API_URL}/subscriptions/${subscriptionId}`, updateData, {
        headers: this.getAuthHeader()
      });
      return response.data.subscription;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update subscription');
    }
  }

  // Pause subscription
  async pauseSubscription(subscriptionId: string, reason?: string): Promise<void> {
    try {
      await axios.patch(`${API_URL}/subscriptions/${subscriptionId}/pause`, { reason }, {
        headers: this.getAuthHeader()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to pause subscription');
    }
  }

  // Resume subscription
  async resumeSubscription(subscriptionId: string): Promise<{ nextDeliveryDate: string }> {
    try {
      const response = await axios.patch(`${API_URL}/subscriptions/${subscriptionId}/resume`, {}, {
        headers: this.getAuthHeader()
      });
      return { nextDeliveryDate: response.data.nextDeliveryDate };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to resume subscription');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, reason: string, refundAmount?: number): Promise<void> {
    try {
      await axios.patch(`${API_URL}/subscriptions/${subscriptionId}/cancel`, {
        reason,
        refundAmount
      }, {
        headers: this.getAuthHeader()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }

  // Rate a delivery
  async rateDelivery(subscriptionId: string, rating: number, feedback: string): Promise<void> {
    try {
      await axios.post(`${API_URL}/subscriptions/${subscriptionId}/rate`, {
        rating,
        feedback
      }, {
        headers: this.getAuthHeader()
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to rate delivery');
    }
  }

  // Get upcoming deliveries
  async getUpcomingDeliveries(days = 7): Promise<Subscription[]> {
    try {
      const response = await axios.get(`${API_URL}/subscriptions/upcoming/deliveries?days=${days}`, {
        headers: this.getAuthHeader()
      });
      return response.data.deliveries;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming deliveries');
    }
  }

  // Process delivery (farmers only)
  async processDelivery(subscriptionId: string): Promise<{ orderId: string; totalAmount: number; nextDeliveryDate: string }> {
    try {
      const response = await axios.post(`${API_URL}/subscriptions/${subscriptionId}/process-delivery`, {}, {
        headers: this.getAuthHeader()
      });
      return response.data.order;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to process delivery');
    }
  }

  // Get subscription analytics
  async getAnalytics(timeframe = '30d'): Promise<SubscriptionAnalytics> {
    try {
      const response = await axios.get(`${API_URL}/analytics/subscriptions?timeframe=${timeframe}`, {
        headers: this.getAuthHeader()
      });
      return {
        ...response.data.summary,
        analytics: response.data.analytics
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }

  // Utility functions
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      active: 'text-green-600 bg-green-100',
      paused: 'text-yellow-600 bg-yellow-100',
      cancelled: 'text-red-600 bg-red-100',
      expired: 'text-gray-600 bg-gray-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Active',
      paused: 'Paused',
      cancelled: 'Cancelled',
      expired: 'Expired'
    };
    return labels[status] || status;
  }

  getFrequencyLabel(frequency: string): string {
    const labels: { [key: string]: string } = {
      weekly: 'Weekly',
      biweekly: 'Every 2 weeks',
      monthly: 'Monthly',
      quarterly: 'Every 3 months',
      custom: 'Custom'
    };
    return labels[frequency] || frequency;
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
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateNextDeliveryDate(frequency: string, customDays?: number, currentDate?: string): Date {
    const baseDate = currentDate ? new Date(currentDate) : new Date();
    const nextDate = new Date(baseDate);

    switch (frequency) {
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'custom':
        if (customDays) {
          nextDate.setDate(nextDate.getDate() + customDays);
        }
        break;
    }

    return nextDate;
  }

  getDaysUntilNextDelivery(nextDeliveryDate: string): number {
    const now = new Date();
    const deliveryDate = new Date(nextDeliveryDate);
    const diffTime = deliveryDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isActive(status: string): boolean {
    return status === 'active';
  }

  canPause(status: string): boolean {
    return status === 'active';
  }

  canResume(status: string): boolean {
    return status === 'paused';
  }

  canCancel(status: string): boolean {
    return ['active', 'paused'].includes(status);
  }
}

export const subscriptionService = new SubscriptionService();
