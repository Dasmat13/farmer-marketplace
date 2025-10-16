import React, { useState, useEffect } from 'react';
import { Clock, Users, ChefHat, Star, Heart, ShoppingCart, Leaf } from 'lucide-react';
import { Recipe, recipeService, RecipeRecommendationRequest } from '../services/recipeService';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

interface RecipeRecommendationsProps {
  cropIds?: string[];
  title?: string;
  maxResults?: number;
}

const RecipeRecommendations: React.FC<RecipeRecommendationsProps> = ({
  cropIds = [],
  title = "Recipe Recommendations",
  maxResults = 6
}) => {
  const { user } = useAuth();
  const { items } = useCart();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    difficulty: '',
    cuisine: '',
    dietaryTags: [] as string[],
    maxPrepTime: 0
  });

  // Get crop IDs from cart if none provided
  const getRelevantCropIds = (): string[] => {
    if (cropIds.length > 0) return cropIds;
    return items.map(item => item.cropId);
  };

  const loadRecipes = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const request: RecipeRecommendationRequest = {
        userId: user.id,
        cropIds: getRelevantCropIds(),
        ...(filters.difficulty && { difficulty: filters.difficulty as any }),
        ...(filters.dietaryTags.length > 0 && { dietaryPreferences: filters.dietaryTags }),
        ...(filters.maxPrepTime > 0 && { maxPrepTime: filters.maxPrepTime })
      };

      const recommendations = await recipeService.getRecommendations(request);
      setRecipes(recommendations.slice(0, maxResults));
    } catch (err) {
      setError('Failed to load recipe recommendations');
      console.error('Recipe recommendations error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [user, cropIds, items, filters, maxResults]);

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

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleDietaryTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(tag)
        ? prev.dietaryTags.filter(t => t !== tag)
        : [...prev.dietaryTags, tag]
    }));
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600">Please sign in to see personalized recipe recommendations.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <ChefHat className="h-6 w-6 text-farm-green-600" />
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-farm-green-500"
            >
              <option value="">Any difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Max Prep Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Time (minutes)
            </label>
            <select
              value={filters.maxPrepTime}
              onChange={(e) => handleFilterChange('maxPrepTime', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-farm-green-500"
            >
              <option value={0}>Any time</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Cuisine Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine
            </label>
            <select
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-farm-green-500"
            >
              <option value="">Any cuisine</option>
              <option value="Italian">Italian</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Asian">Asian</option>
              <option value="American">American</option>
              <option value="Mexican">Mexican</option>
            </select>
          </div>
        </div>

        {/* Dietary Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].map(tag => (
              <button
                key={tag}
                onClick={() => toggleDietaryTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filters.dietaryTags.includes(tag)
                    ? 'bg-farm-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green-600"></div>
          <span className="ml-2 text-gray-600">Finding perfect recipes for you...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadRecipes}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Recipe Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
              <p className="text-gray-600 mb-4">
                Try adding some crops to your cart or adjusting your filters
              </p>
            </div>
          ) : (
            recipes.map((recipe) => (
              <div key={recipe.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
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
                    <button className="bg-white/80 hover:bg-white p-2 rounded-full transition-colors">
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
                        +{recipe.dietaryTags.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex mr-1">
                        {renderStars(recipe.rating)}
                      </div>
                      <span className="text-sm text-gray-600">({recipe.reviewCount})</span>
                    </div>
                    
                    <button className="flex items-center gap-1 text-farm-green-600 hover:text-farm-green-700 text-sm font-medium">
                      <ShoppingCart className="h-4 w-4" />
                      Add ingredients
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* View All Button */}
      {!loading && recipes.length > 0 && (
        <div className="text-center mt-6">
          <button className="bg-farm-green-600 text-white px-6 py-2 rounded-md hover:bg-farm-green-700 transition-colors font-medium">
            View All Recipes
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeRecommendations;
