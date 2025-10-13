import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await apiService.request(`/api/orders/${orderId}`);
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
  }, [orderId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="max-w-4xl mx-auto p-6 text-red-600">{error}</div>;
  if (!order) return <div className="max-w-4xl mx-auto p-6">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Success Header */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
        <div className="flex justify-center mb-4">
          <svg
            className="w-16 h-16 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-green-800 mb-2">Order Confirmed!</h1>
        <p className="text-green-700 text-lg mb-4">
          Thank you for your order. Your order has been successfully placed.
        </p>
        <div className="bg-white rounded-lg p-4 inline-block">
          <div className="text-sm text-gray-600">Order Number</div>
          <div className="text-2xl font-bold text-gray-900">
            {order.orderNumber || `#${order.id}`}
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Payment Info */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">{order.paymentMethod || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span
                className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}
              >
                {order.paymentStatus || 'N/A'}
              </span>
            </div>
            {order.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">{order.transactionId}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Total Paid:</span>
              <span className="font-bold text-lg">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Delivery Information</h2>
          {order.shippingAddress ? (
            <div className="text-sm space-y-1">
              <div className="font-medium">{order.shippingAddress.name}</div>
              <div className="text-gray-600">{order.shippingAddress.phone}</div>
              <div className="text-gray-600">{order.shippingAddress.line1}</div>
              {order.shippingAddress.line2 && (
                <div className="text-gray-600">{order.shippingAddress.line2}</div>
              )}
              <div className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postcode}
              </div>
              {order.shippingAddress.country && order.shippingAddress.country !== 'IN' && (
                <div className="text-gray-600">{order.shippingAddress.country}</div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">No delivery address</div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-3 last:border-b-0"
            >
              <div className="flex-1">
                <div className="font-medium">{item.title || `Product #${item.productId}`}</div>
                <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatPrice(item.lineTotal)}</div>
                {item.unitMrp && parseFloat(item.unitMrp) > parseFloat(item.unitPrice) && (
                  <div className="text-xs text-gray-500 line-through">
                    {formatPrice(item.unitMrp)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Price Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-{formatPrice(order.discountAmount)}</span>
            </div>
          )}
          {order.taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Tax:</span>
              <span>{formatPrice(order.taxAmount)}</span>
            </div>
          )}
          {order.shippingAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span>{formatPrice(order.shippingAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t font-bold text-lg">
            <span>Total:</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Confirmation Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <p className="text-blue-800 text-sm">
          📧 A confirmation email has been sent to your registered email address with order details
          and tracking information.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Continue Shopping
        </Link>
        <Link
          to={`/order/${order.id}`}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          View Order Details
        </Link>
      </div>
    </div>
  );
}
