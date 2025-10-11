import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import AdminLayout from '../../components/admin/AdminLayout.jsx';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  });
  const [searchInput, setSearchInput] = useState(''); // Separate input state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // Debounced search effect - only triggers API call, not component re-render
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Fetch reviews function
  const fetchReviews = useCallback(
    async (isSearch = false) => {
      try {
        if (isSearch) {
          setSearching(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const params = {
          ...(filters.status !== 'all' && { status: filters.status }),
          ...(filters.search && { search: filters.search }),
          limit: pagination.limit,
          offset: (pagination.page - 1) * pagination.limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        };

        const response = await apiService.getAdminReviews(params);

        setReviews(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        if (isSearch) {
          setSearching(false);
        } else {
          setLoading(false);
        }
      }
    },
    [filters.status, filters.search, pagination.limit, pagination.page],
  );

  // Single effect to handle all data fetching
  useEffect(() => {
    const isSearching = filters.search !== '';
    fetchReviews(isSearching);
  }, [filters.status, filters.search, pagination.page, pagination.limit, fetchReviews]);

  // Handle review approval
  const handleApproveReview = async (reviewId) => {
    try {
      await apiService.approveReview(reviewId, adminNotes);
      setAdminNotes('');
      fetchReviews();
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review');
    }
  };

  // Handle review rejection
  const handleRejectReview = async (reviewId) => {
    try {
      await apiService.rejectReview(reviewId, adminNotes);
      setAdminNotes('');
      fetchReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Failed to reject review');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (selectedReviews.length === 0 || !bulkAction) return;

    try {
      const promises = selectedReviews.map((reviewId) => {
        if (bulkAction === 'approve') {
          return apiService.approveReview(reviewId, adminNotes);
        } else if (bulkAction === 'reject') {
          return apiService.rejectReview(reviewId, adminNotes);
        }
      });

      await Promise.all(promises);
      setSelectedReviews([]);
      setBulkAction('');
      setAdminNotes('');
      fetchReviews();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  // Toggle review selection
  const toggleReviewSelection = (reviewId) => {
    setSelectedReviews((prev) =>
      prev.includes(reviewId) ? prev.filter((id) => id !== reviewId) : [...prev, reviewId],
    );
  };

  // Select all reviews
  const selectAllReviews = () => {
    setSelectedReviews(reviews.map((review) => review.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedReviews([]);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded-lg w-48 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-lg p-4">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Review Management</h1>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-lg shadow-slate-200/30 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Reviews</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700 whitespace-nowrap">
                  Search:
                </label>
                <div className="relative">
                  <Input
                    key="search-input"
                    type="text"
                    placeholder="Search reviews..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-64 px-3 py-1.5 text-sm pr-8"
                  />
                  {searching && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => {
                  setFilters((prev) => ({ ...prev, search: searchInput }));
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-sm rounded-lg"
              >
                Search
              </Button>

              {searchInput && (
                <Button
                  onClick={() => {
                    setSearchInput('');
                    setFilters((prev) => ({ ...prev, search: '' }));
                  }}
                  variant="outline"
                  className="px-4 py-1.5 text-sm rounded-lg"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedReviews.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-blue-900">
                  {selectedReviews.length} review{selectedReviews.length !== 1 ? 's' : ''} selected
                </span>

                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Action</option>
                  <option value="approve">Approve Selected</option>
                  <option value="reject">Reject Selected</option>
                </select>

                <Input
                  type="text"
                  placeholder="Admin notes (optional)"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-48 px-3 py-1.5 text-sm"
                />

                <Button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm rounded-lg disabled:opacity-50"
                >
                  Apply
                </Button>

                <Button
                  onClick={clearSelection}
                  variant="outline"
                  className="px-3 py-1.5 text-sm rounded-lg"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Reviews Table */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-lg shadow-slate-200/30 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Reviews ({reviews.length})</h3>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={selectAllReviews}
                    variant="outline"
                    className="px-3 py-1.5 text-sm rounded-lg"
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={clearSelection}
                    variant="outline"
                    className="px-3 py-1.5 text-sm rounded-lg"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedReviews.length === reviews.length && reviews.length > 0}
                        onChange={(e) => (e.target.checked ? selectAllReviews() : clearSelection())}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Review
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reviews.map((review) => (
                    <tr key={review.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedReviews.includes(review.id)}
                          onChange={() => toggleReviewSelection(review.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {review.productTitle}
                          </div>
                          <div className="text-sm text-slate-500">{review.productBrand}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {review.userName || 'Anonymous'}
                          </div>
                          <div className="text-sm text-slate-500">{review.userEmail}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
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
                          <span className="ml-1 text-sm text-slate-600">{review.rating}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {review.title && (
                            <div className="text-sm font-medium text-slate-900 mb-1">
                              {review.title}
                            </div>
                          )}
                          <div className="text-sm text-slate-600 line-clamp-2">{review.review}</div>
                        </div>
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(review.status)}</td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {review.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleApproveReview(review.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs rounded-lg"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectReview(review.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs rounded-lg"
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {review.status === 'approved' && (
                            <Button
                              onClick={() => handleRejectReview(review.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs rounded-lg"
                            >
                              Reject
                            </Button>
                          )}

                          {review.status === 'rejected' && (
                            <Button
                              onClick={() => handleApproveReview(review.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs rounded-lg"
                            >
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reviews.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-slate-900 mb-2">No reviews found</h4>
                <p className="text-slate-600">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
