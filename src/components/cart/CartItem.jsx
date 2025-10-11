import React from 'react';
import { useCart } from '../../contexts/CartContext.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { Minus, Plus, Trash2, Image } from 'lucide-react';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart, loading } = useCart();
  const [quantity, setQuantity] = React.useState(item.quantity);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    setQuantity(newQuantity);

    try {
      await updateCartItem(item.id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setQuantity(item.quantity); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Remove this item from cart?')) {
      await removeFromCart(item.id);
    }
  };

  const incrementQuantity = () => {
    handleQuantityChange(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      {/* Top Row: Image, Product Info, Remove Button */}
      <div className="flex items-start space-x-3">
        {/* Product Image */}
        <div className="flex-shrink-0">
          {item.image ? (
            <img
              src={item.image}
              alt={item.imageAlt || item.productTitle}
              className="w-16 h-16 object-cover rounded-md"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
              <Image className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{item.productTitle}</h3>

          {item.productBrand && <p className="text-sm text-gray-500">{item.productBrand}</p>}

          {item.productCondition && (
            <p className="text-xs text-gray-400">Condition: {item.productCondition}</p>
          )}

          {/* Selected Attributes */}
          {item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0 && (
            <div className="mt-1">
              {Object.entries(item.selectedAttributes).map(([key, value]) => (
                <span key={key} className="inline-block text-xs text-gray-500 mr-2">
                  {key}: {value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Middle Row: Pricing */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">{formatPrice(item.unitPrice)}</span>
          {item.unitMrp && item.unitMrp > item.unitPrice && (
            <span className="text-xs text-gray-500 line-through">{formatPrice(item.unitMrp)}</span>
          )}
          {item.unitDiscountPercent > 0 && (
            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
              {item.unitDiscountPercent}% off
            </span>
          )}
        </div>
      </div>

      {/* Bottom Row: Quantity Controls and Total */}
      <div className="flex items-center justify-between">
        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={decrementQuantity}
            disabled={isUpdating || quantity <= 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-8 text-center text-sm font-medium">
            {isUpdating ? '...' : quantity}
          </span>

          <button
            onClick={incrementQuantity}
            disabled={isUpdating}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Line Total */}
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{formatPrice(item.lineTotal)}</div>
          {item.lineTax > 0 && (
            <div className="text-xs text-gray-500">(incl. {formatPrice(item.lineTax)} tax)</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
