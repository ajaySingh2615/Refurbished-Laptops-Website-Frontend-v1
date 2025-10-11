import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext.jsx';
import { Minus, Plus, ShoppingCart, Check, Loader2 } from 'lucide-react';

const AddToCartButton = ({
  productId,
  productVariantId = null,
  selectedAttributes = null,
  className = '',
  size = 'md',
  showQuantity = false,
  maxQuantity = 10,
}) => {
  const { addToCart, isInCart, getItemQuantity, loading } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const isProductInCart = isInCart(productId, productVariantId);
  const currentQuantity = getItemQuantity(productId, productVariantId);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(productId, productVariantId, quantity, selectedAttributes);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const buttonClasses = `
    ${sizeClasses[size]}
    ${
      isProductInCart
        ? 'bg-green-600 hover:bg-green-700 text-white'
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    }
    ${isAdding || loading ? 'opacity-50 cursor-not-allowed' : ''}
    font-medium rounded-md transition-colors duration-200 flex items-center justify-center space-x-2
    ${className}
  `;

  return (
    <div className="space-y-3">
      {/* Quantity Selector */}
      {showQuantity && (
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Quantity:</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="w-16 text-center border border-gray-300 rounded-md py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <button onClick={handleAddToCart} disabled={isAdding || loading} className={buttonClasses}>
        {isAdding ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Adding...</span>
          </>
        ) : isProductInCart ? (
          <>
            <Check className="w-4 h-4" />
            <span>In Cart ({currentQuantity})</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </>
        )}
      </button>

      {/* Status Messages */}
      {isProductInCart && (
        <p className="text-sm text-green-600 flex items-center">
          <Check className="w-4 h-4 mr-1" />
          This item is in your cart
        </p>
      )}
    </div>
  );
};

export default AddToCartButton;
