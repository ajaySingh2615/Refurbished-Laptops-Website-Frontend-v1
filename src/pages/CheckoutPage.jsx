import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiService } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';
import {
  HiCheck,
  HiUser,
  HiLocationMarker,
  HiShoppingBag,
  HiCreditCard,
  HiPlus,
  HiMinus,
  HiTrash,
  HiPencil,
  HiX,
} from 'react-icons/hi';

export default function CheckoutPage() {
  const { cart, updateCartItem, removeFromCart } = useCart();
  const { user, loading: authLoading, accessToken, refresh } = useAuth();
  const [step, setStep] = useState(1); // 1: Login, 2: Address, 3: Summary
  const [billing, setBilling] = useState({
    name: '',
    phone: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN',
  });
  const [shipping, setShipping] = useState({
    name: '',
    phone: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postcode: '',
    country: 'IN',
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState('');
  const [editingAddressIdx, setEditingAddressIdx] = useState(null);
  const [editedAddress, setEditedAddress] = useState(null);

  const canProceedAddress = useMemo(() => {
    const hasSelected = selectedAddressIdx !== null && addresses[selectedAddressIdx];
    const hasInlineAddress =
      shipping.name?.trim() &&
      shipping.phone?.trim() &&
      shipping.line1?.trim() &&
      shipping.city?.trim() &&
      shipping.state?.trim() &&
      shipping.postcode?.trim();
    return !!user && (hasSelected || (!!addingAddress && !!hasInlineAddress));
  }, [user, selectedAddressIdx, addresses, shipping, addingAddress]);
  const selectedAddress = useMemo(
    () => (selectedAddressIdx != null ? addresses[selectedAddressIdx] : null),
    [addresses, selectedAddressIdx],
  );

  const fetchAddresses = React.useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return { success: false };
    const res = await apiService.listAddresses(token);
    if (res?.success && Array.isArray(res.data)) {
      setAddresses(res.data);
      if (res.data.length > 0) setSelectedAddressIdx(0);
    }
    return res;
  }, []);

  // Load addresses from API when user is logged in
  React.useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const res = await fetchAddresses();
        // Auto-open Delivery Address section on load
        setStep(2);
        if (res?.success && Array.isArray(res.data) && res.data.length === 0) {
          setAddingAddress(true);
        }
      } catch {}
    })();
  }, [user, fetchAddresses]);

  const handleInitAndPay = async (useRazorpay = true) => {
    try {
      setSubmitting(true);
      setError('');
      const init = await apiService.request('/api/checkout/init', {
        method: 'POST',
        body: JSON.stringify({
          cartId: cart.id,
          billingAddress: billing,
          shippingAddress: selectedAddress || shipping,
          shippingMethod,
        }),
      });
      if (!init.success) throw new Error(init.message || 'Init failed');
      setOrderId(init.data.orderId);

      const pay = await apiService.request('/api/checkout/pay', {
        method: 'POST',
        body: JSON.stringify({
          orderId: init.data.orderId,
          paymentMethod: useRazorpay ? 'razorpay' : 'cod',
        }),
      });
      if (!pay.success) throw new Error(pay.message || 'Payment failed');

      if (pay.data.provider === 'razorpay') {
        // Load Razorpay script if not loaded
        if (!window.Razorpay) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://checkout.razorpay.com/v1/checkout.js';
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
          });
        }

        const options = {
          key: pay.data.keyId,
          order_id: pay.data.order.id,
          amount: pay.data.amount,
          currency: pay.data.currency,
          name: 'Checkout',
          handler: async function (response) {
            // Confirm payment on backend
            await apiService.request('/api/checkout/confirm', {
              method: 'POST',
              body: JSON.stringify({ orderId: init.data.orderId, providerPayload: response }),
            });
            window.location.href = `/order-confirmation/${init.data.orderId}`;
          },
          modal: {
            ondismiss: async function () {
              // If user closes, keep order pending
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        return;
      } else {
        window.location.href = `/order-confirmation/${init.data.orderId}`;
      }
    } catch (e) {
      setError(e.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: '#f8f6f3' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Secure Checkout
          </h1>
          <p className="text-gray-600">Complete your purchase in just a few steps</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Login */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ${
                        step > 1 || user
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}
                    >
                      {step > 1 || user ? (
                        <HiCheck className="w-5 h-5" />
                      ) : (
                        <HiUser className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Account</h3>
                      <p className="text-sm text-gray-600">
                        {user ? 'Signed in successfully' : 'Please sign in to continue'}
                      </p>
                    </div>
                  </div>
                  {!user && (
                    <a
                      href="/login"
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-medium"
                    >
                      Sign In
                    </a>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {user ? (
                    <motion.div
                      key="logged-in"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <HiCheck className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">{user.name || user.email}</p>
                        <p className="text-sm text-green-600">Ready to proceed</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="not-logged-in"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <p className="text-blue-800">Please sign in to continue with your purchase</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Step 2: Delivery Address */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ${
                        step > 2
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}
                    >
                      {step > 2 ? (
                        <HiCheck className="w-5 h-5" />
                      ) : (
                        <HiLocationMarker className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Delivery Address</h3>
                      <p className="text-sm text-gray-600">Where should we deliver your order?</p>
                    </div>
                  </div>
                  {step !== 2 && (
                    <button
                      type="button"
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 text-sm font-medium"
                      onClick={() => {
                        setStep(2);
                        setAddingAddress(false);
                      }}
                    >
                      Change
                    </button>
                  )}
                </div>

                {step === 2 ? (
                  <div className="mt-4 space-y-3">
                    {addressMsg && (
                      <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">
                        {addressMsg}
                      </div>
                    )}
                    {addresses.length > 0 ? (
                      <div className="space-y-3">
                        {addresses.map((addr, idx) => (
                          <motion.div
                            key={addr.id || idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative border-2 rounded-xl p-4 transition-all duration-200 ${
                              selectedAddressIdx === idx
                                ? 'border-blue-500 bg-blue-50 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                            }`}
                          >
                            <label className="flex items-start cursor-pointer">
                              <input
                                type="radio"
                                className="mr-2 mt-1"
                                checked={selectedAddressIdx === idx}
                                onChange={() => setSelectedAddressIdx(idx)}
                              />
                              <div className="flex-1 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{addr.name}</span>
                                  {addr.isDefault ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                      Default
                                    </span>
                                  ) : null}
                                </div>
                                <div>
                                  {addr.line1}
                                  {addr.line2 ? `, ${addr.line2}` : ''}
                                </div>
                                <div>
                                  {addr.city}, {addr.state} {addr.postcode}
                                </div>
                                <div>{addr.country}</div>
                              </div>
                            </label>

                            {/* Actions */}
                            <div className="mt-2 flex items-center gap-3 text-xs">
                              {!addr.isDefault && (
                                <button
                                  className="text-blue-600"
                                  onClick={async () => {
                                    try {
                                      const token = localStorage.getItem('accessToken');
                                      const prevDefaultIdx = addresses.findIndex(
                                        (a) => a.isDefault,
                                      );
                                      if (prevDefaultIdx !== -1) {
                                        const prev = addresses[prevDefaultIdx];
                                        await apiService.updateAddress(
                                          prev.id,
                                          { ...prev, isDefault: false },
                                          token,
                                        );
                                      }
                                      await apiService.updateAddress(
                                        addr.id,
                                        { ...addr, isDefault: true },
                                        token,
                                      );
                                      setAddresses((prev) =>
                                        prev.map((a, i) =>
                                          i === idx
                                            ? { ...a, isDefault: true }
                                            : { ...a, isDefault: false },
                                        ),
                                      );
                                    } catch {}
                                  }}
                                >
                                  Make default
                                </button>
                              )}
                              <button
                                className="text-gray-700"
                                onClick={() => {
                                  setEditingAddressIdx(idx);
                                  setEditedAddress({ ...addr });
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="text-red-600"
                                onClick={async () => {
                                  if (!addr.id) return;
                                  if (!window.confirm('Delete this address?')) return;
                                  try {
                                    const token = localStorage.getItem('accessToken');
                                    await apiService.deleteAddress(addr.id, token);
                                    setAddresses((prev) => prev.filter((_, i) => i !== idx));
                                    if (selectedAddressIdx === idx) setSelectedAddressIdx(null);
                                  } catch {}
                                }}
                              >
                                Delete
                              </button>
                            </div>

                            {editingAddressIdx === idx && editedAddress && (
                              <div className="mt-3 grid grid-cols-2 gap-2 border rounded p-3 bg-white">
                                <input
                                  className="border p-2 w-full col-span-2"
                                  placeholder="Name"
                                  value={editedAddress.name || ''}
                                  onChange={(e) =>
                                    setEditedAddress({ ...editedAddress, name: e.target.value })
                                  }
                                />
                                <input
                                  className="border p-2 w-full"
                                  placeholder="Phone"
                                  value={editedAddress.phone || ''}
                                  onChange={(e) =>
                                    setEditedAddress({ ...editedAddress, phone: e.target.value })
                                  }
                                />
                                <input
                                  className="border p-2 w-full"
                                  placeholder="Email"
                                  value={editedAddress.email || ''}
                                  onChange={(e) =>
                                    setEditedAddress({ ...editedAddress, email: e.target.value })
                                  }
                                />
                                <input
                                  className="border p-2 w-full col-span-2"
                                  placeholder="Address line 1"
                                  value={editedAddress.line1 || ''}
                                  onChange={(e) =>
                                    setEditedAddress({ ...editedAddress, line1: e.target.value })
                                  }
                                />
                                <input
                                  className="border p-2 w-full col-span-2"
                                  placeholder="Address line 2"
                                  value={editedAddress.line2 || ''}
                                  onChange={(e) =>
                                    setEditedAddress({ ...editedAddress, line2: e.target.value })
                                  }
                                />
                                <input
                                  className="border p-2 w-full"
                                  placeholder="City"
                                  value={editedAddress.city || ''}
                                  onChange={(e) =>
                                    setEditedAddress({ ...editedAddress, city: e.target.value })
                                  }
                                />
                                <input
                                  className="border p-2 w-full"
                                  placeholder="State"
                                  value={editedAddress.state || ''}
                                  onChange={(e) =>
                                    setEditedAddress({ ...editedAddress, state: e.target.value })
                                  }
                                />
                                <input
                                  className="border p-2 w-full"
                                  placeholder="Postcode"
                                  value={editedAddress.postcode || ''}
                                  onChange={(e) =>
                                    setEditedAddress({ ...editedAddress, postcode: e.target.value })
                                  }
                                />
                                <div className="col-span-2 flex gap-2 justify-end">
                                  <button
                                    className="px-3 py-2 border rounded"
                                    onClick={() => {
                                      setEditingAddressIdx(null);
                                      setEditedAddress(null);
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="px-3 py-2 bg-blue-600 text-white rounded"
                                    onClick={async () => {
                                      try {
                                        const token = localStorage.getItem('accessToken');
                                        await apiService.updateAddress(
                                          editedAddress.id,
                                          editedAddress,
                                          token,
                                        );
                                        setAddresses((prev) =>
                                          prev.map((a, i) =>
                                            i === idx ? { ...editedAddress } : a,
                                          ),
                                        );
                                        setEditingAddressIdx(null);
                                        setEditedAddress(null);
                                      } catch {}
                                    }}
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No saved addresses.</div>
                    )}

                    <motion.button
                      onClick={() => setAddingAddress(true)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <HiPlus className="w-4 h-4 inline mr-2" />
                      Add New Address
                    </motion.button>

                    <AnimatePresence>
                      {addingAddress && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200"
                        >
                          <h4 className="font-semibold text-gray-800 mb-4">Add New Address</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="Full Name"
                              value={shipping.name}
                              onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                            />
                            <input
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="Phone Number"
                              value={shipping.phone}
                              onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                            />
                            <input
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="Email (Optional)"
                              value={shipping.email}
                              onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                            />
                            <input
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="Address Line 1"
                              value={shipping.line1}
                              onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
                            />
                            <input
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="Address Line 2 (Optional)"
                              value={shipping.line2}
                              onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
                            />
                            <input
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="City"
                              value={shipping.city}
                              onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                            />
                            <input
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="State"
                              value={shipping.state}
                              onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                            />
                            <input
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                              placeholder="Postal Code"
                              value={shipping.postcode}
                              onChange={(e) =>
                                setShipping({ ...shipping, postcode: e.target.value })
                              }
                            />
                          </div>
                          <div className="col-span-2 flex gap-3 justify-end mt-4">
                            <motion.button
                              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                              onClick={() => setAddingAddress(false)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              type="button"
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
                              onClick={async () => {
                                try {
                                  let token = accessToken || localStorage.getItem('accessToken');
                                  if (!token) {
                                    const ok = await refresh();
                                    token = ok ? localStorage.getItem('accessToken') : '';
                                  }
                                  if (!token) {
                                    alert('Please login to save address');
                                    return;
                                  }
                                  const payload = {
                                    type: 'shipping',
                                    name: (shipping.name || '').trim(),
                                    phone: (shipping.phone || '').trim(),
                                    email: (shipping.email || '').trim() || undefined,
                                    line1: (shipping.line1 || '').trim(),
                                    line2: (shipping.line2 || '').trim() || undefined,
                                    city: (shipping.city || '').trim(),
                                    state: (shipping.state || '').trim(),
                                    postcode: (shipping.postcode || '').trim(),
                                    country: (shipping.country || 'IN').trim(),
                                  };
                                  const reqd = [
                                    'name',
                                    'phone',
                                    'line1',
                                    'city',
                                    'state',
                                    'postcode',
                                  ];
                                  for (const k of reqd) {
                                    if (!payload[k]) {
                                      alert(`Please fill ${k}`);
                                      return;
                                    }
                                  }
                                  const resp = await apiService.createAddress(payload, token);
                                  if (resp?.success && resp.data?.id) {
                                    const newAddr = { id: resp.data.id, ...payload };
                                    setAddresses((prev) => {
                                      const next = [...prev, newAddr];
                                      setSelectedAddressIdx(next.length - 1);
                                      return next;
                                    });
                                    setAddressMsg('Address added successfully');
                                    setAddingAddress(false);
                                    setShipping({
                                      name: '',
                                      phone: '',
                                      email: '',
                                      line1: '',
                                      line2: '',
                                      city: '',
                                      state: '',
                                      postcode: '',
                                      country: 'IN',
                                    });
                                  } else if (resp?.message) {
                                    alert(resp.message);
                                  }
                                } catch (e) {
                                  console.error('Create address failed:', e);
                                }
                              }}
                            >
                              Save Address
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-end pt-4">
                      <motion.button
                        type="button"
                        disabled={!canProceedAddress}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200 font-medium"
                        onClick={() => {
                          setAddingAddress(false);
                          setStep(3);
                        }}
                        whileHover={{ scale: canProceedAddress ? 1.02 : 1 }}
                        whileTap={{ scale: canProceedAddress ? 0.98 : 1 }}
                      >
                        Continue to Payment
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm text-gray-700">
                    {selectedAddress ? (
                      <div>
                        <div className="font-medium">
                          {selectedAddress.name}{' '}
                          {selectedAddress.isDefault ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 ml-2">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <div>
                          {selectedAddress.line1}
                          {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ''}
                        </div>
                        <div>
                          {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postcode}
                        </div>
                        {selectedAddress.country && selectedAddress.country !== 'IN' ? (
                          <div>{selectedAddress.country}</div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="text-gray-600">No address selected.</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Step 3: Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg ${
                      step === 3 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-400'
                    }`}
                  >
                    <HiShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">Order Summary</h3>
                    <p className="text-sm text-gray-600">Review your items</p>
                  </div>
                </div>

                {cart.items?.length ? (
                  <div className="space-y-4">
                    {cart.items.map((it, index) => (
                      <motion.div
                        key={it.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">
                            {it.productTitle || `#${it.productId}`}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Price: {formatPrice(it.unitPrice)}
                          </div>
                          <div className="text-sm text-green-600 mt-1">
                            Delivery: 3-5 business days
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300">
                            <motion.button
                              className="p-2 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => updateCartItem(it.id, Math.max(1, it.quantity - 1))}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <HiMinus className="w-4 h-4 text-gray-600" />
                            </motion.button>
                            <span className="w-8 text-center font-medium">{it.quantity}</span>
                            <motion.button
                              className="p-2 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => updateCartItem(it.id, it.quantity + 1)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <HiPlus className="w-4 h-4 text-gray-600" />
                            </motion.button>
                          </div>
                          <motion.button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            onClick={() => removeFromCart(it.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <HiTrash className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">Your cart is empty.</div>
                )}
              </div>
            </motion.div>

            {/* Confirmation and Payment */}
            {cart.items?.length ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <HiCreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Payment</h3>
                      <p className="text-sm text-gray-600">Complete your purchase</p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Confirmation email</span> will be sent to{' '}
                      <span className="font-semibold">{user?.email || 'your email address'}</span>
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      disabled={submitting}
                      onClick={() => handleInitAndPay(true)}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: submitting ? 1 : 1.02 }}
                      whileTap={{ scale: submitting ? 1 : 0.98 }}
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <HiCreditCard className="w-5 h-5" />
                          Pay with Razorpay
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>

          {/* Right: Price details */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="sticky top-8"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-xl">
                  <h3 className="font-bold text-xl text-gray-800 mb-6">Order Summary</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold text-gray-800">
                        {formatPrice(cart.subtotal || 0)}
                      </span>
                    </div>

                    {(cart.discountAmount || 0) > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-green-600">Discount</span>
                        <span className="font-semibold text-green-600">
                          -{formatPrice(cart.discountAmount || 0)}
                        </span>
                      </motion.div>
                    )}

                    {(cart.taxAmount || 0) > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-semibold text-gray-800">
                          {formatPrice(cart.taxAmount || 0)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(cart.totalAmount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium">Secure payment with Razorpay</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
