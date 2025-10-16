import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  TrendingDown, 
  Calendar,
  Brain,
  Bell,
  Edit,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Leaf
} from 'lucide-react';
import { 
  ShoppingList, 
  ShoppingListSuggestion, 
  SeasonalInsight, 
  shoppingListService,
  CreateShoppingListRequest 
} from '../services/shoppingListService';
import { useAuth } from '../contexts/AuthContext';

const ShoppingLists: React.FC = () => {
  const { user } = useAuth();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [suggestions, setSuggestions] = useState<ShoppingListSuggestion[]>([]);
  const [seasonalInsights, setSeasonalInsights] = useState<SeasonalInsight | null>(null);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    type: 'general' as ShoppingList['type']
  });
  const [priceAlerts, setPriceAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userLists, seasonalData, alerts] = await Promise.all([
        shoppingListService.getUserShoppingLists(user.id),
        shoppingListService.getSeasonalInsights(),
        shoppingListService.checkPriceAlerts(user.id)
      ]);

      setLists(userLists);
      setSeasonalInsights(seasonalData);
      setPriceAlerts(alerts.alerts);

      // Load suggestions for default list
      if (userLists.length > 0) {
        const defaultList = userLists.find(l => l.isDefault) || userLists[0];
        setSelectedList(defaultList);
        const listSuggestions = await shoppingListService.getShoppingListSuggestions(defaultList.id);
        setSuggestions(listSuggestions);
      }
    } catch (error) {
      console.error('Failed to load shopping lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !createFormData.name.trim()) {
      return;
    }

    try {
      const request: CreateShoppingListRequest = {
        name: createFormData.name.trim(),
        description: createFormData.description.trim() || undefined,
        type: createFormData.type
      };

      const newList = await shoppingListService.createShoppingList(user.id, request);
      setLists([newList, ...lists]);
      
      // Reset form
      setCreateFormData({ name: '', description: '', type: 'general' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create shopping list:', error);
    }
  };

  const handleGenerateSmartList = async () => {
    if (!user) return;

    try {
      const smartList = await shoppingListService.generateSmartList(user.id, {
        budget: 50,
        mealCount: 7,
        duration: 7
      });
      
      setLists([smartList, ...lists]);
      setSelectedList(smartList);
      
      // Load suggestions for the new smart list
      const listSuggestions = await shoppingListService.getShoppingListSuggestions(smartList.id);
      setSuggestions(listSuggestions);
    } catch (error) {
      console.error('Failed to generate smart list:', error);
    }
  };

  const handleDeleteList = async (listId: string) => {
    if (!user) return;

    if (window.confirm('Are you sure you want to delete this shopping list?')) {
      try {
        await shoppingListService.deleteShoppingList(listId, user.id);
        setLists(lists.filter(l => l.id !== listId));
        
        if (selectedList?.id === listId) {
          setSelectedList(null);
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Failed to delete shopping list:', error);
      }
    }
  };

  const handleSelectList = async (list: ShoppingList) => {
    setSelectedList(list);
    
    try {
      const listSuggestions = await shoppingListService.getShoppingListSuggestions(list.id);
      setSuggestions(listSuggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const getSuggestionIcon = (type: ShoppingListSuggestion['type']) => {
    switch (type) {
      case 'seasonal': return <Leaf className="h-4 w-4" />;
      case 'price_drop': return <TrendingDown className="h-4 w-4" />;
      case 'recipe_match': return <Star className="h-4 w-4" />;
      case 'complementary': return <Plus className="h-4 w-4" />;
      case 'bulk_discount': return <DollarSign className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (type: ShoppingListSuggestion['type']) => {
    switch (type) {
      case 'seasonal': return 'bg-green-50 border-green-200 text-green-800';
      case 'price_drop': return 'bg-red-50 border-red-200 text-red-800';
      case 'recipe_match': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'complementary': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'bulk_discount': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Shopping Lists</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your shopping lists and AI recommendations.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green-600"></div>
          <span className="ml-2 text-gray-600">Loading your shopping lists...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-farm-green-600" />
              Smart Shopping Lists
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              AI-powered shopping with seasonal insights and price tracking
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateSmartList}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              <Brain className="h-4 w-4" />
              Generate Smart List
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 bg-farm-green-600 text-white px-4 py-2 rounded-md hover:bg-farm-green-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Create List
            </button>
          </div>
        </div>

        {/* Price Alerts */}
        {priceAlerts.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-900">Price Alerts</h3>
            </div>
            {priceAlerts.map((alert, index) => (
              <div key={index} className="text-sm text-green-800">
                {alert.cropName} dropped to ${alert.newPrice} (was ${alert.oldPrice}) - 
                Save ${alert.savingsAmount.toFixed(2)} on "{alert.listName}"
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shopping Lists Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Lists</h2>
            
            {lists.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No shopping lists yet</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-farm-green-600 text-white px-4 py-2 rounded-md hover:bg-farm-green-700 transition-colors"
                >
                  Create Your First List
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedList?.id === list.id
                        ? 'border-farm-green-500 bg-farm-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectList(list)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{list.name}</h3>
                      <div className="flex items-center gap-2">
                        {list.isDefault && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(list.id);
                          }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{list.items.length} items</span>
                      <span>${list.totalCost.toFixed(2)}</span>
                    </div>
                    
                    {list.estimatedSavings > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        Est. savings: ${list.estimatedSavings.toFixed(2)}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {list.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seasonal Insights */}
          {seasonalInsights && (
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-farm-green-600" />
                {seasonalInsights.season.charAt(0).toUpperCase() + seasonalInsights.season.slice(1)} Insights
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">In Season (Save Money!)</h4>
                  {seasonalInsights.inSeasonCrops.slice(0, 3).map((crop) => (
                    <div key={crop.cropId} className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">{crop.cropName}</span>
                      <span className="text-green-600 ml-2">-{crop.priceReduction}%</span>
                    </div>
                  ))}
                </div>
                
                {seasonalInsights.outOfSeasonCrops.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-800 mb-2">Out of Season</h4>
                    {seasonalInsights.outOfSeasonCrops.slice(0, 2).map((crop) => (
                      <div key={crop.cropId} className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">{crop.cropName}</span>
                        <span className="text-red-600 ml-2">+{crop.priceIncrease}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {selectedList ? (
            <div className="space-y-6">
              {/* List Header */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedList.name}</h2>
                    {selectedList.description && (
                      <p className="text-gray-600">{selectedList.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${selectedList.totalCost.toFixed(2)}
                    </div>
                    {selectedList.estimatedSavings > 0 && (
                      <div className="text-sm text-green-600">
                        Save ${selectedList.estimatedSavings.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* List Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{selectedList.items.length}</div>
                    <div className="text-sm text-gray-600">Items</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedList.items.filter(i => i.seasonalScore > 80).length}
                    </div>
                    <div className="text-sm text-gray-600">In Season</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedList.items.filter(i => i.priceAlert).length}
                    </div>
                    <div className="text-sm text-gray-600">Price Alerts</div>
                  </div>
                </div>
              </div>

              {/* Shopping List Items */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shopping Items</h3>
                
                {selectedList.items.length === 0 ? (
                  <div className="text-center py-6">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No items in this list yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedList.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.cropName}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>by {item.farmerName}</span>
                              <span>•</span>
                              <span>{item.location}</span>
                              {item.seasonalScore > 80 && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600 font-medium">In Season</span>
                                </>
                              )}
                            </div>
                            {item.notes && (
                              <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {item.quantity} {item.unit} × ${item.currentPrice.toFixed(2)}
                          </div>
                          <div className="text-lg font-bold text-farm-green-600">
                            ${(item.quantity * item.currentPrice).toFixed(2)}
                          </div>
                          {item.priceAlert && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Bell className="h-3 w-3" />
                              Price Alert
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Suggestions */}
              {suggestions.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Smart Suggestions
                  </h3>
                  
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${getSuggestionColor(suggestion.type)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getSuggestionIcon(suggestion.type)}
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">{suggestion.cropName}</h4>
                              <p className="text-sm">{suggestion.reason}</p>
                              {suggestion.seasonalityNote && (
                                <p className="text-xs mt-1">{suggestion.seasonalityNote}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {suggestion.savingsAmount && (
                              <div className="font-medium">
                                Save ${suggestion.savingsAmount.toFixed(2)}
                              </div>
                            )}
                            <button className="text-sm bg-white bg-opacity-50 hover:bg-opacity-75 px-3 py-1 rounded mt-2 transition-colors">
                              Add to List
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Shopping List</h3>
              <p className="text-gray-600 mb-6">Choose a list from the sidebar to view items and get AI suggestions</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-farm-green-600 text-white px-6 py-2 rounded-md hover:bg-farm-green-700 transition-colors font-medium"
              >
                Create New List
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create List Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Shopping List</h3>
            
            <form onSubmit={handleCreateList} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Name *
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  placeholder="e.g., Weekly Groceries"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  placeholder="What is this list for?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  List Type
                </label>
                <select
                  value={createFormData.type}
                  onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value as ShoppingList['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                >
                  <option value="general">General</option>
                  <option value="meal_plan">Meal Plan</option>
                  <option value="seasonal">Seasonal</option>
                  <option value="budget">Budget</option>
                  <option value="recipe">Recipe</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-farm-green-600 text-white py-2 px-4 rounded-md hover:bg-farm-green-700 transition-colors font-medium"
                >
                  Create List
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingLists;
