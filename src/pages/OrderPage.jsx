import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService, downloadInvoice } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  HiCheck,
  HiCreditCard,
  HiLocationMarker,
  HiShoppingBag,
  HiHome,
  HiDownload,
  HiSupport,
  HiClock,
  HiTruck,
  HiCheckCircle,
} from 'react-icons/hi';

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
  if (error)
    return (
      <div className="min-h-screen py-8" style={{ backgroundColor: '#f8f6f3' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div className="min-h-screen py-8" style={{ backgroundColor: '#f8f6f3' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative group mb-6"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Order Details
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Order ID:{' '}
                  <span className="font-semibold text-gray-800">
                    {order.orderNumber || `#${order.id}`}
                  </span>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mt-6 relative"
            >
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10 rounded-full"></div>
              <div
                className={`absolute top-5 left-0 h-1 rounded-full transition-all duration-1000 ${order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'} -z-10`}
                style={{
                  width:
                    order.status === 'delivered'
                      ? '100%'
                      : order.status === 'shipped'
                        ? '80%'
                        : order.status === 'confirmed' || order.status === 'processing'
                          ? '60%'
                          : '33%',
                }}
              ></div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${order.status ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                >
                  <HiCheck className="w-5 h-5" />
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700">Order Placed</span>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${order.paymentStatus === 'paid' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                >
                  <HiCreditCard className="w-5 h-5" />
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700">Payment Confirmed</span>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                >
                  <HiCheckCircle className="w-5 h-5" />
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700">Order Confirmed</span>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${order.status === 'shipped' || order.status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                >
                  <HiTruck className="w-5 h-5" />
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700">Shipped</span>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${order.status === 'delivered' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gray-300 text-gray-600'}`}
                >
                  <HiCheck className="w-5 h-5" />
                </div>
                <span className="text-xs mt-2 font-medium text-gray-700">Delivered</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Delivery Address */}
            {order.shippingAddress && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                      <HiLocationMarker className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Delivery Address</h2>
                      <p className="text-xs text-gray-600">Shipping information</p>
                    </div>
                  </div>
                  <div className="text-sm space-y-2 text-gray-700">
                    <div className="font-semibold text-gray-900 text-base">
                      {order.shippingAddress.name}
                    </div>
                    <div>{order.shippingAddress.line1}</div>
                    {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                    <div>
                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.postcode}
                    </div>
                    {order.shippingAddress.country && order.shippingAddress.country !== 'IN' && (
                      <div>{order.shippingAddress.country}</div>
                    )}
                    <div className="pt-2 flex items-center gap-2">
                      <span className="font-medium">Phone:</span>
                      <span>{order.shippingAddress.phone}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <HiShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Order Items ({order.items?.length || 0})
                    </h2>
                    <p className="text-xs text-gray-600">Products in your order</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {order.items?.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title || `Product #${item.productId}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <HiShoppingBag className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">
                          {item.title || `Product #${item.productId}`}
                        </h3>
                        {item.sku && <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>}
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.unitPrice)}
                          </span>
                          {item.unitMrp &&
                            parseFloat(item.unitMrp) > parseFloat(item.unitPrice) && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(item.unitMrp)}
                              </span>
                            )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-lg">
                          {formatPrice(item.lineTotal)}
                        </div>
                        {item.lineTax > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            (incl. {formatPrice(item.lineTax)} tax)
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Updates Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                    <HiClock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Order Updates</h2>
                    <p className="text-xs text-gray-600">Timeline and status</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {order.placedAt && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1 shadow-sm"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Order Placed</p>
                        <p className="text-xs text-gray-500">{formatDate(order.placedAt)}</p>
                      </div>
                    </motion.div>
                  )}
                  {order.paymentStatus === 'paid' && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1 shadow-sm"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Payment Confirmed</p>
                        <p className="text-xs text-gray-500">
                          via {order.paymentMethod?.toUpperCase() || 'N/A'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                  {(order.status === 'confirmed' ||
                    order.status === 'processing' ||
                    order.status === 'shipped' ||
                    order.status === 'delivered') && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-1 shadow-sm"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Order {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.status === 'confirmed' && 'Your order is being processed'}
                          {order.status === 'processing' && 'Your order is being prepared'}
                          {order.status === 'shipped' && 'Your order is on the way'}
                          {order.status === 'delivered' && 'Your order has been delivered'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className="space-y-4">
            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
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
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-semibold capitalize text-gray-800">
                      {order.paymentMethod || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Payment Status</span>
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
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-gray-600 block mb-2 text-xs">Transaction ID</span>
                      <span className="font-mono text-xs text-gray-900 break-all bg-gray-100 px-2 py-1 rounded">
                        {order.transactionId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Price Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Price Details</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Price ({order.items?.length || 0} items)</span>
                    <span className="font-semibold text-gray-800">
                      {formatPrice(order.subtotal)}
                    </span>
                  </div>
                  {order.discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex justify-between items-center py-1"
                    >
                      <span className="text-green-600 font-medium">Discount</span>
                      <span className="font-semibold text-green-600">
                        -{formatPrice(order.discountAmount)}
                      </span>
                    </motion.div>
                  )}
                  {order.taxAmount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Tax (GST)</span>
                      <span className="font-semibold text-gray-800">
                        {formatPrice(order.taxAmount)}
                      </span>
                    </div>
                  )}
                  {order.shippingAmount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Delivery Charges</span>
                      <span className="font-semibold text-gray-800">
                        {formatPrice(order.shippingAmount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total Amount</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                  {order.discountAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3"
                    >
                      <p className="text-xs text-green-800 font-medium">
                        You saved {formatPrice(order.discountAmount)} on this order!
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Need Help */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <HiSupport className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">Need Help?</h3>
                    <p className="text-xs text-gray-600">We're here to assist you</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  Contact our support team for any queries regarding your order.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-semibold"
                >
                  Contact Support
                </motion.button>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              className="space-y-3"
            >
              {(order.status === 'confirmed' ||
                order.status === 'processing' ||
                order.status === 'shipped' ||
                order.status === 'delivered') && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownloadInvoice}
                  disabled={downloadingInvoice}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <HiDownload className="w-4 h-4" />
                  {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                </motion.button>
              )}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/"
                  className="block w-full px-4 py-3 bg-white border-2 border-gray-300 text-center rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <HiHome className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
