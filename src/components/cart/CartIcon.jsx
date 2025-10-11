import React from 'react';
import { useCart } from '../../contexts/CartContext.jsx';
import { ShoppingCart, Loader2 } from 'lucide-react';

const CartIcon = ({ className = '' }) => {
  const { getCartSummary, toggleCart, loading } = useCart();
  const { itemCount, totalAmount } = getCartSummary();

  return (
    <button
      onClick={toggleCart}
      disabled={loading}
      className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      {/* Cart Icon */}
      <ShoppingCart className="w-6 h-6" />

      {/* Item Count Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </button>
  );
};

export default CartIcon;
