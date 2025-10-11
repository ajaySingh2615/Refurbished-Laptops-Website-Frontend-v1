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
      className={`relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      {/* Cart Icon */}
      <ShoppingCart className="w-6 h-6" />

      {/* Item Count Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        </div>
      )}
    </button>
  );
};

export default CartIcon;
