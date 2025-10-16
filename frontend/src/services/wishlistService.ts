export interface WishlistItem {
  id: string;
  type: 'crop' | 'farmer';
  itemId: string;
  itemName: string;
  itemImage?: string;
  price?: number;
  unit?: string;
  farmer?: {
    id: string;
    name: string;
  };
  location?: {
    city: string;
    state: string;
  };
  dateAdded: string;
  priceAlertEnabled: boolean;
  targetPrice?: number;
  lastKnownPrice?: number;
  availability?: 'available' | 'low_stock' | 'pre_order' | 'out_of_stock';
}

export interface FavoritesList {
  crops: WishlistItem[];
  farmers: WishlistItem[];
}

export interface PriceHistory {
  date: string;
  price: number;
}

class WishlistService {
  private getWishlistKey(userId: string): string {
    return `wishlist_${userId}`;
  }

  private getPriceHistoryKey(itemId: string): string {
    return `price_history_${itemId}`;
  }

  // Get user's complete wishlist
  getWishlist(userId: string): FavoritesList {
    const key = this.getWishlistKey(userId);
    const wishlist = localStorage.getItem(key);
    
    if (wishlist) {
      try {
        const parsed = JSON.parse(wishlist);
        return {
          crops: parsed.crops || [],
          farmers: parsed.farmers || []
        };
      } catch (error) {
        console.error('Error parsing wishlist:', error);
      }
    }
    
    return { crops: [], farmers: [] };
  }

  // Save wishlist to localStorage
  private saveWishlist(userId: string, wishlist: FavoritesList): void {
    const key = this.getWishlistKey(userId);
    localStorage.setItem(key, JSON.stringify(wishlist));
  }

  // Add crop to wishlist
  addCropToWishlist(userId: string, cropData: {
    id: string;
    name: string;
    price: number;
    unit: string;
    farmerName: string;
    farmerId: string;
    location: { city: string; state: string };
    image?: string;
    availability?: 'available' | 'low_stock' | 'pre_order' | 'out_of_stock';
  }): boolean {
    const wishlist = this.getWishlist(userId);
    
    // Check if already in wishlist
    const exists = wishlist.crops.find(item => item.itemId === cropData.id);
    if (exists) return false;

    const newItem: WishlistItem = {
      id: `crop_${cropData.id}_${Date.now()}`,
      type: 'crop',
      itemId: cropData.id,
      itemName: cropData.name,
      itemImage: cropData.image,
      price: cropData.price,
      unit: cropData.unit,
      farmer: {
        id: cropData.farmerId,
        name: cropData.farmerName
      },
      location: cropData.location,
      dateAdded: new Date().toISOString(),
      priceAlertEnabled: false,
      lastKnownPrice: cropData.price,
      availability: cropData.availability || 'available'
    };

    wishlist.crops.push(newItem);
    this.saveWishlist(userId, wishlist);
    
    // Track price history
    this.addPriceHistory(cropData.id, cropData.price);
    
    return true;
  }

  // Add farmer to favorites
  addFarmerToFavorites(userId: string, farmerData: {
    id: string;
    name: string;
    location: { city: string; state: string };
    image?: string;
  }): boolean {
    const wishlist = this.getWishlist(userId);
    
    // Check if already in favorites
    const exists = wishlist.farmers.find(item => item.itemId === farmerData.id);
    if (exists) return false;

    const newItem: WishlistItem = {
      id: `farmer_${farmerData.id}_${Date.now()}`,
      type: 'farmer',
      itemId: farmerData.id,
      itemName: farmerData.name,
      itemImage: farmerData.image,
      location: farmerData.location,
      dateAdded: new Date().toISOString(),
      priceAlertEnabled: false
    };

    wishlist.farmers.push(newItem);
    this.saveWishlist(userId, wishlist);
    
    return true;
  }

  // Remove item from wishlist
  removeFromWishlist(userId: string, itemId: string, type: 'crop' | 'farmer'): boolean {
    const wishlist = this.getWishlist(userId);
    
    if (type === 'crop') {
      const index = wishlist.crops.findIndex(item => item.itemId === itemId);
      if (index > -1) {
        wishlist.crops.splice(index, 1);
        this.saveWishlist(userId, wishlist);
        return true;
      }
    } else {
      const index = wishlist.farmers.findIndex(item => item.itemId === itemId);
      if (index > -1) {
        wishlist.farmers.splice(index, 1);
        this.saveWishlist(userId, wishlist);
        return true;
      }
    }
    
    return false;
  }

  // Check if item is in wishlist
  isInWishlist(userId: string, itemId: string, type: 'crop' | 'farmer'): boolean {
    const wishlist = this.getWishlist(userId);
    
    if (type === 'crop') {
      return wishlist.crops.some(item => item.itemId === itemId);
    } else {
      return wishlist.farmers.some(item => item.itemId === itemId);
    }
  }

  // Enable/disable price alerts for a crop
  togglePriceAlert(userId: string, cropId: string, enabled: boolean, targetPrice?: number): boolean {
    const wishlist = this.getWishlist(userId);
    const cropItem = wishlist.crops.find(item => item.itemId === cropId);
    
    if (cropItem) {
      cropItem.priceAlertEnabled = enabled;
      if (enabled && targetPrice) {
        cropItem.targetPrice = targetPrice;
      }
      this.saveWishlist(userId, wishlist);
      return true;
    }
    
    return false;
  }

  // Update crop price in wishlist
  updateCropPrice(userId: string, cropId: string, newPrice: number): void {
    const wishlist = this.getWishlist(userId);
    const cropItem = wishlist.crops.find(item => item.itemId === cropId);
    
    if (cropItem && cropItem.lastKnownPrice !== newPrice) {
      cropItem.lastKnownPrice = newPrice;
      this.saveWishlist(userId, wishlist);
      
      // Add to price history
      this.addPriceHistory(cropId, newPrice);
    }
  }

  // Update crop availability
  updateCropAvailability(userId: string, cropId: string, availability: 'available' | 'low_stock' | 'pre_order' | 'out_of_stock'): void {
    const wishlist = this.getWishlist(userId);
    const cropItem = wishlist.crops.find(item => item.itemId === cropId);
    
    if (cropItem) {
      cropItem.availability = availability;
      this.saveWishlist(userId, wishlist);
    }
  }

  // Get crops with price drops
  getCropsWithPriceDrops(userId: string): WishlistItem[] {
    const wishlist = this.getWishlist(userId);
    
    return wishlist.crops.filter(crop => {
      if (!crop.priceAlertEnabled || !crop.targetPrice || !crop.lastKnownPrice) {
        return false;
      }
      return crop.lastKnownPrice <= crop.targetPrice;
    });
  }

  // Add price to history
  private addPriceHistory(itemId: string, price: number): void {
    const key = this.getPriceHistoryKey(itemId);
    const history = this.getPriceHistory(itemId);
    
    // Don't add if price is the same as the last entry
    if (history.length > 0 && history[history.length - 1].price === price) {
      return;
    }
    
    history.push({
      date: new Date().toISOString(),
      price
    });
    
    // Keep only last 30 price points
    if (history.length > 30) {
      history.splice(0, history.length - 30);
    }
    
    localStorage.setItem(key, JSON.stringify(history));
  }

  // Get price history for an item
  getPriceHistory(itemId: string): PriceHistory[] {
    const key = this.getPriceHistoryKey(itemId);
    const history = localStorage.getItem(key);
    
    if (history) {
      try {
        return JSON.parse(history);
      } catch (error) {
        console.error('Error parsing price history:', error);
      }
    }
    
    return [];
  }

  // Get wishlist statistics
  getWishlistStats(userId: string): {
    totalItems: number;
    totalCrops: number;
    totalFarmers: number;
    priceAlertsEnabled: number;
    averagePrice: number;
    priceDropAlerts: number;
  } {
    const wishlist = this.getWishlist(userId);
    const priceDropAlerts = this.getCropsWithPriceDrops(userId);
    
    const cropsWithPrices = wishlist.crops.filter(crop => crop.price);
    const averagePrice = cropsWithPrices.length > 0 
      ? cropsWithPrices.reduce((sum, crop) => sum + (crop.price || 0), 0) / cropsWithPrices.length
      : 0;

    return {
      totalItems: wishlist.crops.length + wishlist.farmers.length,
      totalCrops: wishlist.crops.length,
      totalFarmers: wishlist.farmers.length,
      priceAlertsEnabled: wishlist.crops.filter(crop => crop.priceAlertEnabled).length,
      averagePrice,
      priceDropAlerts: priceDropAlerts.length
    };
  }

  // Get recently added items
  getRecentlyAdded(userId: string, limit: number = 5): WishlistItem[] {
    const wishlist = this.getWishlist(userId);
    const allItems = [...wishlist.crops, ...wishlist.farmers];
    
    return allItems
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, limit);
  }

  // Export wishlist (for backup)
  exportWishlist(userId: string): string {
    const wishlist = this.getWishlist(userId);
    return JSON.stringify(wishlist, null, 2);
  }

  // Import wishlist (from backup)
  importWishlist(userId: string, data: string): boolean {
    try {
      const wishlist = JSON.parse(data);
      if (wishlist.crops && wishlist.farmers) {
        this.saveWishlist(userId, wishlist);
        return true;
      }
    } catch (error) {
      console.error('Error importing wishlist:', error);
    }
    return false;
  }

  // Clear all wishlist data
  clearWishlist(userId: string): void {
    const key = this.getWishlistKey(userId);
    localStorage.removeItem(key);
  }
}

export const wishlistService = new WishlistService();
