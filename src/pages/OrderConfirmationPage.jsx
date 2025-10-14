import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  HiCheck,
  HiCreditCard,
  HiLocationMarker,
  HiShoppingBag,
  HiHome,
  HiEye,
  HiMail,
  HiClock,
} from 'react-icons/hi';

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
  if (error)
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: '#f8f6f3' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-red-600 text-xl font-semibold">{error}</div>
          </motion.div>
        </div>
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: '#f8f6f3' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-gray-600 text-xl font-semibold">Order not found</div>
          </motion.div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#f8f6f3' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative group mb-6"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                <HiCheck className="w-8 h-8 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3"
            >
              Order Confirmed!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-base mb-4 max-w-xl mx-auto"
            >
              Thank you for your order. Your order has been successfully placed and payment
              confirmed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 inline-block border border-blue-200"
            >
              <div className="text-xs text-gray-600 mb-1">Order Number</div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {order.orderNumber || `#${order.id}`}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Payment Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <HiCreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Payment Information</h2>
                  <p className="text-xs text-gray-600">Transaction details</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="font-semibold capitalize text-gray-800 text-sm">
                    {order.paymentMethod || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {order.paymentStatus || 'N/A'}
                  </span>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {order.transactionId}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-800">Total Paid:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Delivery Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                  <HiLocationMarker className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Delivery Information</h2>
                  <p className="text-xs text-gray-600">Shipping address</p>
                </div>
              </div>

              {order.shippingAddress ? (
                <div className="space-y-2">
                  <div className="font-semibold text-gray-800 text-base">
                    {order.shippingAddress.name}
                  </div>
                  <div className="text-gray-600 flex items-center gap-2 text-sm">
                    <HiMail className="w-3 h-3" />
                    {order.shippingAddress.phone}
                  </div>
                  <div className="text-gray-600 text-sm">{order.shippingAddress.line1}</div>
                  {order.shippingAddress.line2 && (
                    <div className="text-gray-600 text-sm">{order.shippingAddress.line2}</div>
                  )}
                  <div className="text-gray-600 text-sm">
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.postcode}
                  </div>
                  {order.shippingAddress.country && order.shippingAddress.country !== 'IN' && (
                    <div className="text-gray-600 text-sm">{order.shippingAddress.country}</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4 text-sm">
                  No delivery address provided
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative group mb-6"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <HiShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Order Items</h2>
                <p className="text-xs text-gray-600">Products in your order</p>
              </div>
            </div>

            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 text-base">
                      {item.title || `Product #${item.productId}`}
                    </div>
                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>Unit: {formatPrice(item.unitPrice)}</span>
                    </div>
                    {item.unitMrp && parseFloat(item.unitMrp) > parseFloat(item.unitPrice) && (
                      <div className="text-xs text-green-600 mt-1">
                        Saved {formatPrice(parseFloat(item.unitMrp) - parseFloat(item.unitPrice))}{' '}
                        per item
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {formatPrice(item.lineTotal)}
                    </div>
                    {item.unitMrp && parseFloat(item.unitMrp) > parseFloat(item.unitPrice) && (
                      <div className="text-xs text-gray-500 line-through">
                        {formatPrice(parseFloat(item.unitMrp) * item.quantity)}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Price Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="relative group mb-6"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-1">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-800 text-sm">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center py-1"
                >
                  <span className="text-green-600 font-medium text-sm">Discount:</span>
                  <span className="font-semibold text-green-600 text-sm">
                    -{formatPrice(order.discountAmount)}
                  </span>
                </motion.div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {formatPrice(order.taxAmount)}
                  </span>
                </div>
              )}
              {order.shippingAmount > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-600">Shipping:</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {formatPrice(order.shippingAmount)}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Confirmation Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="relative group mb-6"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <HiMail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-1">Confirmation Email Sent</h3>
                <p className="text-sm text-gray-600">
                  A detailed confirmation email has been sent to your registered email address with
                  order details and tracking information.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-semibold text-sm"
            >
              <HiHome className="w-4 h-4" />
              Continue Shopping
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={`/order/${order.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-sm"
            >
              <HiEye className="w-4 h-4" />
              View Order Details
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
