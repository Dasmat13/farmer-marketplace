export interface ComparisonCrop {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  quantity: number;
  farmer: {
    id: string;
    name: string;
    rating: number;
    location: string;
    verified: boolean;
    yearsExperience: number;
  };
  location: {
    city: string;
    state: string;
    distance?: number;
  };
  nutritionFacts: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    vitaminC?: number;
    calcium?: number;
    iron?: number;
  };
  sustainabilityMetrics: {
    score: number; // 0-100
    carbonFootprint: number; // kg CO2 per kg
    waterUsage: number; // liters per kg
    organicCertified: boolean;
    locallyGrown: boolean;
    seasonalAvailability: string[];
  };
  qualityMetrics: {
    freshness: number; // 0-100
    harvestDate: string;
    shelfLife: number; // days
    storageRequirements: string;
  };
  certifications: string[];
  images: string[];
  availability: 'available' | 'low_stock' | 'pre_order' | 'out_of_stock';
  reviews: {
    averageRating: number;
    totalReviews: number;
  };
}

export interface ComparisonResult {
  crops: ComparisonCrop[];
  bestValues: {
    lowestPrice: ComparisonCrop;
    highestProtein: ComparisonCrop;
    bestSustainability: ComparisonCrop;
    highestRated: ComparisonCrop;
    freshest: ComparisonCrop;
  };
  recommendations: {
    bestForBudget: ComparisonCrop;
    bestForNutrition: ComparisonCrop;
    bestForEnvironment: ComparisonCrop;
    bestOverall: ComparisonCrop;
  };
}

class CropComparisonService {
  // Mock data for comparison - in a real app, this would come from the API
  private mockCrops: ComparisonCrop[] = [
    {
      id: 'tomatoes-organic',
      name: 'Organic Heirloom Tomatoes',
      category: 'Vegetables',
      price: 5.99,
      unit: 'lb',
      quantity: 150,
      farmer: {
        id: 'farmer1',
        name: 'Sarah Johnson',
        rating: 4.8,
        location: 'California',
        verified: true,
        yearsExperience: 15
      },
      location: {
        city: 'Fresno',
        state: 'California',
        distance: 50
      },
      nutritionFacts: {
        calories: 18,
        protein: 0.9,
        carbs: 3.9,
        fat: 0.2,
        fiber: 1.2,
        vitaminC: 14,
        calcium: 10,
        iron: 0.3
      },
      sustainabilityMetrics: {
        score: 92,
        carbonFootprint: 0.8,
        waterUsage: 214,
        organicCertified: true,
        locallyGrown: true,
        seasonalAvailability: ['summer', 'fall']
      },
      qualityMetrics: {
        freshness: 95,
        harvestDate: '2024-03-14',
        shelfLife: 7,
        storageRequirements: 'Cool, dry place'
      },
      certifications: ['USDA Organic', 'Non-GMO', 'Locally Grown'],
      images: ['/api/placeholder/400/300'],
      availability: 'available',
      reviews: {
        averageRating: 4.7,
        totalReviews: 156
      }
    },
    {
      id: 'tomatoes-conventional',
      name: 'Fresh Roma Tomatoes',
      category: 'Vegetables',
      price: 3.49,
      unit: 'lb',
      quantity: 300,
      farmer: {
        id: 'farmer2',
        name: 'Mike Rodriguez',
        rating: 4.2,
        location: 'California',
        verified: true,
        yearsExperience: 22
      },
      location: {
        city: 'Salinas',
        state: 'California',
        distance: 75
      },
      nutritionFacts: {
        calories: 18,
        protein: 0.9,
        carbs: 3.9,
        fat: 0.2,
        fiber: 1.2,
        vitaminC: 13,
        calcium: 10,
        iron: 0.3
      },
      sustainabilityMetrics: {
        score: 68,
        carbonFootprint: 1.2,
        waterUsage: 185,
        organicCertified: false,
        locallyGrown: true,
        seasonalAvailability: ['spring', 'summer', 'fall']
      },
      qualityMetrics: {
        freshness: 88,
        harvestDate: '2024-03-16',
        shelfLife: 5,
        storageRequirements: 'Refrigerate after opening'
      },
      certifications: ['Farm Fresh', 'Locally Grown'],
      images: ['/api/placeholder/400/300'],
      availability: 'available',
      reviews: {
        averageRating: 4.3,
        totalReviews: 89
      }
    },
    {
      id: 'spinach-organic',
      name: 'Baby Spinach - Organic',
      category: 'Leafy Greens',
      price: 4.25,
      unit: 'bag',
      quantity: 200,
      farmer: {
        id: 'farmer3',
        name: 'Emma Green',
        rating: 4.9,
        location: 'Oregon',
        verified: true,
        yearsExperience: 12
      },
      location: {
        city: 'Portland',
        state: 'Oregon',
        distance: 120
      },
      nutritionFacts: {
        calories: 23,
        protein: 2.9,
        carbs: 3.6,
        fat: 0.4,
        fiber: 2.2,
        vitaminC: 28,
        calcium: 99,
        iron: 2.7
      },
      sustainabilityMetrics: {
        score: 88,
        carbonFootprint: 0.5,
        waterUsage: 120,
        organicCertified: true,
        locallyGrown: false,
        seasonalAvailability: ['spring', 'fall', 'winter']
      },
      qualityMetrics: {
        freshness: 92,
        harvestDate: '2024-03-15',
        shelfLife: 4,
        storageRequirements: 'Refrigerate immediately'
      },
      certifications: ['USDA Organic', 'Non-GMO'],
      images: ['/api/placeholder/400/300'],
      availability: 'available',
      reviews: {
        averageRating: 4.6,
        totalReviews: 203
      }
    },
    {
      id: 'carrots-rainbow',
      name: 'Rainbow Carrots',
      category: 'Root Vegetables',
      price: 3.89,
      unit: 'bunch',
      quantity: 180,
      farmer: {
        id: 'farmer4',
        name: 'David Chen',
        rating: 4.5,
        location: 'Washington',
        verified: true,
        yearsExperience: 8
      },
      location: {
        city: 'Yakima',
        state: 'Washington',
        distance: 200
      },
      nutritionFacts: {
        calories: 41,
        protein: 0.9,
        carbs: 10,
        fat: 0.2,
        fiber: 2.8,
        vitaminC: 6,
        calcium: 33,
        iron: 0.3
      },
      sustainabilityMetrics: {
        score: 82,
        carbonFootprint: 0.4,
        waterUsage: 131,
        organicCertified: false,
        locallyGrown: false,
        seasonalAvailability: ['fall', 'winter', 'spring']
      },
      qualityMetrics: {
        freshness: 89,
        harvestDate: '2024-03-12',
        shelfLife: 14,
        storageRequirements: 'Cool, humid environment'
      },
      certifications: ['Farm Fresh', 'Pesticide-Free'],
      images: ['/api/placeholder/400/300'],
      availability: 'available',
      reviews: {
        averageRating: 4.4,
        totalReviews: 67
      }
    }
  ];

  // Get crop by ID for comparison
  async getCropForComparison(cropId: string): Promise<ComparisonCrop | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const crop = this.mockCrops.find(c => c.id === cropId) || null;
        resolve(crop);
      }, 100);
    });
  }

  // Compare multiple crops
  async compareCrops(cropIds: string[]): Promise<ComparisonResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const crops = this.mockCrops.filter(crop => cropIds.includes(crop.id));
        
        if (crops.length === 0) {
          resolve({
            crops: [],
            bestValues: {} as any,
            recommendations: {} as any
          });
          return;
        }

        const bestValues = {
          lowestPrice: crops.reduce((min, crop) => 
            crop.price < min.price ? crop : min
          ),
          highestProtein: crops.reduce((max, crop) => 
            crop.nutritionFacts.protein > max.nutritionFacts.protein ? crop : max
          ),
          bestSustainability: crops.reduce((best, crop) => 
            crop.sustainabilityMetrics.score > best.sustainabilityMetrics.score ? crop : best
          ),
          highestRated: crops.reduce((best, crop) => 
            crop.reviews.averageRating > best.reviews.averageRating ? crop : best
          ),
          freshest: crops.reduce((freshest, crop) => 
            crop.qualityMetrics.freshness > freshest.qualityMetrics.freshness ? crop : freshest
          )
        };

        // Calculate overall scores for recommendations
        const cropsWithScores = crops.map(crop => ({
          crop,
          budgetScore: (1 / crop.price) * 100,
          nutritionScore: (crop.nutritionFacts.protein * 2 + crop.nutritionFacts.fiber * 1.5 + (crop.nutritionFacts.vitaminC || 0) * 0.5),
          environmentScore: crop.sustainabilityMetrics.score,
          overallScore: (
            (crop.reviews.averageRating * 20) +
            crop.sustainabilityMetrics.score +
            crop.qualityMetrics.freshness +
            ((1 / crop.price) * 10)
          ) / 4
        }));

        const recommendations = {
          bestForBudget: cropsWithScores.reduce((best, current) => 
            current.budgetScore > best.budgetScore ? current : best
          ).crop,
          bestForNutrition: cropsWithScores.reduce((best, current) => 
            current.nutritionScore > best.nutritionScore ? current : best
          ).crop,
          bestForEnvironment: cropsWithScores.reduce((best, current) => 
            current.environmentScore > best.environmentScore ? current : best
          ).crop,
          bestOverall: cropsWithScores.reduce((best, current) => 
            current.overallScore > best.overallScore ? current : best
          ).crop
        };

        resolve({
          crops,
          bestValues,
          recommendations
        });
      }, 300);
    });
  }

  // Search crops for comparison
  async searchCropsForComparison(query: string): Promise<ComparisonCrop[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = this.mockCrops.filter(crop =>
          crop.name.toLowerCase().includes(query.toLowerCase()) ||
          crop.category.toLowerCase().includes(query.toLowerCase()) ||
          crop.farmer.name.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 200);
    });
  }

  // Get crops by category for comparison
  async getCropsByCategory(category: string): Promise<ComparisonCrop[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = this.mockCrops.filter(crop =>
          crop.category.toLowerCase() === category.toLowerCase()
        );
        resolve(results);
      }, 200);
    });
  }

  // Get similar crops for comparison suggestions
  async getSimilarCrops(cropId: string, limit = 3): Promise<ComparisonCrop[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const baseCrop = this.mockCrops.find(c => c.id === cropId);
        if (!baseCrop) {
          resolve([]);
          return;
        }

        const similar = this.mockCrops
          .filter(crop => crop.id !== cropId && crop.category === baseCrop.category)
          .sort((a, b) => {
            // Score similarity based on price range and farmer rating
            const aScore = Math.abs(a.price - baseCrop.price) + Math.abs(a.reviews.averageRating - baseCrop.reviews.averageRating);
            const bScore = Math.abs(b.price - baseCrop.price) + Math.abs(b.reviews.averageRating - baseCrop.reviews.averageRating);
            return aScore - bScore;
          })
          .slice(0, limit);

        resolve(similar);
      }, 200);
    });
  }
}

export const cropComparisonService = new CropComparisonService();
