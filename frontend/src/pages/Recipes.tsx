import React, { useState, useEffect } from 'react';
import { Search, ChefHat, Clock, Users, Star, Heart, ShoppingCart, Leaf, Book } from 'lucide-react';
import { Recipe, recipeService } from '../services/recipeService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import RecipeRecommendations from '../components/RecipeRecommendations';

const Recipes: React.FC = () => {
  const { user } = useAuth();
  const { items } = useCart();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showModal, setShowModal] = useState(false);

  const cuisines = ['Italian', 'Mediterranean', 'Asian', 'American', 'Mexican'];

  const searchRecipes = async () => {
    setLoading(true);
    try {
      let results: Recipe[] = [];
      
      if (searchQuery.trim()) {
        results = await recipeService.searchRecipes(searchQuery);
      } else if (selectedCuisine) {
        results = await recipeService.getRecipesByCategory(selectedCuisine);
      } else {
        // Get general recommendations if no search/filter
        if (user) {
          const cropIds = items.map(item => item.cropId);
          results = await recipeService.getRecommendations({
            userId: user.id,
            cropIds: cropIds.length > 0 ? cropIds : undefined
          });
        }
      }
      
      setRecipes(results);
    } catch (error) {
      console.error('Failed to search recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchRecipes();
  }, [searchQuery, selectedCuisine, user, items]);

  const handleRecipeClick = async (recipeId: string) => {
    const recipe = await recipeService.getRecipeById(recipeId);
    if (recipe) {
      setSelectedRecipe(recipe);
      setShowModal(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-yellow-200 text-yellow-400" />);
    }

    return stars;
  };

  const getShoppingList = (recipe: Recipe) => {
    const cropIds = items.map(item => item.cropId);
    return recipeService.getShoppingList(recipe, cropIds);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <ChefHat className="h-8 w-8 text-farm-green-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Recipe Collection</h1>
        </div>
        <p className="text-lg text-gray-600">
          Discover delicious recipes using fresh ingredients from our marketplace
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes, ingredients, or cuisines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
            />
          </div>

          {/* Cuisine Filter */}
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
          >
            <option value="">All Cuisines</option>
            {cuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <Book className="h-4 w-4" />
          <span>
            {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* AI Recommendations */}
      {user && items.length > 0 && (
        <div className="mb-8">
          <RecipeRecommendations 
            title="Based on Your Cart" 
            maxResults={3}
          />
        </div>
      )}

      {/* Recipe Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green-600"></div>
            <span className="ml-2 text-gray-600">Loading recipes...</span>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-4">Try searching for different ingredients or cuisines</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div 
                key={recipe.id} 
                className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleRecipeClick(recipe.id)}
              >
                {/* Recipe Image */}
                <div className="relative">
                  <img 
                    src={recipe.image} 
                    alt={recipe.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    {recipe.matchScore > 0 && (
                      <span className="bg-farm-green-600 text-white px-2 py-1 text-xs rounded-full font-medium">
                        {recipe.matchScore}% match
                      </span>
                    )}
                    <button 
                      className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to favorites logic
                      }}
                    >
                      <Heart className="h-4 w-4 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Recipe Details */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{recipe.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                  
                  {/* Recipe Meta */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {recipe.totalTime}m
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {recipe.servings}
                    </span>
                    <span className="text-farm-green-600 font-medium">
                      {recipe.cuisine}
                    </span>
                  </div>

                  {/* Dietary Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {recipe.dietaryTags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex items-center">
                        <Leaf className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {recipe.dietaryTags.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{recipe.dietaryTags.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Rating and Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex mr-1">
                        {renderStars(recipe.rating)}
                      </div>
                      <span className="text-sm text-gray-600">({recipe.reviewCount})</span>
                    </div>
                    
                    <button 
                      className="text-farm-green-600 hover:text-farm-green-700 text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRecipeClick(recipe.id);
                      }}
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {showModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">{selectedRecipe.name}</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Recipe Header */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                
                <div>
                  <p className="text-gray-600 mb-4">{selectedRecipe.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                      <div className="text-lg font-semibold">{selectedRecipe.totalTime}m</div>
                      <div className="text-sm text-gray-500">Total Time</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Users className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                      <div className="text-lg font-semibold">{selectedRecipe.servings}</div>
                      <div className="text-sm text-gray-500">Servings</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedRecipe.difficulty)}`}>
                      {selectedRecipe.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {selectedRecipe.cuisine}
                    </span>
                    {selectedRecipe.dietaryTags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {renderStars(selectedRecipe.rating)}
                      </div>
                      <span className="text-gray-600">({selectedRecipe.reviewCount} reviews)</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded">
                        <Heart className="h-4 w-4" />
                        Save
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 text-farm-green-600 hover:bg-farm-green-50 rounded">
                        <ShoppingCart className="h-4 w-4" />
                        Add ingredients
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients and Instructions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ingredients */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Ingredients</h3>
                  <div className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient) => {
                      const cropIds = items.map(item => item.cropId);
                      const isAvailable = ingredient.cropId && cropIds.includes(ingredient.cropId);
                      
                      return (
                        <div key={ingredient.id} className={`flex justify-between items-center p-2 rounded ${isAvailable ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                          <span className={`${ingredient.isOptional ? 'text-gray-500' : 'text-gray-900'}`}>
                            {ingredient.amount} {ingredient.unit} {ingredient.name}
                            {ingredient.isOptional && ' (optional)'}
                          </span>
                          {isAvailable && (
                            <span className="text-xs text-green-600 font-medium">In your cart</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Shopping List */}
                  {(() => {
                    const { availableIngredients, needToBuy } = getShoppingList(selectedRecipe);
                    return needToBuy.length > 0 ? (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-medium text-blue-900 mb-2">Still needed:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          {needToBuy.slice(0, 3).map(ingredient => (
                            <li key={ingredient.id}>
                              • {ingredient.amount} {ingredient.unit} {ingredient.name}
                            </li>
                          ))}
                          {needToBuy.length > 3 && (
                            <li>• +{needToBuy.length - 3} more ingredients</li>
                          )}
                        </ul>
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Instructions</h3>
                  <div className="space-y-3">
                    {selectedRecipe.instructions.map((instruction) => (
                      <div key={instruction.step} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-farm-green-600 text-white text-sm font-medium rounded-full flex items-center justify-center">
                          {instruction.step}
                        </span>
                        <p className="text-gray-700 pt-0.5">{instruction.instruction}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nutrition Facts and Tips */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nutrition */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Nutrition Facts</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-semibold text-farm-green-600">{selectedRecipe.nutritionFacts.calories}</div>
                      <div className="text-sm text-gray-500">Calories</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-semibold text-farm-green-600">{selectedRecipe.nutritionFacts.protein}g</div>
                      <div className="text-sm text-gray-500">Protein</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-semibold text-farm-green-600">{selectedRecipe.nutritionFacts.carbs}g</div>
                      <div className="text-sm text-gray-500">Carbs</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="text-lg font-semibold text-farm-green-600">{selectedRecipe.nutritionFacts.fiber}g</div>
                      <div className="text-sm text-gray-500">Fiber</div>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Chef's Tips</h3>
                  <div className="space-y-2">
                    {selectedRecipe.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-farm-green-600 mt-1">•</span>
                        <p className="text-gray-700 text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
