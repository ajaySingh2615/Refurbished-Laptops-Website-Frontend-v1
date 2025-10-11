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
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Shopping Cart ({cart.itemCount} items)
          </h2>
          <button
            onClick={toggleCart}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Add some items to get started</p>
              <button
                onClick={toggleCart}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
          <div className="border-t bg-gray-50 p-4 space-y-4">
            {/* Coupon Code */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isApplyingCoupon}
              />
              <button
                type="submit"
                disabled={isApplyingCoupon || !couponCode.trim()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isApplyingCoupon ? 'Applying...' : 'Apply'}
              </button>
            </form>

            {/* Cart Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPrice(cart.subtotal || 0)}</span>
              </div>
              {(cart.taxAmount || 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatPrice(cart.taxAmount || 0)}</span>
                </div>
              )}
              {(cart.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-{formatPrice(cart.discountAmount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>{formatPrice(cart.totalAmount || 0)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  // Navigate to checkout
                  window.location.href = '/checkout';
                }}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={handleClearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-sm"
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
