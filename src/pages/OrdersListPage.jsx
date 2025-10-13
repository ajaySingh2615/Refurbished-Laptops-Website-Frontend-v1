import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function OrdersListPage() {
  const { user, accessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled

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
        return 'text-green-700 bg-green-100 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'cancelled':
        return 'text-red-700 bg-red-100 border-red-200';
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
    return order.orderStatus?.toLowerCase() === filter || order.status?.toLowerCase() === filter;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">View and track all your orders</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-3 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                filter === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending (
              {orders.filter((o) => o.orderStatus === 'pending' || o.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                filter === 'confirmed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed (
              {
                orders.filter((o) => o.orderStatus === 'confirmed' || o.status === 'confirmed')
                  .length
              }
              )
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                filter === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled (
              {
                orders.filter((o) => o.orderStatus === 'cancelled' || o.status === 'cancelled')
                  .length
              }
              )
            </button>
          </div>
        </div>

        {/* Orders List */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? "You haven't placed any orders yet."
                : `You don't have any ${filter} orders.`}
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Order Placed</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(order.placedAt || order.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Total</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Order ID</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.orderNumber || `#${order.id}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.orderStatus || order.status)}`}
                    >
                      {(order.orderStatus || order.status || 'Unknown').toUpperCase()}
                    </span>
                    <Link
                      to={`/order/${order.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="px-6 py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        {order.itemCount || 0} item(s) •{' '}
                        {order.paymentMethod?.toUpperCase() || 'N/A'}
                      </p>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Order contains {order.itemCount || 0} product
                        {order.itemCount !== 1 ? 's' : ''}
                      </h3>
                      {order.shippingAddress && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Delivering to:</span>{' '}
                          {order.shippingAddress.name}, {order.shippingAddress.city}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {order.orderStatus === 'confirmed' && (
                        <div className="flex items-center gap-2 text-green-600 text-sm mb-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">Confirmed</span>
                        </div>
                      )}
                      {order.orderStatus === 'pending' && (
                        <div className="flex items-center gap-2 text-yellow-600 text-sm mb-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">Processing</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className="bg-gray-50 px-6 py-3 border-t flex items-center justify-between">
                  <div className="flex gap-3">
                    <Link
                      to={`/order/${order.id}`}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-white transition text-sm font-medium"
                    >
                      Track Order
                    </Link>
                    {order.orderStatus === 'confirmed' && (
                      <button className="px-4 py-2 border border-gray-300 rounded hover:bg-white transition text-sm font-medium">
                        Download Invoice
                      </button>
                    )}
                  </div>
                  {order.orderStatus === 'pending' && (
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
