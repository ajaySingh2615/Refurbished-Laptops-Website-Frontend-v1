import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import { formatDate } from '../../utils/formatters.js';
import { X, Plus, Trash2, Calendar, Percent, DollarSign, Truck, Gift } from 'lucide-react';

const CouponForm = ({
  isOpen,
  onClose,
  onSubmit,
  coupon = null,
  categories = [],
  products = [],
  brands = [],
}) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    usageLimitPerUser: 1,
    isActive: true,
    isPublic: true,
    validFrom: '',
    validUntil: '',
    applicableTo: 'all',
    applicableCategories: [],
    applicableProducts: [],
    applicableBrands: [],
    excludedCategories: [],
    excludedProducts: [],
    excludedBrands: [],
    stackable: false,
    autoApply: false,
    priority: 0,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        name: coupon.name || '',
        description: coupon.description || '',
        type: coupon.type || 'percentage',
        value: coupon.value || '',
        minOrderAmount: coupon.minOrderAmount || '',
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        usageLimit: coupon.usageLimit || '',
        usageLimitPerUser: coupon.usageLimitPerUser || 1,
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
        isPublic: coupon.isPublic !== undefined ? coupon.isPublic : true,
        validFrom: coupon.validFrom ? formatDate(coupon.validFrom, 'YYYY-MM-DDTHH:mm') : '',
        validUntil: coupon.validUntil ? formatDate(coupon.validUntil, 'YYYY-MM-DDTHH:mm') : '',
        applicableTo: coupon.applicableTo || 'all',
        applicableCategories: coupon.applicableCategories || [],
        applicableProducts: coupon.applicableProducts || [],
        applicableBrands: coupon.applicableBrands || [],
        excludedCategories: coupon.excludedCategories || [],
        excludedProducts: coupon.excludedProducts || [],
        excludedBrands: coupon.excludedBrands || [],
        stackable: coupon.stackable || false,
        autoApply: coupon.autoApply || false,
        priority: coupon.priority || 0,
      });
    } else {
      // Set default values for new coupon
      const now = new Date();
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '',
        usageLimitPerUser: 1,
        isActive: true,
        isPublic: true,
        validFrom: now.toISOString().slice(0, 16),
        validUntil: nextMonth.toISOString().slice(0, 16),
        applicableTo: 'all',
        applicableCategories: [],
        applicableProducts: [],
        applicableBrands: [],
        excludedCategories: [],
        excludedProducts: [],
        excludedBrands: [],
        stackable: false,
        autoApply: false,
        priority: 0,
      });
    }
  }, [coupon]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleArrayChange = (field, value, action) => {
    setFormData((prev) => ({
      ...prev,
      [field]:
        action === 'add' ? [...prev[field], value] : prev[field].filter((item) => item !== value),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) newErrors.code = 'Coupon code is required';
    if (!formData.name.trim()) newErrors.name = 'Coupon name is required';
    if (!formData.value || formData.value <= 0) newErrors.value = 'Value must be greater than 0';
    if (!formData.validFrom) newErrors.validFrom = 'Valid from date is required';
    if (!formData.validUntil) newErrors.validUntil = 'Valid until date is required';

    if (new Date(formData.validFrom) >= new Date(formData.validUntil)) {
      newErrors.validUntil = 'Valid until must be after valid from';
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'Percentage cannot exceed 100%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError('');
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting coupon:', error);
      setError(error.message || 'Failed to create coupon. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
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
        return <Percent className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {coupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            <p className="text-gray-600 mt-1 text-sm">
              {coupon ? 'Update coupon details' : 'Set up a new discount coupon'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
          {/* Basic Information */}
          <div className="space-y-6 bg-gradient-to-br from-gray-50/50 to-blue-50/30 p-6 rounded-xl border border-gray-200/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code *
                </label>
                <div className="relative">
                  <Input
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="SAVE20"
                    className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 ${errors.code ? 'border-red-500/50 ring-red-500/50' : ''}`}
                  />
                </div>
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Name *
                </label>
                <div className="relative">
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="20% Off Everything"
                    className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 ${errors.name ? 'border-red-500/50 ring-red-500/50' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the coupon offer..."
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Discount Configuration */}
          <div className="space-y-6 bg-gradient-to-br from-green-50/50 to-emerald-50/30 p-6 rounded-xl border border-gray-200/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center">
              {getTypeIcon(formData.type)}
              <span className="ml-2">Discount Configuration</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                  <option value="buy_x_get_y">Buy X Get Y</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Value *</label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || '')}
                  placeholder={formData.type === 'percentage' ? '20' : '100'}
                  className={`w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 ${errors.value ? 'border-red-500/50 ring-red-500/50' : ''}`}
                />
                {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Order Amount
                </label>
                <Input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    handleInputChange('minOrderAmount', parseFloat(e.target.value) || '')
                  }
                  placeholder="500"
                />
              </div>
            </div>

            {formData.type === 'percentage' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Discount Amount
                </label>
                <Input
                  type="number"
                  value={formData.maxDiscountAmount}
                  onChange={(e) =>
                    handleInputChange('maxDiscountAmount', parseFloat(e.target.value) || '')
                  }
                  placeholder="1000"
                />
              </div>
            )}
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Validity Period</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valid From *</label>
                <Input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => handleInputChange('validFrom', e.target.value)}
                  className={errors.validFrom ? 'border-red-500' : ''}
                />
                {errors.validFrom && (
                  <p className="text-red-500 text-xs mt-1">{errors.validFrom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until *
                </label>
                <Input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) => handleInputChange('validUntil', e.target.value)}
                  className={errors.validUntil ? 'border-red-500' : ''}
                />
                {errors.validUntil && (
                  <p className="text-red-500 text-xs mt-1">{errors.validUntil}</p>
                )}
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="space-y-6 bg-gradient-to-br from-purple-50/50 to-pink-50/30 p-6 rounded-xl border border-gray-200/50 backdrop-blur-sm">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Usage Limits
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Usage Limit
                </label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => handleInputChange('usageLimit', parseInt(e.target.value) || '')}
                  placeholder="100 (leave empty for unlimited)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Limit Per User
                </label>
                <Input
                  type="number"
                  value={formData.usageLimitPerUser}
                  onChange={(e) =>
                    handleInputChange('usageLimitPerUser', parseInt(e.target.value) || 1)
                  }
                  placeholder="1"
                />
              </div>
            </div>
          </div>

          {/* Applicability Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Applicability Rules</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Applicable To</label>
              <select
                value={formData.applicableTo}
                onChange={(e) => handleInputChange('applicableTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="all">All Products</option>
                <option value="categories">Specific Categories</option>
                <option value="products">Specific Products</option>
                <option value="brands">Specific Brands</option>
              </select>
            </div>

            {formData.applicableTo === 'categories' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Categories
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.applicableCategories.includes(category.id)}
                        onChange={(e) =>
                          handleArrayChange(
                            'applicableCategories',
                            category.id,
                            e.target.checked ? 'add' : 'remove',
                          )
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.applicableTo === 'products' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Products
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {products.map((product) => (
                    <label key={product.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.applicableProducts.includes(product.id)}
                        onChange={(e) =>
                          handleArrayChange(
                            'applicableProducts',
                            product.id,
                            e.target.checked ? 'add' : 'remove',
                          )
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">{product.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.applicableTo === 'brands' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Brands
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {brands.map((brand) => (
                    <label key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.applicableBrands.includes(brand)}
                        onChange={(e) =>
                          handleArrayChange(
                            'applicableBrands',
                            brand,
                            e.target.checked ? 'add' : 'remove',
                          )
                        }
                        className="mr-2"
                      />
                      <span className="text-sm">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Public (visible to customers)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.stackable}
                    onChange={(e) => handleInputChange('stackable', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Stackable with other coupons
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.autoApply}
                    onChange={(e) => handleInputChange('autoApply', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Auto-apply when conditions are met
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Higher numbers have higher priority</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200/50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:bg-gray-50/80 hover:border-gray-300/50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
            >
              {isSubmitting ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CouponForm;
