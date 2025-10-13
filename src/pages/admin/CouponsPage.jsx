import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Table } from '../../components/ui/Table.jsx';
import CouponForm from '../../components/admin/CouponForm.jsx';
import { formatPrice, formatDate } from '../../utils/formatters.js';
import { apiService } from '../../services/api.js';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Copy,
  TrendingUp,
  Calendar,
  Users,
  Percent,
  DollarSign,
  Truck,
  Gift,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);

  // Fetch coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/api/coupons');
      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  // Fetch supporting data
  const fetchSupportingData = async () => {
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        apiService.request('/api/categories'),
        apiService.request('/api/products?limit=1000'),
      ]);

      setCategories(categoriesRes || []);
      setProducts(productsRes?.products || []);

      // Extract unique brands
      const uniqueBrands = [...new Set(productsRes?.products?.map((p) => p.brand) || [])];
      setBrands(uniqueBrands);
    } catch (error) {
      console.error('Error fetching supporting data:', error);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchSupportingData();
  }, []);

  // Handle coupon operations
  const handleCreateCoupon = async (couponData) => {
    try {
      const response = await apiService.request('/api/coupons', {
        method: 'POST',
        body: JSON.stringify(couponData),
      });

      if (response.success === false) {
        throw new Error(response.message);
      }

      await fetchCoupons();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  };

  const handleUpdateCoupon = async (couponData) => {
    try {
      const response = await apiService.request(`/api/coupons/${editingCoupon.id}`, {
        method: 'PUT',
        body: JSON.stringify(couponData),
      });

      if (response.success === false) {
        throw new Error(response.message);
      }

      await fetchCoupons();
      setEditingCoupon(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await apiService.request(`/api/coupons/${couponId}`, {
        method: 'DELETE',
      });

      await fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon');
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleCopyCoupon = (coupon) => {
    const newCoupon = {
      ...coupon,
      code: `${coupon.code}_COPY`,
      name: `${coupon.name} (Copy)`,
      id: undefined,
    };
    setEditingCoupon(newCoupon);
    setIsFormOpen(true);
  };

  // Filter coupons
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      !searchTerm ||
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !filterType || coupon.type === filterType;
    const matchesStatus =
      !filterStatus ||
      (filterStatus === 'active' && coupon.isActive) ||
      (filterStatus === 'inactive' && !coupon.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'percentage':
        return <Percent className="w-4 h-4 text-blue-500" />;
      case 'fixed_amount':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'free_shipping':
        return <Truck className="w-4 h-4 text-purple-500" />;
      case 'buy_x_get_y':
        return <Gift className="w-4 h-4 text-orange-500" />;
      default:
        return <Percent className="w-4 h-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive) {
      return (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Inactive</span>
      );
    }

    if (now < validFrom) {
      return (
        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </span>
      );
    }

    if (now > validUntil) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">Expired</span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs bg-green-100 text-green-600 rounded-full flex items-center">
        <CheckCircle className="w-3 h-3 mr-1" />
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
            <p className="text-sm text-gray-500 mt-1">Manage discount codes and promotions</p>
          </div>
          <Button
            onClick={() => {
              setEditingCoupon(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Coupon</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Total</p>
                <p className="text-lg font-bold text-gray-900">{coupons.length}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Percent className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Active</p>
                <p className="text-lg font-bold text-green-600">
                  {coupons.filter((c) => c.isActive).length}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Usage</p>
                <p className="text-lg font-bold text-purple-600">
                  {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">Public</p>
                <p className="text-lg font-bold text-orange-600">
                  {coupons.filter((c) => c.isPublic).length}
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Users className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search coupons..."
                  className="pl-10 text-sm py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="percentage">Percentage</option>
                <option value="fixed_amount">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('');
                  setFilterStatus('');
                }}
                variant="outline"
                className="w-full text-sm py-2"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coupon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCoupons.map((coupon) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                        <div className="text-xs text-gray-500">{coupon.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {getTypeIcon(coupon.type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {coupon.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {coupon.type === 'percentage'
                          ? `${coupon.value}%`
                          : coupon.type === 'fixed_amount'
                            ? formatPrice(coupon.value)
                            : 'Free Shipping'}
                      </div>
                      {coupon.minOrderAmount > 0 && (
                        <div className="text-xs text-gray-500">
                          Min: {formatPrice(coupon.minOrderAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {coupon.usageCount} / {coupon.usageLimit || '∞'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {coupon.usageLimitPerUser} per user
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {formatDate(coupon.validFrom, 'MMM DD, YYYY')}
                      </div>
                      <div className="text-xs text-gray-500">
                        to {formatDate(coupon.validUntil, 'MMM DD, YYYY')}
                      </div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(coupon)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCoupon(coupon)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyCoupon(coupon)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoupons.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm || filterType || filterStatus
                  ? 'No coupons match your filters'
                  : 'No coupons found'}
              </div>
            </div>
          )}
        </div>

        {/* Coupon Form Modal */}
        <CouponForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingCoupon(null);
          }}
          onSubmit={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}
          coupon={editingCoupon}
          categories={categories}
          products={products}
          brands={brands}
        />
      </div>
    </AdminLayout>
  );
};

export default CouponsPage;
