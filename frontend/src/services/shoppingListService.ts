export interface ShoppingListItem {
  id: string;
  cropId: string;
  cropName: string;
  quantity: number;
  unit: string;
  currentPrice: number;
  targetPrice?: number;
  priceAlert: boolean;
  seasonalScore: number; // 0-100, higher is more in season
  farmerId: string;
  farmerName: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  addedAt: string;
  notes?: string;
  recipe?: {
    id: string;
    name: string;
  };
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: 'general' | 'meal_plan' | 'seasonal' | 'budget' | 'recipe';
  items: ShoppingListItem[];
  totalCost: number;
  estimatedSavings: number;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  tags?: string[];
  mealPlan?: {
    startDate: string;
    endDate: string;
    meals: {
      date: string;
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      recipeName: string;
      recipeId?: string;
    }[];
  };
}

export interface ShoppingListSuggestion {
  type: 'seasonal' | 'price_drop' | 'recipe_match' | 'complementary' | 'bulk_discount';
  cropId: string;
  cropName: string;
  reason: string;
  savingsAmount?: number;
  seasonalityNote?: string;
  priority: number; // 0-100
}

export interface CreateShoppingListRequest {
  name: string;
  description?: string;
  type: ShoppingList['type'];
  items?: Omit<ShoppingListItem, 'id' | 'addedAt'>[];
  tags?: string[];
}

export interface SeasonalInsight {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  inSeasonCrops: {
    cropId: string;
    cropName: string;
    peakMonths: string[];
    priceReduction: number; // percentage
    qualityScore: number; // 0-100
  }[];
  outOfSeasonCrops: {
    cropId: string;
    cropName: string;
    priceIncrease: number; // percentage
    qualityImpact: string;
  }[];
}

class ShoppingListService {
  private mockLists: ShoppingList[] = [
    {
      id: '1',
      userId: 'user_123',
      name: 'Weekly Groceries',
      description: 'My regular weekly shopping list',
      type: 'general',
      items: [
        {
          id: 'item1',
          cropId: 'tomatoes',
          cropName: 'Organic Tomatoes',
          quantity: 2,
          unit: 'lb',
          currentPrice: 3.50,
          targetPrice: 3.00,
          priceAlert: true,
          seasonalScore: 85,
          farmerId: 'farmer1',
          farmerName: 'Maria Garcia',
          location: 'Fresno, CA',
          priority: 'high',
          category: 'Vegetables',
          addedAt: '2024-03-15T10:00:00Z',
          notes: 'For salads and cooking'
        },
        {
          id: 'item2',
          cropId: 'lettuce',
          cropName: 'Fresh Lettuce',
          quantity: 1,
          unit: 'head',
          currentPrice: 2.25,
          seasonalScore: 92,
          farmerId: 'farmer1',
          farmerName: 'Maria Garcia',
          location: 'Fresno, CA',
          priority: 'medium',
          category: 'Leafy Greens',
          addedAt: '2024-03-15T10:05:00Z',
          priceAlert: false
        }
      ],
      totalCost: 9.25,
      estimatedSavings: 0.85,
      createdAt: '2024-03-01T08:00:00Z',
      updatedAt: '2024-03-15T10:05:00Z',
      isDefault: true,
      tags: ['weekly', 'vegetables']
    },
    {
      id: '2',
      userId: 'user_123',
      name: 'Mediterranean Meal Plan',
      description: 'Ingredients for Mediterranean recipes this week',
      type: 'meal_plan',
      items: [
        {
          id: 'item3',
          cropId: 'spinach',
          cropName: 'Baby Spinach',
          quantity: 2,
          unit: 'bag',
          currentPrice: 3.25,
          seasonalScore: 78,
          farmerId: 'farmer2',
          farmerName: 'Carlos Martinez',
          location: 'Salinas, CA',
          priority: 'high',
          category: 'Leafy Greens',
          addedAt: '2024-03-14T15:00:00Z',
          priceAlert: false,
          recipe: {
            id: '1',
            name: 'Mediterranean Spinach Salad'
          }
        }
      ],
      totalCost: 6.50,
      estimatedSavings: 1.20,
      createdAt: '2024-03-14T14:00:00Z',
      updatedAt: '2024-03-14T15:00:00Z',
      isDefault: false,
      tags: ['meal-plan', 'mediterranean', 'healthy'],
      mealPlan: {
        startDate: '2024-03-18',
        endDate: '2024-03-24',
        meals: [
          {
            date: '2024-03-18',
            mealType: 'lunch',
            recipeName: 'Mediterranean Spinach Salad',
            recipeId: '1'
          },
          {
            date: '2024-03-19',
            mealType: 'dinner',
            recipeName: 'Greek Style Vegetables',
            recipeId: '2'
          }
        ]
      }
    }
  ];

  private seasonalData: SeasonalInsight = {
    season: 'spring',
    inSeasonCrops: [
      {
        cropId: 'lettuce',
        cropName: 'Fresh Lettuce',
        peakMonths: ['March', 'April', 'May'],
        priceReduction: 15,
        qualityScore: 95
      },
      {
        cropId: 'spinach',
        cropName: 'Baby Spinach',
        peakMonths: ['March', 'April', 'May', 'June'],
        priceReduction: 12,
        qualityScore: 92
      },
      {
        cropId: 'carrots',
        cropName: 'Organic Carrots',
        peakMonths: ['March', 'April'],
        priceReduction: 8,
        qualityScore: 88
      }
    ],
    outOfSeasonCrops: [
      {
        cropId: 'tomatoes',
        cropName: 'Organic Tomatoes',
        priceIncrease: 20,
        qualityImpact: 'Lower sweetness, imported varieties'
      }
    ]
  };

  // Get user's shopping lists
  async getUserShoppingLists(userId: string): Promise<ShoppingList[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userLists = this.mockLists.filter(list => list.userId === userId);
        resolve(userLists);
      }, 200);
    });
  }

  // Get a specific shopping list
  async getShoppingList(listId: string): Promise<ShoppingList | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = this.mockLists.find(l => l.id === listId) || null;
        resolve(list);
      }, 100);
    });
  }

  // Create a new shopping list
  async createShoppingList(userId: string, request: CreateShoppingListRequest): Promise<ShoppingList> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newList: ShoppingList = {
          id: `list-${Date.now()}`,
          userId,
          name: request.name,
          description: request.description,
          type: request.type,
          items: request.items ? request.items.map((item, index) => ({
            ...item,
            id: `item-${Date.now()}-${index}`,
            addedAt: new Date().toISOString()
          })) : [],
          totalCost: 0,
          estimatedSavings: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: false,
          tags: request.tags || []
        };

        // Calculate total cost
        newList.totalCost = newList.items.reduce((sum, item) => 
          sum + (item.currentPrice * item.quantity), 0
        );

        this.mockLists.push(newList);
        resolve(newList);
      }, 300);
    });
  }

  // Add item to shopping list
  async addItemToList(listId: string, item: Omit<ShoppingListItem, 'id' | 'addedAt'>): Promise<ShoppingListItem> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const listIndex = this.mockLists.findIndex(l => l.id === listId);
        
        if (listIndex === -1) {
          reject(new Error('Shopping list not found'));
          return;
        }

        const newItem: ShoppingListItem = {
          ...item,
          id: `item-${Date.now()}`,
          addedAt: new Date().toISOString()
        };

        this.mockLists[listIndex].items.push(newItem);
        this.mockLists[listIndex].updatedAt = new Date().toISOString();
        
        // Recalculate total cost
        this.mockLists[listIndex].totalCost = this.mockLists[listIndex].items.reduce(
          (sum, item) => sum + (item.currentPrice * item.quantity), 0
        );

        resolve(newItem);
      }, 200);
    });
  }

  // Remove item from shopping list
  async removeItemFromList(listId: string, itemId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const listIndex = this.mockLists.findIndex(l => l.id === listId);
        
        if (listIndex === -1) {
          resolve(false);
          return;
        }

        const itemIndex = this.mockLists[listIndex].items.findIndex(i => i.id === itemId);
        
        if (itemIndex === -1) {
          resolve(false);
          return;
        }

        this.mockLists[listIndex].items.splice(itemIndex, 1);
        this.mockLists[listIndex].updatedAt = new Date().toISOString();
        
        // Recalculate total cost
        this.mockLists[listIndex].totalCost = this.mockLists[listIndex].items.reduce(
          (sum, item) => sum + (item.currentPrice * item.quantity), 0
        );

        resolve(true);
      }, 200);
    });
  }

  // Update item quantity
  async updateItemQuantity(listId: string, itemId: string, quantity: number): Promise<ShoppingListItem | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = this.mockLists.find(l => l.id === listId);
        
        if (!list) {
          resolve(null);
          return;
        }

        const item = list.items.find(i => i.id === itemId);
        
        if (!item) {
          resolve(null);
          return;
        }

        item.quantity = quantity;
        list.updatedAt = new Date().toISOString();
        
        // Recalculate total cost
        list.totalCost = list.items.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);

        resolve(item);
      }, 200);
    });
  }

  // Get AI-powered suggestions for shopping list optimization
  async getShoppingListSuggestions(listId: string): Promise<ShoppingListSuggestion[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const suggestions: ShoppingListSuggestion[] = [
          {
            type: 'seasonal',
            cropId: 'lettuce',
            cropName: 'Fresh Lettuce',
            reason: 'Lettuce is currently in peak season with 15% lower prices and best quality',
            savingsAmount: 0.35,
            seasonalityNote: 'Peak season: March-May',
            priority: 90
          },
          {
            type: 'price_drop',
            cropId: 'carrots',
            cropName: 'Organic Carrots',
            reason: 'Price dropped 20% this week due to local harvest',
            savingsAmount: 0.55,
            priority: 85
          },
          {
            type: 'complementary',
            cropId: 'cucumber',
            cropName: 'Fresh Cucumbers',
            reason: 'Perfect complement to your salad ingredients, and currently 10% off',
            savingsAmount: 0.25,
            priority: 70
          },
          {
            type: 'bulk_discount',
            cropId: 'tomatoes',
            cropName: 'Organic Tomatoes',
            reason: 'Buy 3 lbs or more and save 15% per pound',
            savingsAmount: 1.58,
            priority: 75
          },
          {
            type: 'recipe_match',
            cropId: 'basil',
            cropName: 'Fresh Basil',
            reason: 'Great for Mediterranean recipes in your meal plan',
            priority: 65
          }
        ];

        resolve(suggestions.sort((a, b) => b.priority - a.priority));
      }, 400);
    });
  }

  // Get seasonal insights
  async getSeasonalInsights(): Promise<SeasonalInsight> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.seasonalData);
      }, 200);
    });
  }

  // Generate smart shopping list based on preferences
  async generateSmartList(userId: string, preferences: {
    budget?: number;
    dietaryRestrictions?: string[];
    cuisinePreferences?: string[];
    mealCount?: number;
    duration?: number; // days
  }): Promise<ShoppingList> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const smartItems: ShoppingListItem[] = [
          {
            id: 'smart1',
            cropId: 'lettuce',
            cropName: 'Fresh Lettuce',
            quantity: 2,
            unit: 'head',
            currentPrice: 2.25,
            seasonalScore: 92,
            farmerId: 'farmer1',
            farmerName: 'Maria Garcia',
            location: 'Fresno, CA',
            priority: 'high',
            category: 'Leafy Greens',
            addedAt: new Date().toISOString(),
            priceAlert: false,
            notes: 'In season - best quality and price'
          },
          {
            id: 'smart2',
            cropId: 'carrots',
            cropName: 'Organic Carrots',
            quantity: 1,
            unit: 'bunch',
            currentPrice: 2.20, // 20% discount applied
            targetPrice: 2.75,
            seasonalScore: 88,
            farmerId: 'farmer2',
            farmerName: 'Mike Thompson',
            location: 'Boise, ID',
            priority: 'medium',
            category: 'Root Vegetables',
            addedAt: new Date().toISOString(),
            priceAlert: true,
            notes: 'Price drop alert - 20% off this week'
          },
          {
            id: 'smart3',
            cropId: 'spinach',
            cropName: 'Baby Spinach',
            quantity: 1,
            unit: 'bag',
            currentPrice: 3.25,
            seasonalScore: 85,
            farmerId: 'farmer3',
            farmerName: 'Carlos Martinez',
            location: 'Salinas, CA',
            priority: 'high',
            category: 'Leafy Greens',
            addedAt: new Date().toISOString(),
            priceAlert: false,
            notes: 'High in nutrition, perfect for smoothies'
          }
        ];

        const smartList: ShoppingList = {
          id: `smart-${Date.now()}`,
          userId,
          name: 'AI-Curated Smart List',
          description: 'Optimized for season, price, and nutrition',
          type: 'general',
          items: smartItems,
          totalCost: smartItems.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0),
          estimatedSavings: 2.35,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: false,
          tags: ['ai-generated', 'seasonal', 'optimized']
        };

        resolve(smartList);
      }, 500);
    });
  }

  // Track price changes and send alerts
  async checkPriceAlerts(userId: string): Promise<{
    alerts: {
      itemId: string;
      cropName: string;
      oldPrice: number;
      newPrice: number;
      savingsAmount: number;
      listName: string;
    }[];
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          alerts: [
            {
              itemId: 'item1',
              cropName: 'Organic Tomatoes',
              oldPrice: 3.50,
              newPrice: 3.00,
              savingsAmount: 1.00, // 2 lbs * $0.50 savings
              listName: 'Weekly Groceries'
            }
          ]
        });
      }, 300);
    });
  }

  // Delete shopping list
  async deleteShoppingList(listId: string, userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const listIndex = this.mockLists.findIndex(
          l => l.id === listId && l.userId === userId
        );
        
        if (listIndex !== -1) {
          this.mockLists.splice(listIndex, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 200);
    });
  }
}

export const shoppingListService = new ShoppingListService();
