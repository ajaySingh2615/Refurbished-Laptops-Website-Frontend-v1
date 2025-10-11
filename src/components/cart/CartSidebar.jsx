import React from 'react';
import { useCart } from '../../contexts/CartContext.jsx';
import CartItem from './CartItem.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { X, ShoppingCart, Loader2 } from 'lucide-react';

const CartSidebar = () => {
  const { cart, loading, error, isOpen, toggleCart, clearCart, applyCoupon } = useCart();

  const [couponCode, setCouponCode] = React.useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode('');
    } catch (error) {
      console.error('Error applying coupon:', error);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] sm:max-w-[420px] bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
            <p className="text-sm text-gray-600 mt-1">
              {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <button
            onClick={toggleCart}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!loading && cart.items.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some items to get started</p>
              <button
                onClick={toggleCart}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Continue Shopping
              </button>
            </div>
          )}

          {!loading && cart.items.length > 0 && (
            <div className="p-4 space-y-3">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && cart.items.length > 0 && (
          <div className="border-t bg-gradient-to-r from-gray-50 to-blue-50 p-6 space-y-4">
            {/* Coupon Code */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={isApplyingCoupon}
              />
              <button
                type="submit"
                disabled={isApplyingCoupon || !couponCode.trim()}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                {isApplyingCoupon ? 'Applying...' : 'Apply'}
              </button>
            </form>

            {/* Cart Summary */}
            <div className="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatPrice(cart.subtotal || 0)}</span>
              </div>
              {(cart.taxAmount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold">{formatPrice(cart.taxAmount || 0)}</span>
                </div>
              )}
              {(cart.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-{formatPrice(cart.discountAmount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl border-t border-gray-200 pt-3">
                <span className="text-gray-900">Total:</span>
                <span className="text-blue-600">{formatPrice(cart.totalAmount || 0)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Navigate to checkout
                  window.location.href = '/checkout';
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={handleClearCart}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold border border-gray-300"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
