import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { apiService } from '../../services/api';
import {
  Tag,
  Check,
  X,
  Loader2,
  Gift,
  Percent,
  DollarSign,
  Truck,
  AlertCircle,
  Info,
} from 'lucide-react';

const CouponSection = ({ cart, onApplyCoupon, onRemoveCoupon, loading }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    if (isApplying) {
      console.log('CouponSection - Already applying, ignoring duplicate call');
      return;
    }

    setIsApplying(true);
    setError('');
    setSuccess('');

    try {
      const data = await apiService.request(`/api/coupons/apply/${cart.id}`, {
        method: 'POST',
        body: JSON.stringify({ code: couponCode.trim().toUpperCase() }),
      });

      if (data.success) {
        setSuccess(`Coupon "${couponCode}" applied successfully!`);
        setCouponCode('');
        onApplyCoupon(couponCode.trim().toUpperCase());
      } else {
        setError(data.message || 'Failed to apply coupon');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setError(error.message || 'Failed to apply coupon. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = async (couponId) => {
    try {
      const data = await apiService.request(`/api/coupons/remove/${cart.id}/${couponId}`, {
        method: 'DELETE',
      });

      if (data.success) {
        onRemoveCoupon(couponId);
      } else {
        setError(data.message || 'Failed to remove coupon');
      }
    } catch (error) {
      console.error('Error removing coupon:', error);
      setError(error.message || 'Failed to remove coupon. Please try again.');
    }
  };

  const getCouponIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case 'fixed_amount':
        return <DollarSign className="w-4 h-4" />;
      case 'free_shipping':
        return <Truck className="w-4 h-4" />;
      case 'buy_x_get_y':
        return <Gift className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getCouponDescription = (coupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% off`;
      case 'fixed_amount':
        return `${formatPrice(coupon.value)} off`;
      case 'free_shipping':
        return 'Free shipping';
      case 'buy_x_get_y':
        return 'Buy X Get Y';
      default:
        return 'Discount applied';
    }
  };

  return (
    <div className="space-y-4">
      {/* Applied Coupons */}
      {cart.appliedCoupons && cart.appliedCoupons.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            <Tag className="w-4 h-4 mr-2 text-green-600" />
            Applied Coupons
          </h3>

          {cart.appliedCoupons.map((coupon) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">{getCouponIcon(coupon.type)}</div>
                <div>
                  <div className="text-sm font-semibold text-green-800">{coupon.couponCode}</div>
                  <div className="text-xs text-green-600">{getCouponDescription(coupon)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-green-800">
                  -{formatPrice(coupon.discountAmount)}
                </span>
                <button
                  onClick={() => handleRemoveCoupon(coupon.couponId)}
                  className="p-1 text-green-600 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Coupon Input */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          Have a coupon code?
        </h3>

        <form onSubmit={handleApplyCoupon} className="space-y-3">
          <div className="flex space-x-2">
            <Input
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setError('');
                setSuccess('');
              }}
              placeholder="Enter coupon code"
              className="flex-1"
              disabled={isApplying}
            />
            <Button
              type="submit"
              disabled={isApplying || !couponCode.trim()}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50"
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <Check className="w-4 h-4" />
              <span>{success}</span>
            </motion.div>
          )}
        </form>

        {/* Help Text */}
        <div className="mt-3 flex items-start space-x-2 text-xs text-gray-500">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>Enter your coupon code above and click apply to get your discount.</span>
        </div>
      </div>

      {/* Available Coupons (if any) */}
      {cart.availableCoupons && cart.availableCoupons.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            <Gift className="w-4 h-4 mr-2 text-blue-600" />
            Available Coupons
          </h3>

          <div className="space-y-2">
            {cart.availableCoupons.map((coupon) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                onClick={() => {
                  setCouponCode(coupon.code);
                  handleApplyCoupon({ preventDefault: () => {} });
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">{getCouponIcon(coupon.type)}</div>
                    <div>
                      <div className="text-sm font-semibold text-blue-800">{coupon.code}</div>
                      <div className="text-xs text-blue-600">{coupon.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-blue-800">
                      {getCouponDescription(coupon)}
                    </div>
                    {coupon.minOrderAmount > 0 && (
                      <div className="text-xs text-blue-600">
                        Min: {formatPrice(coupon.minOrderAmount)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponSection;
