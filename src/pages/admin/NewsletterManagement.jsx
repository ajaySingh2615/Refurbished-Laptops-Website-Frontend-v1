import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api.js';
import { HiUsers, HiMail, HiTrash, HiSearch, HiFilter } from 'react-icons/hi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout.jsx';

export default function NewsletterManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  const accessToken = localStorage.getItem('accessToken');

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(sourceFilter && { source: sourceFilter }),
      };

      const response = await apiService.getNewsletterSubscriptions(params, accessToken);
      setSubscriptions(response.subscriptions);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to load subscriptions');
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getNewsletterStats(accessToken);
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    loadStats();
  }, [currentPage, searchTerm, sourceFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      setDeletingId(id);
      await apiService.deleteNewsletterSubscription(id, accessToken);
      toast.success('Subscription deleted successfully');
      loadSubscriptions();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete subscription');
      console.error('Error deleting subscription:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadSubscriptions();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSourceBadgeColor = (source) => {
    const colors = {
      homepage: 'bg-blue-100 text-blue-800',
      footer: 'bg-green-100 text-green-800',
      popup: 'bg-purple-100 text-purple-800',
      default: 'bg-gray-100 text-gray-800',
    };
    return colors[source] || colors.default;
  };

  return (
    <AdminLayout>
      <div className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Newsletter Management</h1>
          <p className="text-sm text-gray-600">
            Manage newsletter subscriptions and view analytics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <HiUsers className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Subscribers</p>
                <p className="text-xl font-bold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <HiMail className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Recent (30 days)</p>
                <p className="text-xl font-bold text-gray-900">{stats.recent || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <HiFilter className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Sources</p>
                <p className="text-xl font-bold text-gray-900">{stats.sourceStats?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Source Stats */}
        {stats.sourceStats && stats.sourceStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Subscriptions by Source</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.sourceStats.map((stat) => (
                <div key={stat.source} className="text-center">
                  <div className="text-lg font-bold text-gray-900">{stat.count}</div>
                  <div className="text-xs text-gray-600 capitalize">{stat.source}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-40">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sources</option>
                <option value="homepage">Homepage</option>
                <option value="footer">Footer</option>
                <option value="popup">Popup</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">Subscriptions</h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading subscriptions...</p>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-6 text-center">
              <HiMail className="h-8 w-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">No subscriptions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subscribed At
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.email}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceBadgeColor(subscription.source)}`}
                          >
                            {subscription.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {subscription.ip || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(subscription.subscribedAt)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDelete(subscription.id)}
                            disabled={deletingId === subscription.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            <HiTrash className="h-4 w-4" />
                            {deletingId === subscription.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-md">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
