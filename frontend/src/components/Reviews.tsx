import React, { useState, useEffect } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Camera, 
  Send, 
  Shield,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { Review, ReviewSummary, reviewService, CreateReviewRequest } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

interface ReviewsProps {
  targetId: string;
  targetType: 'crop' | 'farmer';
  targetName: string;
}

const Reviews: React.FC<ReviewsProps> = ({ targetId, targetType, targetName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    rating: 5,
    title: '',
    content: '',
    photos: [] as File[],
    tags: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
    loadReviewSummary();
  }, [targetId, targetType]);

  const loadReviews = async () => {
    try {
      const result = await reviewService.getReviews(targetId, targetType);
      setReviews(result.reviews);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const loadReviewSummary = async () => {
    try {
      const summary = await reviewService.getReviewSummary(targetId, targetType);
      setReviewSummary(summary);
    } catch (error) {
      console.error('Failed to load review summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please sign in to leave a review');
      return;
    }

    if (!createFormData.title.trim() || !createFormData.content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const request: CreateReviewRequest = {
        targetId,
        targetType,
        rating: createFormData.rating,
        title: createFormData.title.trim(),
        content: createFormData.content.trim(),
        photos: createFormData.photos,
        tags: createFormData.tags
      };

      const newReview = await reviewService.createReview(user.id, request);
      setReviews([newReview, ...reviews]);
      
      // Reset form
      setCreateFormData({
        rating: 5,
        title: '',
        content: '',
        photos: [],
        tags: []
      });
      setShowCreateForm(false);
      
      // Reload summary
      await loadReviewSummary();
    } catch (error) {
      console.error('Failed to create review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteOnReview = async (reviewId: string, helpful: boolean) => {
    if (!user) {
      alert('Please sign in to vote on reviews');
      return;
    }

    try {
      const updatedReview = await reviewService.voteOnReview(reviewId, user.id, helpful);
      setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r));
    } catch (error) {
      console.error('Failed to vote on review:', error);
    }
  };

  const handleTagToggle = (tag: string) => {
    const tags = createFormData.tags.includes(tag)
      ? createFormData.tags.filter(t => t !== tag)
      : [...createFormData.tags, tag];
    
    setCreateFormData({ ...createFormData, tags });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = createFormData.photos.length + files.length;
    
    if (totalPhotos > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }
    
    setCreateFormData({
      ...createFormData,
      photos: [...createFormData.photos, ...files]
    });
  };

  const removePhoto = (index: number) => {
    const photos = createFormData.photos.filter((_, i) => i !== index);
    setCreateFormData({ ...createFormData, photos });
  };

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          onClick={() => interactive && onRate && onRate(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!interactive}
        >
          <Star 
            className={`h-5 w-5 ${
              i <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        </button>
      );
    }
    
    return <div className="flex gap-1">{stars}</div>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const popularTags = reviewService.getPopularTags();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-farm-green-600"></div>
        <span className="ml-2 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {reviewSummary && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
            {user && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-farm-green-600 text-white px-4 py-2 rounded-md hover:bg-farm-green-700 transition-colors font-medium"
              >
                Write Review
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {reviewSummary.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(reviewSummary.averageRating))}
              </div>
              <div className="text-sm text-gray-600">
                Based on {reviewSummary.totalReviews} review{reviewSummary.totalReviews !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-4">{rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: reviewSummary.totalReviews > 0
                          ? `${(reviewSummary.ratingDistribution[rating as keyof typeof reviewSummary.ratingDistribution] / reviewSummary.totalReviews) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {reviewSummary.ratingDistribution[rating as keyof typeof reviewSummary.ratingDistribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          {reviewSummary.tags.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">What customers are saying:</h4>
              <div className="flex flex-wrap gap-2">
                {reviewSummary.tags.slice(0, 8).map((tag) => (
                  <span
                    key={tag.tag}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      tag.sentiment === 'positive'
                        ? 'bg-green-100 text-green-800'
                        : tag.sentiment === 'negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {tag.tag.replace('_', ' ')} ({tag.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Review Form */}
      {showCreateForm && user && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900">Write a Review for {targetName}</h4>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleCreateReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating *
              </label>
              {renderStars(createFormData.rating, true, (rating) =>
                setCreateFormData({ ...createFormData, rating })
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                placeholder="Summarize your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Content *
              </label>
              <textarea
                value={createFormData.content}
                onChange={(e) => setCreateFormData({ ...createFormData, content: e.target.value })}
                placeholder="Tell others about your experience with this crop/farmer..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-farm-green-500"
                required
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      createFormData.tags.includes(tag)
                        ? 'bg-farm-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (Optional - Max 5)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md cursor-pointer transition-colors">
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">Add Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={createFormData.photos.length >= 5}
                  />
                </label>
                <span className="text-sm text-gray-600">
                  {createFormData.photos.length}/5 photos
                </span>
              </div>

              {createFormData.photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {createFormData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-farm-green-600 text-white px-6 py-2 rounded-md hover:bg-farm-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Review
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share your experience with {targetName}!</p>
            {user && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-farm-green-600 text-white px-6 py-2 rounded-md hover:bg-farm-green-700 transition-colors font-medium"
              >
                Write First Review
              </button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.userAvatar ? (
                      <img
                        src={review.userAvatar}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {review.userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      {review.verified && (
                        <div className="relative group">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            Verified Purchase
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{formatDate(review.createdAt)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-4 leading-relaxed">{review.content}</p>

              {/* Review Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {review.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                    />
                  ))}
                </div>
              )}

              {/* Review Tags */}
              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {review.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Helpful Votes */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Was this review helpful?
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVoteOnReview(review.id, true)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Yes</span>
                    </button>
                    <button
                      onClick={() => handleVoteOnReview(review.id, false)}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>No</span>
                    </button>
                  </div>
                </div>
                
                {review.totalVotes > 0 && (
                  <span className="text-sm text-gray-500">
                    {review.helpfulVotes} of {review.totalVotes} found this helpful
                  </span>
                )}
              </div>

              {/* Farmer/Admin Responses */}
              {review.responses && review.responses.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {review.responses.map((response) => (
                    <div key={response.id} className="bg-gray-50 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {response.userName}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          response.userType === 'farmer' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {response.userType === 'farmer' ? 'Farmer' : 'Admin'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(response.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{response.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reviews;
