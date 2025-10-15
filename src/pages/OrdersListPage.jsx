import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService, downloadInvoice } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  HiShoppingBag,
  HiDownload,
  HiEye,
  HiClock,
  HiCheckCircle,
  HiTruck,
  HiXCircle,
  HiHome,
  HiFilter,
} from 'react-icons/hi';

export default function OrdersListPage() {
  const { user, accessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled
  const [downloadingInvoice, setDownloadingInvoice] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5); // Show 5 orders per page

  useEffect(() => {
    (async () => {
      try {
        const token = accessToken || localStorage.getItem('accessToken');
        if (!token) {
          setError('Please login to view orders');
          setLoading(false);
          return;
        }
        const res = await apiService.request('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res?.success && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setError('Failed to load orders');
        }
      } catch (e) {
        setError(e.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'processing':
        return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'shipped':
        return 'text-indigo-700 bg-indigo-100 border-indigo-200';
      case 'delivered':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'cancelled':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'failed':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    // Check status first (updated by admin), then orderStatus as fallback
    return order.status?.toLowerCase() === filter || order.orderStatus?.toLowerCase() === filter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleDownloadInvoice = async (orderId) => {
    try {
      setDownloadingInvoice(orderId);
      await downloadInvoice(orderId);
    } catch (err) {
      alert('Failed to download invoice: ' + err.message);
    } finally {
      setDownloadingInvoice(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#f8f6f3' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative group mb-4"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <HiShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Orders
                </h1>
                <p className="text-xs text-gray-600 mt-1">View and track all your orders</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative group mb-4"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-lg border border-white/20 p-3 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md flex items-center justify-center shadow-lg">
                <HiFilter className="w-3 h-3 text-white" />
              </div>
              <h2 className="text-sm font-bold text-gray-800">Filter Orders</h2>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({orders.length})
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('pending')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  filter === 'pending'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending (
                {orders.filter((o) => o.status === 'pending' || o.orderStatus === 'pending').length}
                )
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('confirmed')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  filter === 'confirmed'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed (
                {
                  orders.filter((o) => o.status === 'confirmed' || o.orderStatus === 'confirmed')
                    .length
                }
                )
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter('cancelled')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  filter === 'cancelled'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled (
                {
                  orders.filter((o) => o.status === 'cancelled' || o.orderStatus === 'cancelled')
                    .length
                }
                )
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative group mb-6"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                  <HiXCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {currentOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-12 shadow-xl text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <HiShoppingBag className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {filter === 'all'
                  ? "You haven't placed any orders yet."
                  : `You don't have any ${filter} orders.`}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                >
                  <HiHome className="w-5 h-5" />
                  Start Shopping
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium">
                            Order Placed
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatDate(order.placedAt || order.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium">Total</p>
                          <p className="text-sm font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-medium">Order ID</p>
                          <p className="text-sm font-bold text-gray-900">
                            {order.orderNumber || `#${order.id}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status || order.orderStatus)}`}
                        >
                          {(order.status || order.orderStatus || 'Unknown').toUpperCase()}
                        </span>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link
                            to={`/order/${order.id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-semibold"
                          >
                            <HiEye className="w-4 h-4" />
                            View Details
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {order.previewImageUrl ? (
                          <img
                            src={order.previewImageUrl}
                            alt={order.previewTitle || 'Product image'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <HiShoppingBag className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1">
                          {order.itemCount || 0} item(s) •{' '}
                          {order.paymentMethod?.toUpperCase() || 'N/A'}
                        </p>
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                          {order.previewTitle
                            ? order.previewTitle
                            : `Order contains ${order.itemCount || 0} product${
                                order.itemCount !== 1 ? 's' : ''
                              }`}
                        </h3>
                        {order.shippingAddress && (
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Delivering to:</span>{' '}
                            {order.shippingAddress.name}, {order.shippingAddress.city}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {(order.status === 'confirmed' ||
                          order.status === 'processing' ||
                          order.status === 'shipped') && (
                          <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
                            <HiCheckCircle className="w-4 h-4" />
                            <span className="font-semibold capitalize">{order.status}</span>
                          </div>
                        )}
                        {order.status === 'delivered' && (
                          <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
                            <HiTruck className="w-4 h-4" />
                            <span className="font-semibold">Delivered</span>
                          </div>
                        )}
                        {order.status === 'pending' && (
                          <div className="flex items-center gap-2 text-yellow-600 text-sm mb-2">
                            <HiClock className="w-4 h-4" />
                            <span className="font-semibold">Processing</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link
                            to={`/order/${order.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 transition-all duration-200 text-xs font-semibold"
                          >
                            <HiEye className="w-3 h-3" />
                            Track Order
                          </Link>
                        </motion.div>
                        {(order.status === 'confirmed' ||
                          order.status === 'processing' ||
                          order.status === 'shipped' ||
                          order.status === 'delivered') && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadInvoice(order.id)}
                            disabled={downloadingInvoice === order.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 transition-all duration-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <HiDownload className="w-3 h-3" />
                            {downloadingInvoice === order.id
                              ? 'Downloading...'
                              : 'Download Invoice'}
                          </motion.button>
                        )}
                      </div>
                      {order.status === 'pending' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-xs font-semibold"
                        >
                          <HiXCircle className="w-3 h-3" />
                          Cancel Order
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > ordersPerPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative group mt-6"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of{' '}
                  {filteredOrders.length} orders
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 transition-all duration-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </motion.button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <motion.button
                        key={page}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {page}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-white hover:border-gray-400 transition-all duration-200 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
