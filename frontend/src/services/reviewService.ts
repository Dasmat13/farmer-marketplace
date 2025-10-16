export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId: string; // crop ID or farmer ID
  targetType: 'crop' | 'farmer';
  rating: number; // 1-5 stars
  title: string;
  content: string;
  photos?: string[]; // uploaded photo URLs
  createdAt: string;
  updatedAt?: string;
  verified: boolean; // verified purchase/interaction
  helpfulVotes: number;
  totalVotes: number;
  tags?: string[]; // e.g., ['fresh', 'good_value', 'fast_delivery']
  responses?: ReviewResponse[];
}

export interface ReviewResponse {
  id: string;
  userId: string;
  userName: string;
  userType: 'farmer' | 'buyer' | 'admin';
  content: string;
  createdAt: string;
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  tags: {
    tag: string;
    count: number;
    sentiment: 'positive' | 'negative' | 'neutral';
  }[];
  recentReviews: Review[];
}

export interface CreateReviewRequest {
  targetId: string;
  targetType: 'crop' | 'farmer';
  rating: number;
  title: string;
  content: string;
  photos?: File[];
  tags?: string[];
}

class ReviewService {
  private mockReviews: Review[] = [
    {
      id: '1',
      userId: 'buyer1',
      userName: 'Sarah M.',
      userAvatar: '/api/placeholder/40/40',
      targetId: 'tomatoes',
      targetType: 'crop',
      rating: 5,
      title: 'Amazing heirloom tomatoes!',
      content: 'These tomatoes were absolutely delicious! So fresh and flavorful. You can really taste the difference compared to store-bought ones. The farmer clearly knows what they\'re doing.',
      photos: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
      createdAt: '2024-03-10T14:30:00Z',
      verified: true,
      helpfulVotes: 12,
      totalVotes: 14,
      tags: ['fresh', 'flavorful', 'high_quality'],
      responses: [
        {
          id: 'r1',
          userId: 'farmer1',
          userName: 'Mike Rodriguez',
          userType: 'farmer',
          content: 'Thank you so much for the kind words! We put a lot of care into growing these tomatoes.',
          createdAt: '2024-03-10T16:45:00Z'
        }
      ]
    },
    {
      id: '2',
      userId: 'buyer2',
      userName: 'John D.',
      targetId: 'tomatoes',
      targetType: 'crop',
      rating: 4,
      title: 'Good quality, fast delivery',
      content: 'Very pleased with the quality. Arrived quickly and well-packaged. Only minor issue was one tomato was a bit soft, but the rest were perfect.',
      createdAt: '2024-03-08T10:15:00Z',
      verified: true,
      helpfulVotes: 8,
      totalVotes: 10,
      tags: ['fast_delivery', 'well_packaged', 'good_quality']
    },
    {
      id: '3',
      userId: 'buyer3',
      userName: 'Emily R.',
      targetId: 'spinach',
      targetType: 'crop',
      rating: 5,
      title: 'Best spinach I\'ve ever had!',
      content: 'This baby spinach is incredibly fresh and tender. Perfect for salads and smoothies. Will definitely order again!',
      photos: ['/api/placeholder/300/200'],
      createdAt: '2024-03-05T16:20:00Z',
      verified: true,
      helpfulVotes: 15,
      totalVotes: 16,
      tags: ['fresh', 'tender', 'perfect_for_salads']
    },
    {
      id: '4',
      userId: 'buyer4',
      userName: 'David L.',
      targetId: 'farmer1',
      targetType: 'farmer',
      rating: 5,
      title: 'Excellent farmer, highly recommended!',
      content: 'Mike is fantastic to work with. Always responsive, produces high-quality crops, and really cares about his customers. I\'ve ordered from him multiple times and it\'s always been a great experience.',
      createdAt: '2024-03-12T09:30:00Z',
      verified: true,
      helpfulVotes: 20,
      totalVotes: 22,
      tags: ['responsive', 'high_quality', 'reliable']
    }
  ];

  // Get reviews for a specific target (crop or farmer)
  async getReviews(targetId: string, targetType: 'crop' | 'farmer', page = 1, limit = 10): Promise<{
    reviews: Review[];
    totalCount: number;
    hasMore: boolean;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.mockReviews.filter(
          review => review.targetId === targetId && review.targetType === targetType
        );
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedReviews = filtered.slice(startIndex, endIndex);
        
        resolve({
          reviews: paginatedReviews,
          totalCount: filtered.length,
          hasMore: endIndex < filtered.length
        });
      }, 300);
    });
  }

  // Get review summary/statistics
  async getReviewSummary(targetId: string, targetType: 'crop' | 'farmer'): Promise<ReviewSummary> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = this.mockReviews.filter(
          review => review.targetId === targetId && review.targetType === targetType
        );

        const totalReviews = filtered.length;
        const averageRating = totalReviews > 0 
          ? filtered.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
          : 0;

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        filtered.forEach(review => {
          ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
        });

        // Aggregate tags
        const tagCounts: { [key: string]: number } = {};
        filtered.forEach(review => {
          review.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        const tags = Object.entries(tagCounts)
          .map(([tag, count]) => ({
            tag,
            count,
            sentiment: this.getTagSentiment(tag)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        const recentReviews = filtered
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3);

        resolve({
          totalReviews,
          averageRating,
          ratingDistribution,
          tags,
          recentReviews
        });
      }, 200);
    });
  }

  // Create a new review
  async createReview(userId: string, request: CreateReviewRequest): Promise<Review> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newReview: Review = {
          id: `review-${Date.now()}`,
          userId,
          userName: 'Current User', // In real app, get from user profile
          targetId: request.targetId,
          targetType: request.targetType,
          rating: request.rating,
          title: request.title,
          content: request.content,
          photos: request.photos ? request.photos.map((_, i) => `/api/placeholder/300/200?${i}`) : undefined,
          createdAt: new Date().toISOString(),
          verified: false, // Would be verified after purchase confirmation
          helpfulVotes: 0,
          totalVotes: 0,
          tags: request.tags || []
        };

        this.mockReviews.unshift(newReview);
        resolve(newReview);
      }, 500);
    });
  }

  // Update an existing review
  async updateReview(reviewId: string, updates: Partial<CreateReviewRequest>): Promise<Review> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const reviewIndex = this.mockReviews.findIndex(r => r.id === reviewId);
        
        if (reviewIndex === -1) {
          reject(new Error('Review not found'));
          return;
        }

        const review = this.mockReviews[reviewIndex];
        const updatedReview: Review = {
          ...review,
          ...updates,
          photos: updates.photos ? updates.photos.map((_, i) => `/api/placeholder/300/200?${i}`) : review.photos,
          updatedAt: new Date().toISOString()
        };

        this.mockReviews[reviewIndex] = updatedReview;
        resolve(updatedReview);
      }, 300);
    });
  }

  // Delete a review
  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const reviewIndex = this.mockReviews.findIndex(
          r => r.id === reviewId && r.userId === userId
        );
        
        if (reviewIndex !== -1) {
          this.mockReviews.splice(reviewIndex, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 200);
    });
  }

  // Vote on review helpfulness
  async voteOnReview(reviewId: string, userId: string, helpful: boolean): Promise<Review> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const review = this.mockReviews.find(r => r.id === reviewId);
        
        if (!review) {
          reject(new Error('Review not found'));
          return;
        }

        // In real app, track user votes to prevent duplicate voting
        review.totalVotes += 1;
        if (helpful) {
          review.helpfulVotes += 1;
        }

        resolve(review);
      }, 200);
    });
  }

  // Add response to review (farmer/admin response)
  async addResponse(reviewId: string, userId: string, content: string, userType: 'farmer' | 'admin'): Promise<ReviewResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const review = this.mockReviews.find(r => r.id === reviewId);
        
        if (!review) {
          reject(new Error('Review not found'));
          return;
        }

        const response: ReviewResponse = {
          id: `response-${Date.now()}`,
          userId,
          userName: userType === 'farmer' ? 'Farmer' : 'Admin', // In real app, get actual name
          userType,
          content,
          createdAt: new Date().toISOString()
        };

        if (!review.responses) {
          review.responses = [];
        }
        review.responses.push(response);

        resolve(response);
      }, 300);
    });
  }

  // Get user's reviews
  async getUserReviews(userId: string, page = 1, limit = 10): Promise<{
    reviews: Review[];
    totalCount: number;
    hasMore: boolean;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userReviews = this.mockReviews.filter(r => r.userId === userId);
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedReviews = userReviews.slice(startIndex, endIndex);
        
        resolve({
          reviews: paginatedReviews,
          totalCount: userReviews.length,
          hasMore: endIndex < userReviews.length
        });
      }, 200);
    });
  }

  // Get popular review tags
  getPopularTags(): string[] {
    return [
      'fresh', 'delicious', 'high_quality', 'good_value', 'fast_delivery',
      'well_packaged', 'organic', 'flavorful', 'tender', 'juicy',
      'perfect_ripeness', 'great_customer_service', 'reliable', 'responsive'
    ];
  }

  // Determine tag sentiment (simplified)
  private getTagSentiment(tag: string): 'positive' | 'negative' | 'neutral' {
    const positivesTags = [
      'fresh', 'delicious', 'high_quality', 'good_value', 'fast_delivery',
      'well_packaged', 'organic', 'flavorful', 'tender', 'juicy', 'reliable'
    ];
    
    const negativeTags = [
      'overpriced', 'poor_quality', 'damaged', 'late_delivery', 'bad_taste'
    ];

    if (positivesTags.includes(tag)) return 'positive';
    if (negativeTags.includes(tag)) return 'negative';
    return 'neutral';
  }
}

export const reviewService = new ReviewService();
