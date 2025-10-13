import React, { useMemo, useState } from 'react';
import { useCart } from '../contexts/CartContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiService } from '../services/api.js';
import { formatPrice } from '../utils/formatters.js';

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
            window.location.href = `/order/${init.data.orderId}`;
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
        window.location.href = `/order/${init.data.orderId}`;
      }
    } catch (e) {
      setError(e.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Steps */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step 1: Login */}
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${step > 1 || user ? 'bg-green-600' : 'bg-blue-600'}`}
                >
                  1
                </div>
                <div className="font-semibold flex items-center gap-2">
                  Login
                  {user && (
                    <svg
                      className="w-4 h-4 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {!user && (
                <a href="/login" className="text-blue-600 text-sm">
                  Login
                </a>
              )}
            </div>
            <div className="mt-3 text-sm text-gray-700">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✔</span> {user.name || user.email}
                </div>
              ) : (
                <div>Please login to continue checkout.</div>
              )}
            </div>
          </div>

          {/* Step 2: Delivery Address */}
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${step > 2 ? 'bg-green-600' : 'bg-blue-600'}`}
                >
                  2
                </div>
                <div className="font-semibold flex items-center gap-2">
                  Delivery Address
                  {step > 2 && (
                    <svg
                      className="w-4 h-4 text-green-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20 6L9 17L4 12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              {step !== 2 && (
                <button
                  type="button"
                  className="text-blue-600 text-sm"
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
                  <div className="space-y-2">
                    {addresses.map((addr, idx) => (
                      <div
                        key={addr.id || idx}
                        className={`border rounded p-3 ${selectedAddressIdx === idx ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}
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
                                  const prevDefaultIdx = addresses.findIndex((a) => a.isDefault);
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
                                      prev.map((a, i) => (i === idx ? { ...editedAddress } : a)),
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No saved addresses.</div>
                )}

                <button
                  onClick={() => setAddingAddress(true)}
                  className="px-3 py-2 rounded border text-sm"
                >
                  Add new address
                </button>

                {addingAddress && (
                  <div className="grid grid-cols-2 gap-2 border rounded p-3">
                    {/* Add form inputs (unchanged) */}
                    <input
                      className="border p-2 w-full col-span-2"
                      placeholder="Name"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                    />
                    <input
                      className="border p-2 w-full"
                      placeholder="Phone"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    />
                    <input
                      className="border p-2 w-full"
                      placeholder="Email"
                      value={shipping.email}
                      onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    />
                    <input
                      className="border p-2 w-full col-span-2"
                      placeholder="Address line 1"
                      value={shipping.line1}
                      onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
                    />
                    <input
                      className="border p-2 w-full col-span-2"
                      placeholder="Address line 2"
                      value={shipping.line2}
                      onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
                    />
                    <input
                      className="border p-2 w-full"
                      placeholder="City"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    />
                    <input
                      className="border p-2 w-full"
                      placeholder="State"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    />
                    <input
                      className="border p-2 w-full"
                      placeholder="Postcode"
                      value={shipping.postcode}
                      onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
                    />
                    <div className="col-span-2 flex gap-2 justify-end">
                      <button
                        className="px-3 py-2 border rounded"
                        onClick={() => setAddingAddress(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 bg-blue-600 text-white rounded"
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
                            const reqd = ['name', 'phone', 'line1', 'city', 'state', 'postcode'];
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
                        Save
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    disabled={!canProceedAddress}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    onClick={() => {
                      setAddingAddress(false);
                      setStep(3);
                    }}
                  >
                    Continue
                  </button>
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

          {/* Step 3: Order Summary */}
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${step === 3 ? 'bg-blue-600' : 'bg-gray-400'}`}
              >
                3
              </div>
              <div className="font-semibold">Order Summary</div>
            </div>

            {cart.items?.length ? (
              <div className="space-y-3">
                {cart.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between border rounded p-3">
                    <div className="text-sm">
                      <div className="font-medium">{it.productTitle || `#${it.productId}`}</div>
                      <div className="text-gray-600">Price: {formatPrice(it.unitPrice)}</div>
                      <div className="text-gray-600">Delivery by: 3-5 days</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => updateCartItem(it.id, Math.max(1, it.quantity - 1))}
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{it.quantity}</span>
                      <button
                        className="px-2 py-1 border rounded"
                        onClick={() => updateCartItem(it.id, it.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className="ml-3 text-red-600 text-sm"
                        onClick={() => removeFromCart(it.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">Your cart is empty.</div>
            )}
          </div>

          {/* Confirmation and Payment */}
          {cart.items?.length ? (
            <div className="rounded-xl border bg-white p-4">
              <div className="text-sm text-gray-700 mb-3">
                Order confirmation email will be sent to{' '}
                {user?.email ? user.email : 'your email address'}.
              </div>
              <div className="flex justify-end">
                <button
                  disabled={submitting}
                  onClick={() => handleInitAndPay(true)}
                  className="px-5 py-3 bg-green-600 text-white rounded"
                >
                  {submitting ? 'Processing…' : 'Pay with Razorpay'}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right: Price details */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border bg-white p-4 space-y-2">
            <div className="font-semibold">Price Details</div>
            <div className="flex justify-between text-sm">
              <span>Price</span>
              <span>{formatPrice(cart.subtotal || 0)}</span>
            </div>
            {(cart.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatPrice(cart.discountAmount || 0)}</span>
              </div>
            )}
            {(cart.taxAmount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatPrice(cart.taxAmount || 0)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t pt-2">
              <span>Total Amount</span>
              <span>{formatPrice(cart.totalAmount || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
