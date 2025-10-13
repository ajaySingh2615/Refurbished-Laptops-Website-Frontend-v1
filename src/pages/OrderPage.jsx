import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService, downloadInvoice } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.request(`/api/orders/${id}`);
        if (res?.success && res.data) {
          setOrder(res.data);
        } else {
          setError('Order not found');
        }
      } catch (e) {
        setError(e.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="max-w-6xl mx-auto p-6 text-red-600">{error}</div>;
  if (!order) return <div className="max-w-6xl mx-auto p-6">Order not found</div>;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'processing':
        return 'text-purple-600 bg-purple-50 border border-purple-200';
      case 'shipped':
        return 'text-indigo-600 bg-indigo-50 border border-indigo-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border border-green-200';
      case 'pending':
      case 'unpaid':
        return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
      case 'cancelled':
      case 'failed':
        return 'text-red-600 bg-red-50 border border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      await downloadInvoice(id);
    } catch (err) {
      alert('Failed to download invoice: ' + err.message);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-sm text-gray-600 mt-1">
                Order ID:{' '}
                <span className="font-semibold">{order.orderNumber || `#${order.id}`}</span>
              </p>
            </div>
            <div className="text-right">
              <div
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status || order.orderStatus)}`}
              >
                {(order.status || order.orderStatus || 'Unknown').toUpperCase()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Placed on {formatDate(order.placedAt || order.createdAt)}
              </p>
            </div>
          </div>

          {/* Order Progress */}
          <div className="flex items-center justify-between mt-6 relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
            <div
              className={`absolute top-5 left-0 h-1 ${order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-200'} -z-10`}
              style={{
                width:
                  order.status === 'confirmed' ||
                  order.status === 'processing' ||
                  order.status === 'shipped' ||
                  order.status === 'delivered'
                    ? '100%'
                    : '33%',
              }}
            ></div>

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
              >
                ✓
              </div>
              <span className="text-xs mt-2 font-medium">Order Placed</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${order.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
              >
                ✓
              </div>
              <span className="text-xs mt-2 font-medium">Payment Confirmed</span>
            </div>

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}
              >
                ✓
              </div>
              <span className="text-xs mt-2 font-medium">Order Confirmed</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">
                📦
              </div>
              <span className="text-xs mt-2 font-medium">Shipped</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">
                ✓
              </div>
              <span className="text-xs mt-2 font-medium">Delivered</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Delivery Address
                </h2>
                <div className="text-sm space-y-1 text-gray-700">
                  <div className="font-semibold text-gray-900">{order.shippingAddress.name}</div>
                  <div>{order.shippingAddress.line1}</div>
                  {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postcode}
                  </div>
                  {order.shippingAddress.country && order.shippingAddress.country !== 'IN' && (
                    <div>{order.shippingAddress.country}</div>
                  )}
                  <div className="pt-2">
                    <span className="font-medium">Phone: </span>
                    {order.shippingAddress.phone}
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">
                Order Items ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title || `Product #${item.productId}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
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
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.title || `Product #${item.productId}`}
                      </h3>
                      {item.sku && <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.unitPrice)}
                        </span>
                        {item.unitMrp && parseFloat(item.unitMrp) > parseFloat(item.unitPrice) && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(item.unitMrp)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatPrice(item.lineTotal)}
                      </div>
                      {item.lineTax > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          (incl. {formatPrice(item.lineTax)} tax)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Updates Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Updates</h2>
              <div className="space-y-3">
                {order.placedAt && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Order Placed</p>
                      <p className="text-xs text-gray-500">{formatDate(order.placedAt)}</p>
                    </div>
                  </div>
                )}
                {order.paymentStatus === 'paid' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                      <p className="text-xs text-gray-500">
                        via {order.paymentMethod?.toUpperCase() || 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
                {(order.status === 'confirmed' ||
                  order.status === 'processing' ||
                  order.status === 'shipped' ||
                  order.status === 'delivered') && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Order {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.status === 'confirmed' && 'Your order is being processed'}
                        {order.status === 'processing' && 'Your order is being prepared'}
                        {order.status === 'shipped' && 'Your order is on the way'}
                        {order.status === 'delivered' && 'Your order has been delivered'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className="space-y-4">
            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span
                    className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}
                  >
                    {order.paymentStatus || 'N/A'}
                  </span>
                </div>
                {order.transactionId && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 block mb-1">Transaction ID</span>
                    <span className="font-mono text-xs text-gray-900 break-all">
                      {order.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Price Details</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Price ({order.items?.length || 0} items)</span>
                  <span className="text-gray-900">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span className="text-gray-900">{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                {order.shippingAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="text-gray-900">{formatPrice(order.shippingAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t font-semibold text-base">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-gray-900">{formatPrice(order.totalAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-3 mt-3">
                    <p className="text-xs text-green-800 font-medium">
                      You saved {formatPrice(order.discountAmount)} on this order!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Contact our support team for any queries regarding your order.
              </p>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium">
                Contact Support
              </button>
            </div>

            {/* Actions */}
            {(order.status === 'confirmed' ||
              order.status === 'processing' ||
              order.status === 'shipped' ||
              order.status === 'delivered') && (
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
              </button>
            )}
            <Link
              to="/"
              className="block w-full px-4 py-2 bg-white border border-gray-300 text-center rounded hover:bg-gray-50 transition text-sm font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
