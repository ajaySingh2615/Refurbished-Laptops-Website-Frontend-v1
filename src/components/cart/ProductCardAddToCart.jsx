import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext.jsx';
import { Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';

const ProductCardAddToCart = ({ productId, className = '', size = 'sm' }) => {
  const {
    addToCart,
    isInCart,
    getItemQuantity,
    getCartItemId,
    updateCartItem,
    removeFromCart,
    loading,
  } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isProductInCart = isInCart(productId);
  const currentQuantity = getItemQuantity(productId);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(productId, null, 1, null);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleIncrement = async () => {
    setIsUpdating(true);
    try {
      const cartItemId = getCartItemId(productId);
      if (cartItemId) {
        await updateCartItem(cartItemId, currentQuantity + 1);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecrement = async () => {
    if (currentQuantity <= 1) return;

    setIsUpdating(true);
    try {
      const cartItemId = getCartItemId(productId);
      if (cartItemId) {
        if (currentQuantity === 1) {
          await removeFromCart(cartItemId);
        } else {
          await updateCartItem(cartItemId, currentQuantity - 1);
        }
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // If product is not in cart, show add to cart button
  if (!isProductInCart) {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isAdding || loading}
        className={`
          ${sizeClasses[size]}
          bg-blue-600 hover:bg-blue-700 text-white
          ${isAdding || loading ? 'opacity-50 cursor-not-allowed' : ''}
          font-medium rounded-md transition-colors duration-200 flex items-center justify-center space-x-2
          ${className}
        `}
      >
        {isAdding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    );
  }

  // If product is in cart, show quantity controls
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <button
        onClick={handleDecrement}
        disabled={isUpdating || currentQuantity <= 1}
        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className="w-8 text-center text-sm font-medium">
        {isUpdating ? '...' : currentQuantity}
      </span>

      <button
        onClick={handleIncrement}
        disabled={isUpdating}
        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ProductCardAddToCart;
