interface SearchFilters {
  query?: string;
  category?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  location?: string[];
  certifications?: string[];
  season?: string[];
  availability?: 'available' | 'low_stock' | 'pre_order' | 'all';
  farmerRating?: number;
  organic?: boolean;
  localOnly?: boolean;
  sortBy?: 'price_low' | 'price_high' | 'rating' | 'distance' | 'name' | 'newest';
}

interface CropSearchResult {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  description: string;
  harvestDate: string;
  location: {
    city: string;
    state: string;
    distance?: number; // miles from user
  };
  farmer: {
    id: string;
    name: string;
    rating: number;
    verified: boolean;
  };
  images: string[];
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fiber: number;
  };
  certifications: string[];
  season: string;
  availability: 'available' | 'low_stock' | 'pre_order' | 'out_of_stock';
  isOrganic: boolean;
  sustainabilityScore: number;
  tags: string[];
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
}

class SearchService {
  private allCrops: CropSearchResult[] = [
    {
      id: 'tomatoes',
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      price: 3.50,
      unit: 'lb',
      quantity: 500,
      description: 'Fresh, vine-ripened organic tomatoes grown using sustainable farming practices.',
      harvestDate: '2024-10-10',
      location: { city: 'Fresno', state: 'California', distance: 12 },
      farmer: { id: '2', name: 'Maria Garcia', rating: 4.9, verified: true },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 18, protein: 0.9, carbs: 3.9, fiber: 1.2 },
      certifications: ['USDA Organic', 'Non-GMO', 'Locally Grown'],
      season: 'summer',
      availability: 'available',
      isOrganic: true,
      sustainabilityScore: 95,
      tags: ['vine-ripened', 'heirloom', 'pesticide-free'],
      reviews: { averageRating: 4.8, totalReviews: 156 }
    },
    {
      id: 'corn',
      name: 'Sweet Corn',
      category: 'Grains',
      price: 4.50,
      unit: 'dozen',
      quantity: 200,
      description: 'Premium sweet corn with tender kernels and natural sweetness.',
      harvestDate: '2024-10-05',
      location: { city: 'Des Moines', state: 'Iowa', distance: 245 },
      farmer: { id: '1', name: 'John Smith', rating: 4.8, verified: true },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 96, protein: 3.4, carbs: 21, fiber: 2.4 },
      certifications: ['Farm Fresh', 'Pesticide-Free'],
      season: 'summer',
      availability: 'available',
      isOrganic: false,
      sustainabilityScore: 87,
      tags: ['non-GMO', 'family-farm', 'sweet'],
      reviews: { averageRating: 4.7, totalReviews: 203 }
    },
    {
      id: 'lettuce',
      name: 'Fresh Lettuce',
      category: 'Leafy Greens',
      price: 2.25,
      unit: 'head',
      quantity: 150,
      description: 'Crisp, fresh lettuce perfect for salads and sandwiches.',
      harvestDate: '2024-10-12',
      location: { city: 'Fresno', state: 'California', distance: 12 },
      farmer: { id: '2', name: 'Maria Garcia', rating: 4.9, verified: true },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 5, protein: 0.5, carbs: 1, fiber: 0.5 },
      certifications: ['USDA Organic', 'Locally Grown'],
      season: 'spring',
      availability: 'available',
      isOrganic: true,
      sustainabilityScore: 92,
      tags: ['crisp', 'hydroponic', 'butter-lettuce'],
      reviews: { averageRating: 4.6, totalReviews: 89 }
    },
    {
      id: 'apples',
      name: 'Honeycrisp Apples',
      category: 'Fruits',
      price: 5.75,
      unit: 'lb',
      quantity: 800,
      description: 'Premium Honeycrisp apples with exceptional crunch and sweet-tart flavor.',
      harvestDate: '2024-09-28',
      location: { city: 'Hood River', state: 'Oregon', distance: 180 },
      farmer: { id: '3', name: 'Sarah Chen', rating: 4.7, verified: true },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 52, protein: 0.3, carbs: 14, fiber: 2.4 },
      certifications: ['IPM Certified', 'Farm Fresh'],
      season: 'fall',
      availability: 'available',
      isOrganic: false,
      sustainabilityScore: 89,
      tags: ['crisp', 'sweet-tart', 'premium'],
      reviews: { averageRating: 4.9, totalReviews: 312 }
    },
    {
      id: 'potatoes',
      name: 'Russet Potatoes',
      category: 'Root Vegetables',
      price: 1.85,
      unit: 'lb',
      quantity: 1200,
      description: 'High-quality Russet potatoes perfect for baking, frying, or mashing.',
      harvestDate: '2024-09-15',
      location: { city: 'Boise', state: 'Idaho', distance: 420 },
      farmer: { id: '4', name: 'Mike Thompson', rating: 4.6, verified: true },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 77, protein: 2, carbs: 17, fiber: 2.2 },
      certifications: ['Sustainable Farming', 'Non-GMO'],
      season: 'fall',
      availability: 'available',
      isOrganic: false,
      sustainabilityScore: 85,
      tags: ['russet', 'baking', 'versatile'],
      reviews: { averageRating: 4.5, totalReviews: 178 }
    },
    {
      id: 'carrots',
      name: 'Organic Carrots',
      category: 'Root Vegetables',
      price: 2.75,
      unit: 'bunch',
      quantity: 180,
      description: 'Sweet, crunchy organic carrots packed with beta-carotene.',
      harvestDate: '2024-10-01',
      location: { city: 'Boise', state: 'Idaho', distance: 420 },
      farmer: { id: '4', name: 'Mike Thompson', rating: 4.6, verified: true },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 25, protein: 0.5, carbs: 6, fiber: 1.7 },
      certifications: ['USDA Organic', 'Non-GMO'],
      season: 'fall',
      availability: 'low_stock',
      isOrganic: true,
      sustainabilityScore: 93,
      tags: ['beta-carotene', 'sweet', 'rainbow-variety'],
      reviews: { averageRating: 4.7, totalReviews: 145 }
    },
    {
      id: 'spinach',
      name: 'Baby Spinach',
      category: 'Leafy Greens',
      price: 3.25,
      unit: 'bag',
      quantity: 220,
      description: 'Tender baby spinach leaves perfect for salads, smoothies, or cooking.',
      harvestDate: '2024-10-14',
      location: { city: 'Salinas', state: 'California', distance: 85 },
      farmer: { id: '5', name: 'Carlos Martinez', rating: 4.8, verified: true },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 7, protein: 0.9, carbs: 1.1, fiber: 0.7 },
      certifications: ['USDA Organic', 'Locally Grown'],
      season: 'spring',
      availability: 'available',
      isOrganic: true,
      sustainabilityScore: 94,
      tags: ['baby-leaves', 'iron-rich', 'superfood'],
      reviews: { averageRating: 4.8, totalReviews: 267 }
    },
    {
      id: 'strawberries',
      name: 'Fresh Strawberries',
      category: 'Fruits',
      price: 6.50,
      unit: 'pint',
      quantity: 95,
      description: 'Sweet, juicy strawberries bursting with flavor.',
      harvestDate: '2024-10-08',
      location: { city: 'Tampa', state: 'Florida', distance: 650 },
      farmer: { id: '6', name: 'Amanda Davis', rating: 4.9, verified: true },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 32, protein: 0.7, carbs: 7.7, fiber: 2 },
      certifications: ['Pesticide-Free', 'Farm Fresh'],
      season: 'spring',
      availability: 'pre_order',
      isOrganic: false,
      sustainabilityScore: 88,
      tags: ['sweet', 'juicy', 'vitamin-c'],
      reviews: { averageRating: 4.9, totalReviews: 198 }
    },
    {
      id: 'kale',
      name: 'Curly Kale',
      category: 'Leafy Greens',
      price: 2.95,
      unit: 'bunch',
      quantity: 75,
      description: 'Nutrient-dense curly kale perfect for smoothies and salads.',
      harvestDate: '2024-10-16',
      location: { city: 'Portland', state: 'Oregon', distance: 165 },
      farmer: { id: '7', name: 'Jennifer Wilson', rating: 4.5, verified: false },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 33, protein: 2.9, carbs: 6, fiber: 3.6 },
      certifications: ['USDA Organic'],
      season: 'fall',
      availability: 'available',
      isOrganic: true,
      sustainabilityScore: 96,
      tags: ['superfood', 'nutrient-dense', 'antioxidants'],
      reviews: { averageRating: 4.4, totalReviews: 92 }
    },
    {
      id: 'blueberries',
      name: 'Wild Blueberries',
      category: 'Fruits',
      price: 8.25,
      unit: 'pint',
      quantity: 60,
      description: 'Hand-picked wild blueberries with intense flavor and antioxidants.',
      harvestDate: '2024-09-20',
      location: { city: 'Bar Harbor', state: 'Maine', distance: 890 },
      farmer: { id: '8', name: 'Robert Hartley', rating: 4.6, verified: true },
      images: ['/api/placeholder/400/300'],
      nutritionFacts: { calories: 57, protein: 0.7, carbs: 14.5, fiber: 2.4 },
      certifications: ['Wild Harvested', 'Pesticide-Free'],
      season: 'summer',
      availability: 'low_stock',
      isOrganic: true,
      sustainabilityScore: 98,
      tags: ['wild', 'antioxidants', 'premium'],
      reviews: { averageRating: 4.8, totalReviews: 134 }
    }
  ];

  // Search and filter crops
  async searchCrops(filters: SearchFilters): Promise<{
    results: CropSearchResult[];
    totalCount: number;
    appliedFilters: SearchFilters;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let results = [...this.allCrops];

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(crop => 
        crop.name.toLowerCase().includes(query) ||
        crop.description.toLowerCase().includes(query) ||
        crop.category.toLowerCase().includes(query) ||
        crop.farmer.name.toLowerCase().includes(query) ||
        crop.tags.some(tag => tag.toLowerCase().includes(query)) ||
        crop.certifications.some(cert => cert.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (filters.category && filters.category.length > 0) {
      results = results.filter(crop => 
        filters.category!.includes(crop.category)
      );
    }

    // Price range filter
    if (filters.priceRange) {
      results = results.filter(crop => 
        crop.price >= filters.priceRange!.min && 
        crop.price <= filters.priceRange!.max
      );
    }

    // Location filter
    if (filters.location && filters.location.length > 0) {
      results = results.filter(crop => 
        filters.location!.includes(crop.location.state)
      );
    }

    // Certifications filter
    if (filters.certifications && filters.certifications.length > 0) {
      results = results.filter(crop => 
        filters.certifications!.some(cert => 
          crop.certifications.includes(cert)
        )
      );
    }

    // Season filter
    if (filters.season && filters.season.length > 0) {
      results = results.filter(crop => 
        filters.season!.includes(crop.season)
      );
    }

    // Availability filter
    if (filters.availability && filters.availability !== 'all') {
      results = results.filter(crop => 
        crop.availability === filters.availability
      );
    }

    // Farmer rating filter
    if (filters.farmerRating) {
      results = results.filter(crop => 
        crop.farmer.rating >= filters.farmerRating!
      );
    }

    // Organic filter
    if (filters.organic !== undefined) {
      results = results.filter(crop => 
        crop.isOrganic === filters.organic
      );
    }

    // Local only filter (within 100 miles)
    if (filters.localOnly) {
      results = results.filter(crop => 
        crop.location.distance && crop.location.distance <= 100
      );
    }

    // Sorting
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_low':
            return a.price - b.price;
          case 'price_high':
            return b.price - a.price;
          case 'rating':
            return b.reviews.averageRating - a.reviews.averageRating;
          case 'distance':
            return (a.location.distance || 999) - (b.location.distance || 999);
          case 'name':
            return a.name.localeCompare(b.name);
          case 'newest':
            return new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime();
          default:
            return 0;
        }
      });
    }

    return {
      results,
      totalCount: results.length,
      appliedFilters: filters
    };
  }

  // Get filter options for UI
  getFilterOptions() {
    const categories = Array.from(new Set(this.allCrops.map(crop => crop.category)));
    const locations = Array.from(new Set(this.allCrops.map(crop => crop.location.state)));
    const certifications = Array.from(new Set(this.allCrops.flatMap(crop => crop.certifications)));
    const seasons = Array.from(new Set(this.allCrops.map(crop => crop.season)));
    
    const priceRange = {
      min: Math.min(...this.allCrops.map(crop => crop.price)),
      max: Math.max(...this.allCrops.map(crop => crop.price))
    };

    return {
      categories: categories.sort(),
      locations: locations.sort(),
      certifications: certifications.sort(),
      seasons: seasons.sort(),
      priceRange,
      availabilityOptions: ['all', 'available', 'low_stock', 'pre_order'] as const,
      sortOptions: [
        { value: 'name', label: 'Name A-Z' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'distance', label: 'Distance' },
        { value: 'newest', label: 'Recently Harvested' }
      ]
    };
  }

  // Save search for user history
  saveSearch(userId: string, filters: SearchFilters) {
    const searches = JSON.parse(localStorage.getItem(`search_history_${userId}`) || '[]');
    searches.unshift({
      ...filters,
      timestamp: Date.now(),
      id: Date.now().toString()
    });
    
    // Keep only last 20 searches
    localStorage.setItem(`search_history_${userId}`, JSON.stringify(searches.slice(0, 20)));
  }

  // Get user's search history
  getSearchHistory(userId: string) {
    return JSON.parse(localStorage.getItem(`search_history_${userId}`) || '[]');
  }

  // Quick search suggestions
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    this.allCrops.forEach(crop => {
      if (crop.name.toLowerCase().includes(queryLower)) {
        suggestions.add(crop.name);
      }
      if (crop.category.toLowerCase().includes(queryLower)) {
        suggestions.add(crop.category);
      }
      crop.tags.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions.values()).slice(0, 8);
  }
}

export type { SearchFilters, CropSearchResult };
export const searchService = new SearchService();
