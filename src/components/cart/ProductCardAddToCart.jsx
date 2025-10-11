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
    lg: 'px-6 py-3 text-lg font-bold',
  };

  // If product is not in cart, show add to cart button
  if (!isProductInCart) {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isAdding || loading}
        className={`
          ${sizeClasses[size]}
          bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
          text-white rounded-xl shadow-lg hover:shadow-xl
          ${isAdding || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          transition-all duration-300 flex items-center justify-center space-x-2
          border border-blue-500/20 w-full
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
  const controlSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-lg font-bold',
  };

  return (
    <div
      className={`flex items-center justify-center space-x-2 bg-white rounded-lg border border-gray-200 shadow-sm p-1 ${className}`}
    >
      <button
        onClick={handleDecrement}
        disabled={isUpdating || currentQuantity <= 1}
        className={`
          ${controlSizeClasses[size]} 
          flex items-center justify-center 
          bg-gray-100 hover:bg-red-50 
          border border-gray-200 hover:border-red-300
          rounded-md hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          transition-all duration-200
          ${currentQuantity <= 1 ? 'text-gray-400' : 'text-gray-700 hover:text-red-600'}
        `}
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="bg-gray-50 rounded-md px-4 py-2 min-w-[3rem]">
        <span className={`text-center font-bold ${textSizeClasses[size]} text-gray-800`}>
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : currentQuantity}
        </span>
      </div>

      <button
        onClick={handleIncrement}
        disabled={isUpdating}
        className={`
          ${controlSizeClasses[size]} 
          flex items-center justify-center 
          bg-gray-100 hover:bg-green-50 
          border border-gray-200 hover:border-green-300
          rounded-md hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          transition-all duration-200
          text-gray-700 hover:text-green-600
        `}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ProductCardAddToCart;
