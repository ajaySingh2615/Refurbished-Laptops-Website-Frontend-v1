import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from './ui/Button.jsx';
import { Input } from './ui/Input.jsx';

export default function ProductReviews({ productId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    review: '',
    isAnonymous: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch reviews and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reviewsResponse, statsResponse] = await Promise.all([
          apiService.getProductReviews(productId, { limit: 10 }),
          apiService.getProductReviewStats(productId),
        ]);

        setReviews(reviewsResponse.data.reviews);
        setStats(reviewsResponse.data.stats);

        // Check if user can review
        if (user) {
          try {
            const canReviewResponse = await apiService.canUserReview(productId);
            setCanReview(canReviewResponse.data.canReview);
          } catch (error) {
            console.error('Error checking review eligibility:', error);
            // If user is not authenticated or there's an error, they can't review
            setCanReview(false);
          }
        } else {
          // No user logged in, can't review
          setCanReview(false);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, user]);

  // Handle review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    try {
      setSubmitting(true);
      await apiService.createReview(productId, reviewForm);

      // Reset form and refresh reviews
      setReviewForm({
        rating: 0,
        title: '',
        review: '',
        isAnonymous: false,
      });
      setShowReviewForm(false);
      setCanReview(false);

      // Refresh reviews
      const reviewsResponse = await apiService.getProductReviews(productId, { limit: 10 });
      setReviews(reviewsResponse.data.reviews);

      alert('Review submitted successfully! It will be published after admin approval.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle review helpfulness
  const handleReviewHelpfulness = async (reviewId, isHelpful) => {
    if (!user) {
      alert('Please login to vote on reviews');
      return;
    }

    try {
      await apiService.updateReviewHelpfulness(reviewId, isHelpful);
      // Refresh reviews to get updated counts
      const reviewsResponse = await apiService.getProductReviews(productId, { limit: 10 });
      setReviews(reviewsResponse.data.reviews);
    } catch (error) {
      console.error('Error updating review helpfulness:', error);
    }
  };

  if (loading) {
    return (
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded-lg w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-lg p-4">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Reviews & Ratings</h3>
          </div>

          {user && canReview && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
            >
              Write Review
            </Button>
          )}
        </div>

        {/* Review Stats */}
        {stats && stats.totalReviews > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Overall Rating */}
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl font-bold text-slate-900">
                  {typeof stats.averageRating === 'number' ? stats.averageRating.toFixed(1) : '0.0'}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(Number(stats.averageRating) || 0)
                            ? 'text-yellow-400'
                            : 'text-slate-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-sm text-slate-600">
                    Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Rating Breakdown</h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats[`rating${rating}`] || 0;
                  const percentage =
                    stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-600 w-8">{rating}</span>
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-600 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <motion.div
            className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-slate-900 mb-4">Write Your Review</h4>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewForm((prev) => ({ ...prev, rating }))}
                      className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 ${
                        rating <= reviewForm.rating
                          ? 'border-yellow-400 bg-yellow-100 text-yellow-600'
                          : 'border-slate-300 text-slate-400 hover:border-yellow-300'
                      }`}
                    >
                      <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Review Title
                </label>
                <Input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Summarize your review in a few words"
                  className="w-full"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                <textarea
                  value={reviewForm.review}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, review: e.target.value }))}
                  placeholder="Share your experience with this product..."
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Anonymous */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={reviewForm.isAnonymous}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, isAnonymous: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="anonymous" className="text-sm text-slate-700">
                  Post as anonymous
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={reviewForm.rating === 0 || submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  variant="outline"
                  className="px-6 py-2 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="bg-slate-50 rounded-xl p-6 border border-slate-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* Review Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-slate-600 font-medium">
                        {review.isAnonymous ? 'A' : review.userName?.[0] || 'U'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {review.isAnonymous ? 'Anonymous' : review.userName || 'User'}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400' : 'text-slate-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                {review.title && (
                  <h5 className="font-semibold text-slate-900 mb-2">{review.title}</h5>
                )}

                {review.review && (
                  <p className="text-slate-700 mb-4 leading-relaxed">{review.review}</p>
                )}

                {/* Review Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleReviewHelpfulness(review.id, true)}
                      className="flex items-center gap-1 text-sm text-slate-600 hover:text-green-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14l5-5 5 5z" />
                      </svg>
                      Helpful ({review.helpfulCount})
                    </button>
                    <button
                      onClick={() => handleReviewHelpfulness(review.id, false)}
                      className="flex items-center gap-1 text-sm text-slate-600 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 10l-5 5-5-5z" />
                      </svg>
                      Not Helpful ({review.notHelpfulCount})
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-slate-900 mb-2">No reviews yet</h4>
            <p className="text-slate-600">Be the first to review this product!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
