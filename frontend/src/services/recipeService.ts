export interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  dietaryTags: string[]; // ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', etc.]
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tips: string[];
  rating: number;
  reviewCount: number;
  matchingCrops: string[]; // crop IDs that this recipe uses
  matchScore: number; // 0-100, how well it matches user's available crops
}

export interface RecipeIngredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  cropId?: string; // if this ingredient matches a crop in our marketplace
  isOptional: boolean;
  notes?: string;
}

export interface RecipeInstruction {
  step: number;
  instruction: string;
  image?: string;
  duration?: number; // in minutes for this step
}

export interface RecipeRecommendationRequest {
  userId: string;
  cropIds?: string[]; // crops in cart or to base recommendations on
  dietaryPreferences?: string[];
  cuisinePreferences?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  maxPrepTime?: number;
  servings?: number;
}

class RecipeService {
  private recipes: Recipe[] = [
    {
      id: '1',
      name: 'Farm Fresh Caprese Salad',
      description: 'A classic Italian salad featuring fresh tomatoes, basil, and mozzarella with a balsamic glaze.',
      image: '/api/placeholder/400/300',
      prepTime: 15,
      cookTime: 0,
      totalTime: 15,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Italian',
      dietaryTags: ['vegetarian', 'gluten-free'],
      ingredients: [
        { id: '1', name: 'Fresh tomatoes', amount: 3, unit: 'large', cropId: 'tomatoes', isOptional: false },
        { id: '2', name: 'Fresh basil leaves', amount: 1, unit: 'cup', cropId: 'basil', isOptional: false },
        { id: '3', name: 'Fresh mozzarella', amount: 8, unit: 'oz', isOptional: false },
        { id: '4', name: 'Extra virgin olive oil', amount: 3, unit: 'tbsp', isOptional: false },
        { id: '5', name: 'Balsamic vinegar', amount: 2, unit: 'tbsp', isOptional: false },
        { id: '6', name: 'Salt', amount: 1, unit: 'tsp', isOptional: false },
        { id: '7', name: 'Black pepper', amount: 0.5, unit: 'tsp', isOptional: false }
      ],
      instructions: [
        { step: 1, instruction: 'Wash and slice tomatoes into 1/4-inch thick rounds.' },
        { step: 2, instruction: 'Slice mozzarella into similar thickness as tomatoes.' },
        { step: 3, instruction: 'Arrange tomato and mozzarella slices alternately on a platter.' },
        { step: 4, instruction: 'Tuck fresh basil leaves between the slices.' },
        { step: 5, instruction: 'Drizzle with olive oil and balsamic vinegar.' },
        { step: 6, instruction: 'Season with salt and pepper to taste. Serve immediately.' }
      ],
      nutritionFacts: { calories: 180, protein: 12, carbs: 8, fat: 14, fiber: 2 },
      tips: [
        'Use room temperature ingredients for best flavor',
        'Choose ripe but firm tomatoes',
        'For extra flavor, reduce balsamic vinegar in a pan until syrupy'
      ],
      rating: 4.7,
      reviewCount: 234,
      matchingCrops: ['tomatoes', 'basil'],
      matchScore: 85
    },
    {
      id: '2',
      name: 'Roasted Vegetable Medley',
      description: 'Colorful seasonal vegetables roasted to perfection with herbs and olive oil.',
      image: '/api/placeholder/400/300',
      prepTime: 20,
      cookTime: 35,
      totalTime: 55,
      servings: 6,
      difficulty: 'easy',
      cuisine: 'Mediterranean',
      dietaryTags: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
      ingredients: [
        { id: '1', name: 'Carrots', amount: 3, unit: 'large', cropId: 'carrots', isOptional: false },
        { id: '2', name: 'Bell peppers', amount: 2, unit: 'large', cropId: 'bell-peppers', isOptional: false },
        { id: '3', name: 'Zucchini', amount: 2, unit: 'medium', cropId: 'zucchini', isOptional: false },
        { id: '4', name: 'Red onion', amount: 1, unit: 'large', cropId: 'onions', isOptional: false },
        { id: '5', name: 'Olive oil', amount: 0.25, unit: 'cup', isOptional: false },
        { id: '6', name: 'Fresh thyme', amount: 2, unit: 'tbsp', cropId: 'thyme', isOptional: true },
        { id: '7', name: 'Fresh rosemary', amount: 1, unit: 'tbsp', cropId: 'rosemary', isOptional: true },
        { id: '8', name: 'Salt', amount: 1, unit: 'tsp', isOptional: false },
        { id: '9', name: 'Black pepper', amount: 0.5, unit: 'tsp', isOptional: false }
      ],
      instructions: [
        { step: 1, instruction: 'Preheat oven to 425°F (220°C).' },
        { step: 2, instruction: 'Wash and chop all vegetables into similar-sized pieces (about 1-inch).' },
        { step: 3, instruction: 'Place vegetables on a large baking sheet.' },
        { step: 4, instruction: 'Drizzle with olive oil and sprinkle with herbs, salt, and pepper.' },
        { step: 5, instruction: 'Toss everything together until evenly coated.' },
        { step: 6, instruction: 'Roast for 25-35 minutes, stirring once halfway through, until vegetables are tender and lightly caramelized.' },
        { step: 7, instruction: 'Serve hot as a side dish or over grains for a complete meal.' }
      ],
      nutritionFacts: { calories: 120, protein: 3, carbs: 15, fat: 7, fiber: 4 },
      tips: [
        'Cut vegetables uniformly for even cooking',
        'Don\'t overcrowd the pan - use two baking sheets if needed',
        'Add garlic in the last 10 minutes to prevent burning'
      ],
      rating: 4.5,
      reviewCount: 189,
      matchingCrops: ['carrots', 'bell-peppers', 'zucchini', 'onions', 'thyme', 'rosemary'],
      matchScore: 92
    },
    {
      id: '3',
      name: 'Fresh Corn and Basil Pasta',
      description: 'Light summer pasta with sweet corn kernels, fresh basil, and a hint of lemon.',
      image: '/api/placeholder/400/300',
      prepTime: 15,
      cookTime: 20,
      totalTime: 35,
      servings: 4,
      difficulty: 'medium',
      cuisine: 'Italian',
      dietaryTags: ['vegetarian'],
      ingredients: [
        { id: '1', name: 'Fresh corn', amount: 4, unit: 'ears', cropId: 'corn', isOptional: false },
        { id: '2', name: 'Fresh basil', amount: 1, unit: 'cup', cropId: 'basil', isOptional: false },
        { id: '3', name: 'Pasta (penne or rigatoni)', amount: 12, unit: 'oz', isOptional: false },
        { id: '4', name: 'Heavy cream', amount: 0.5, unit: 'cup', isOptional: false },
        { id: '5', name: 'Parmesan cheese', amount: 0.75, unit: 'cup', isOptional: false },
        { id: '6', name: 'Butter', amount: 3, unit: 'tbsp', isOptional: false },
        { id: '7', name: 'Garlic', amount: 3, unit: 'cloves', isOptional: false },
        { id: '8', name: 'Lemon zest', amount: 1, unit: 'lemon', isOptional: false },
        { id: '9', name: 'Salt', amount: 1, unit: 'tsp', isOptional: false },
        { id: '10', name: 'Black pepper', amount: 0.5, unit: 'tsp', isOptional: false }
      ],
      instructions: [
        { step: 1, instruction: 'Bring a large pot of salted water to boil for pasta.' },
        { step: 2, instruction: 'Cut corn kernels off the cob using a sharp knife.' },
        { step: 3, instruction: 'Cook pasta according to package directions until al dente.' },
        { step: 4, instruction: 'While pasta cooks, melt butter in a large skillet over medium heat.' },
        { step: 5, instruction: 'Add minced garlic and cook for 1 minute until fragrant.' },
        { step: 6, instruction: 'Add corn kernels and cook for 3-4 minutes until tender.' },
        { step: 7, instruction: 'Pour in cream and simmer for 2 minutes.' },
        { step: 8, instruction: 'Drain pasta, reserving 1/2 cup pasta water.' },
        { step: 9, instruction: 'Add pasta to the skillet with corn mixture.' },
        { step: 10, instruction: 'Toss with Parmesan, torn basil, lemon zest, salt, and pepper.' },
        { step: 11, instruction: 'Add pasta water as needed to achieve creamy consistency. Serve immediately.' }
      ],
      nutritionFacts: { calories: 420, protein: 16, carbs: 58, fat: 15, fiber: 3 },
      tips: [
        'Save some pasta water - the starch helps bind the sauce',
        'Add basil at the end to keep it fresh and vibrant',
        'Try grilling the corn first for smoky flavor'
      ],
      rating: 4.8,
      reviewCount: 312,
      matchingCrops: ['corn', 'basil'],
      matchScore: 78
    },
    {
      id: '4',
      name: 'Garden Harvest Stir Fry',
      description: 'Quick and healthy stir-fry using whatever vegetables are fresh from the garden.',
      image: '/api/placeholder/400/300',
      prepTime: 15,
      cookTime: 10,
      totalTime: 25,
      servings: 4,
      difficulty: 'easy',
      cuisine: 'Asian',
      dietaryTags: ['vegetarian', 'vegan', 'gluten-free'],
      ingredients: [
        { id: '1', name: 'Broccoli', amount: 2, unit: 'cups', cropId: 'broccoli', isOptional: false },
        { id: '2', name: 'Snow peas', amount: 1, unit: 'cup', cropId: 'snow-peas', isOptional: false },
        { id: '3', name: 'Carrots', amount: 2, unit: 'medium', cropId: 'carrots', isOptional: false },
        { id: '4', name: 'Bell pepper', amount: 1, unit: 'large', cropId: 'bell-peppers', isOptional: false },
        { id: '5', name: 'Ginger', amount: 1, unit: 'tbsp', cropId: 'ginger', isOptional: false },
        { id: '6', name: 'Garlic', amount: 3, unit: 'cloves', isOptional: false },
        { id: '7', name: 'Sesame oil', amount: 2, unit: 'tbsp', isOptional: false },
        { id: '8', name: 'Soy sauce', amount: 3, unit: 'tbsp', isOptional: false },
        { id: '9', name: 'Rice vinegar', amount: 1, unit: 'tbsp', isOptional: false },
        { id: '10', name: 'Green onions', amount: 3, unit: 'stalks', cropId: 'green-onions', isOptional: true }
      ],
      instructions: [
        { step: 1, instruction: 'Prep all vegetables: cut broccoli into florets, slice carrots diagonally, strip snow peas, and slice bell pepper.' },
        { step: 2, instruction: 'Mince ginger and garlic.' },
        { step: 3, instruction: 'Heat sesame oil in a large wok or skillet over high heat.' },
        { step: 4, instruction: 'Add ginger and garlic, stir-fry for 30 seconds until fragrant.' },
        { step: 5, instruction: 'Add harder vegetables first (carrots, broccoli) and stir-fry for 2-3 minutes.' },
        { step: 6, instruction: 'Add bell pepper and snow peas, stir-fry for another 2 minutes.' },
        { step: 7, instruction: 'Add soy sauce and rice vinegar, toss to coat.' },
        { step: 8, instruction: 'Garnish with sliced green onions and serve immediately over rice.' }
      ],
      nutritionFacts: { calories: 95, protein: 4, carbs: 12, fat: 4, fiber: 4 },
      tips: [
        'Keep the heat high for proper stir-fry technique',
        'Have all ingredients prepped before you start cooking',
        'Don\'t overcook - vegetables should be crisp-tender'
      ],
      rating: 4.6,
      reviewCount: 156,
      matchingCrops: ['broccoli', 'snow-peas', 'carrots', 'bell-peppers', 'ginger', 'green-onions'],
      matchScore: 94
    },
    {
      id: '5',
      name: 'Berry Spinach Power Smoothie',
      description: 'Nutrient-packed smoothie with fresh berries, spinach, and natural sweeteners.',
      image: '/api/placeholder/400/300',
      prepTime: 5,
      cookTime: 0,
      totalTime: 5,
      servings: 2,
      difficulty: 'easy',
      cuisine: 'American',
      dietaryTags: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
      ingredients: [
        { id: '1', name: 'Fresh spinach', amount: 2, unit: 'cups', cropId: 'spinach', isOptional: false },
        { id: '2', name: 'Strawberries', amount: 1, unit: 'cup', cropId: 'strawberries', isOptional: false },
        { id: '3', name: 'Blueberries', amount: 0.5, unit: 'cup', cropId: 'blueberries', isOptional: false },
        { id: '4', name: 'Banana', amount: 1, unit: 'medium', isOptional: false },
        { id: '5', name: 'Almond milk', amount: 1, unit: 'cup', isOptional: false },
        { id: '6', name: 'Chia seeds', amount: 1, unit: 'tbsp', isOptional: true },
        { id: '7', name: 'Honey or maple syrup', amount: 1, unit: 'tbsp', isOptional: true }
      ],
      instructions: [
        { step: 1, instruction: 'Wash spinach and berries thoroughly.' },
        { step: 2, instruction: 'Add spinach and almond milk to blender first.' },
        { step: 3, instruction: 'Add banana, strawberries, and blueberries.' },
        { step: 4, instruction: 'Add chia seeds and sweetener if using.' },
        { step: 5, instruction: 'Blend on high speed for 60-90 seconds until completely smooth.' },
        { step: 6, instruction: 'Add more liquid if needed for desired consistency.' },
        { step: 7, instruction: 'Serve immediately or store in refrigerator for up to 24 hours.' }
      ],
      nutritionFacts: { calories: 165, protein: 5, carbs: 32, fat: 3, fiber: 7 },
      tips: [
        'Freeze berries ahead of time for a thicker smoothie',
        'Start with less liquid and add more as needed',
        'Add spinach gradually if you\'re new to green smoothies'
      ],
      rating: 4.4,
      reviewCount: 98,
      matchingCrops: ['spinach', 'strawberries', 'blueberries'],
      matchScore: 88
    }
  ];

  // Simulate API call to get recipe recommendations
  async getRecommendations(request: RecipeRecommendationRequest): Promise<Recipe[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredRecipes = [...this.recipes];

        // Filter by crops if provided
        if (request.cropIds && request.cropIds.length > 0) {
          filteredRecipes = filteredRecipes.map(recipe => {
            const matchingCount = recipe.matchingCrops.filter(cropId => 
              request.cropIds!.includes(cropId)
            ).length;
            
            // Calculate match score based on how many of user's crops match
            const matchScore = (matchingCount / recipe.matchingCrops.length) * 100;
            
            return { ...recipe, matchScore };
          }).filter(recipe => recipe.matchScore > 0);
        }

        // Filter by dietary preferences
        if (request.dietaryPreferences && request.dietaryPreferences.length > 0) {
          filteredRecipes = filteredRecipes.filter(recipe =>
            request.dietaryPreferences!.some(pref => recipe.dietaryTags.includes(pref))
          );
        }

        // Filter by difficulty
        if (request.difficulty) {
          filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.difficulty === request.difficulty
          );
        }

        // Filter by max prep time
        if (request.maxPrepTime) {
          filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.totalTime <= request.maxPrepTime!
          );
        }

        // Sort by match score (descending) and rating
        filteredRecipes.sort((a, b) => {
          if (a.matchScore !== b.matchScore) {
            return b.matchScore - a.matchScore;
          }
          return b.rating - a.rating;
        });

        resolve(filteredRecipes.slice(0, 10)); // Return top 10 matches
      }, 300);
    });
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const recipe = this.recipes.find(r => r.id === id) || null;
        resolve(recipe);
      }, 100);
    });
  }

  async searchRecipes(query: string): Promise<Recipe[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = this.recipes.filter(recipe =>
          recipe.name.toLowerCase().includes(query.toLowerCase()) ||
          recipe.description.toLowerCase().includes(query.toLowerCase()) ||
          recipe.ingredients.some(ingredient =>
            ingredient.name.toLowerCase().includes(query.toLowerCase())
          ) ||
          recipe.cuisine.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 200);
    });
  }

  async getRecipesByCategory(cuisine: string): Promise<Recipe[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = this.recipes.filter(recipe =>
          recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
        );
        resolve(results);
      }, 200);
    });
  }

  // Save user's custom recipes
  async saveCustomRecipe(userId: string, recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRecipe: Recipe = {
          ...recipe,
          id: `custom-${Date.now()}`,
          rating: 0,
          reviewCount: 0
        };
        this.recipes.push(newRecipe);
        resolve(newRecipe);
      }, 300);
    });
  }

  // Get shopping list based on recipe
  getShoppingList(recipe: Recipe, cropIds: string[]): {
    availableIngredients: RecipeIngredient[];
    needToBuy: RecipeIngredient[];
  } {
    const availableIngredients: RecipeIngredient[] = [];
    const needToBuy: RecipeIngredient[] = [];

    recipe.ingredients.forEach(ingredient => {
      if (ingredient.cropId && cropIds.includes(ingredient.cropId)) {
        availableIngredients.push(ingredient);
      } else {
        needToBuy.push(ingredient);
      }
    });

    return { availableIngredients, needToBuy };
  }
}

export const recipeService = new RecipeService();
