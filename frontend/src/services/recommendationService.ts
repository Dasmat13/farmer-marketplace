
export interface Recommendation {
  cropId: string;
  cropName: string;
  reason: string;
  confidence: number;
  price: number;
  farmer: string;
  location: string;
}

export interface PriceAlert {
  id: string;
  cropName: string;
  targetPrice: number;
  currentPrice: number;
  userId: string;
  isActive: boolean;
  createdAt: string;
}

class RecommendationService {
  private cropData = [
    { id: 'tomatoes', name: 'Organic Tomatoes', category: 'Vegetables', season: 'summer', price: 3.50, farmer: 'Maria Garcia', location: 'California' },
    { id: 'corn', name: 'Sweet Corn', category: 'Grains', season: 'summer', price: 4.50, farmer: 'John Smith', location: 'Iowa' },
    { id: 'lettuce', name: 'Fresh Lettuce', category: 'Leafy Greens', season: 'spring', price: 2.25, farmer: 'Maria Garcia', location: 'California' },
    { id: 'apples', name: 'Honeycrisp Apples', category: 'Fruits', season: 'fall', price: 5.75, farmer: 'Sarah Chen', location: 'Oregon' },
    { id: 'potatoes', name: 'Russet Potatoes', category: 'Root Vegetables', season: 'fall', price: 1.85, farmer: 'Mike Thompson', location: 'Idaho' },
    { id: 'carrots', name: 'Organic Carrots', category: 'Root Vegetables', season: 'fall', price: 2.75, farmer: 'Mike Thompson', location: 'Idaho' },
    { id: 'spinach', name: 'Baby Spinach', category: 'Leafy Greens', season: 'spring', price: 3.25, farmer: 'Carlos Martinez', location: 'California' },
    { id: 'strawberries', name: 'Fresh Strawberries', category: 'Fruits', season: 'spring', price: 6.50, farmer: 'Amanda Davis', location: 'Florida' }
  ];

  private purchaseHistory = JSON.parse(localStorage.getItem('purchase_history') || '[]');
  private viewHistory = JSON.parse(localStorage.getItem('view_history') || '[]');

  // AI-powered recommendations based on purchase and viewing history
  async getRecommendationsFor(cropId: string, userId?: string): Promise<Recommendation[]> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const currentCrop = this.cropData.find(crop => crop.id === cropId);
    if (!currentCrop) return [];

    const recommendations: Recommendation[] = [];

    // 1. Category-based recommendations (same category)
    const sameCategoryItems = this.cropData.filter(crop => 
      crop.category === currentCrop.category && crop.id !== cropId
    );

    sameCategoryItems.forEach(crop => {
      recommendations.push({
        cropId: crop.id,
        cropName: crop.name,
        reason: `Popular in ${crop.category}`,
        confidence: 0.85,
        price: crop.price,
        farmer: crop.farmer,
        location: crop.location
      });
    });

    // 2. Seasonal recommendations
    const seasonalItems = this.cropData.filter(crop =>
      crop.season === currentCrop.season && crop.id !== cropId && crop.category !== currentCrop.category
    );

    seasonalItems.slice(0, 2).forEach(crop => {
      recommendations.push({
        cropId: crop.id,
        cropName: crop.name,
        reason: `Perfect for ${crop.season} season`,
        confidence: 0.75,
        price: crop.price,
        farmer: crop.farmer,
        location: crop.location
      });
    });

    // 3. Frequently bought together (based on mock data)
    const frequentlyBoughtTogether = this.getFrequentlyBoughtTogether(cropId);
    frequentlyBoughtTogether.forEach(crop => {
      recommendations.push({
        cropId: crop.id,
        cropName: crop.name,
        reason: `Frequently bought with ${currentCrop.name}`,
        confidence: 0.90,
        price: crop.price,
        farmer: crop.farmer,
        location: crop.location
      });
    });

    // 4. Based on user history
    if (userId && this.purchaseHistory.length > 0) {
      const userPreferences = this.analyzeUserPreferences(userId);
      const personalizedItems = this.cropData.filter(crop =>
        userPreferences.includes(crop.category) && crop.id !== cropId
      );

      personalizedItems.slice(0, 2).forEach(crop => {
        recommendations.push({
          cropId: crop.id,
          cropName: crop.name,
          reason: 'Based on your purchase history',
          confidence: 0.95,
          price: crop.price,
          farmer: crop.farmer,
          location: crop.location
        });
      });
    }

    // Remove duplicates and sort by confidence
    const uniqueRecommendations = recommendations.filter((rec, index, self) =>
      index === self.findIndex(r => r.cropId === rec.cropId)
    );

    return uniqueRecommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6);
  }

  // Get seasonal recommendations for dashboard
  async getSeasonalRecommendations(): Promise<Recommendation[]> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const currentSeason = this.getCurrentSeason();
    const seasonalCrops = this.cropData.filter(crop => crop.season === currentSeason);

    return seasonalCrops.slice(0, 4).map(crop => ({
      cropId: crop.id,
      cropName: crop.name,
      reason: `In season now - ${currentSeason}`,
      confidence: 0.80,
      price: crop.price,
      farmer: crop.farmer,
      location: crop.location
    }));
  }

  // Price prediction with alerts
  async getPricePrediction(cropId: string): Promise<{ 
    predicted: number; 
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    timeframe: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const crop = this.cropData.find(c => c.id === cropId);
    if (!crop) throw new Error('Crop not found');

    // Mock price prediction logic
    const variance = (Math.random() - 0.5) * 0.4; // +/- 20% max
    const predicted = crop.price * (1 + variance);
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (variance > 0.05) trend = 'up';
    else if (variance < -0.05) trend = 'down';

    return {
      predicted: Number(predicted.toFixed(2)),
      trend,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      timeframe: '7 days'
    };
  }

  // Price alerts management
  createPriceAlert(cropName: string, targetPrice: number, userId: string): PriceAlert {
    const alert: PriceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cropName,
      targetPrice,
      currentPrice: this.cropData.find(c => c.name.toLowerCase().includes(cropName.toLowerCase()))?.price || 0,
      userId,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const alerts = this.getPriceAlerts(userId);
    alerts.push(alert);
    localStorage.setItem(`price_alerts_${userId}`, JSON.stringify(alerts));

    return alert;
  }

  getPriceAlerts(userId: string): PriceAlert[] {
    const alerts = localStorage.getItem(`price_alerts_${userId}`);
    return alerts ? JSON.parse(alerts) : [];
  }

  checkPriceAlerts(userId: string): PriceAlert[] {
    const alerts = this.getPriceAlerts(userId);
    const triggeredAlerts: PriceAlert[] = [];

    alerts.forEach(alert => {
      if (!alert.isActive) return;

      const crop = this.cropData.find(c => 
        c.name.toLowerCase().includes(alert.cropName.toLowerCase())
      );

      if (crop && crop.price <= alert.targetPrice) {
        triggeredAlerts.push({
          ...alert,
          currentPrice: crop.price
        });
      }
    });

    return triggeredAlerts;
  }

  // Helper methods
  private getFrequentlyBoughtTogether(cropId: string) {
    const combinations = {
      'tomatoes': ['lettuce', 'spinach'],
      'corn': ['potatoes', 'carrots'],
      'lettuce': ['tomatoes', 'carrots'],
      'apples': ['strawberries'],
      'potatoes': ['corn', 'carrots'],
      'carrots': ['potatoes', 'lettuce']
    };

    const relatedIds = combinations[cropId as keyof typeof combinations] || [];
    return this.cropData.filter(crop => relatedIds.includes(crop.id));
  }

  private analyzeUserPreferences(userId: string): string[] {
    // Mock user preference analysis
    const userHistory = this.purchaseHistory.filter((h: any) => h.userId === userId);
    const categories = userHistory.map((h: any) => h.category);
    
    // Return most frequent categories
    const categoryCount = categories.reduce((acc: any, cat: string) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([cat]) => cat);
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  // Track user interactions for better recommendations
  trackView(cropId: string, userId?: string) {
    if (!userId) return;

    const view = {
      cropId,
      userId,
      timestamp: Date.now()
    };

    this.viewHistory.push(view);
    // Keep only last 100 views
    if (this.viewHistory.length > 100) {
      this.viewHistory = this.viewHistory.slice(-100);
    }
    
    localStorage.setItem('view_history', JSON.stringify(this.viewHistory));
  }

  trackPurchase(cropId: string, userId: string, amount: number) {
    const crop = this.cropData.find(c => c.id === cropId);
    if (!crop) return;

    const purchase = {
      cropId,
      userId,
      category: crop.category,
      amount,
      timestamp: Date.now()
    };

    this.purchaseHistory.push(purchase);
    localStorage.setItem('purchase_history', JSON.stringify(this.purchaseHistory));
  }
}

export const recommendationService = new RecommendationService();
