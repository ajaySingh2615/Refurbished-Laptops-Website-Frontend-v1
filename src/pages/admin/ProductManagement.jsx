import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ProductFormStable from '../../components/admin/ProductFormStable.jsx';
import MessageModal from '../../components/admin/MessageModal.jsx';
import { apiService } from '../../services/api.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useAdmin } from '../../contexts/AdminContext.jsx';

export default function ProductManagement() {
  const { setLowStockCount } = useAdmin();
  const [products, setProducts] = React.useState([]);
  const [pagination, setPagination] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [q, setQ] = React.useState('');
  const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState(null);
  const [deletingProduct, setDeletingProduct] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [lowStockThreshold] = React.useState(5); // Default threshold
  const [selectedIds, setSelectedIds] = React.useState([]);
  const [inlineStock, setInlineStock] = React.useState({}); // { [id]: value }
  const [bulkAmount, setBulkAmount] = React.useState('');
  const [bulkMode, setBulkMode] = React.useState('increase'); // 'increase' | 'set'
  const [messageModal, setMessageModal] = React.useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
    buttonText: 'OK',
  });

  // Helper functions for showing messages
  const showMessage = React.useCallback((type, title, message, buttonText = 'OK') => {
    setMessageModal({
      isOpen: true,
      type,
      title,
      message,
      buttonText,
    });
  }, []);

  const showSuccess = React.useCallback(
    (title, message) => {
      showMessage('success', title, message, 'Great!');
    },
    [showMessage],
  );

  const showError = React.useCallback(
    (title, message) => {
      showMessage('error', title, message, 'Try Again');
    },
    [showMessage],
  );

  const showValidationError = React.useCallback(
    (error) => {
      let title = 'Validation Error';
      let message = 'Please check your input and try again.';

      // Handle client-side validation errors
      if (error.type === 'validation') {
        title = 'Form Validation Error';
        message = error.message;

        // Highlight the problematic field if specified
        if (error.field) {
          const fieldElement = document.querySelector(`[name="${error.field}"]`);
          if (fieldElement) {
            fieldElement.focus();
            fieldElement.style.borderColor = '#ef4444';
            fieldElement.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';

            // Remove highlight after 3 seconds
            setTimeout(() => {
              fieldElement.style.borderColor = '';
              fieldElement.style.boxShadow = '';
            }, 3000);
          }
        }

        showError(title, message);
        return;
      }

      // Parse specific database errors
      if (error.message) {
        if (error.message.includes('Data too long for column')) {
          const columnMatch = error.message.match(/column '([^']+)'/);
          const column = columnMatch ? columnMatch[1] : 'field';
          title = 'Field Too Long';
          message = `The ${column.replace(/_/g, ' ')} field contains too much text. Please shorten it and try again.`;
        } else if (error.message.includes('Duplicate entry')) {
          title = 'Duplicate Entry';
          message =
            'A product with this information already exists. Please check your data and try again.';
        } else if (error.message.includes('required')) {
          title = 'Missing Required Fields';
          message = 'Please fill in all required fields (marked with *) and try again.';
        } else if (error.message.includes('Invalid value')) {
          title = 'Invalid Data';
          message = 'Please check that all numeric fields contain valid numbers and try again.';
        } else {
          // Use the actual error message for other cases
          message = error.message;
        }
      }

      showError(title, message);
    },
    [showError],
  );

  const closeMessageModal = React.useCallback(() => {
    setMessageModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Get low stock products
  const getLowStockProducts = React.useCallback(() => {
    return products.filter((product) => product.inStock && product.stockQty <= lowStockThreshold);
  }, [products, lowStockThreshold]);

  // Get low stock count
  const lowStockCount = React.useMemo(() => {
    return getLowStockProducts().length;
  }, [getLowStockProducts]);

  const load = React.useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);
        if (q.trim()) {
          const res = await apiService.searchProducts(q.trim());
          setProducts(res.products || []);
          setPagination({});
        } else {
          const res = await apiService.getProducts(page, 12);
          let filteredProducts = res.products || [];

          // Apply low stock filter if enabled
          if (showLowStockOnly) {
            filteredProducts = filteredProducts.filter(
              (product) => product.inStock && product.stockQty <= lowStockThreshold,
            );
          }

          setProducts(filteredProducts);
          setPagination(res.pagination || {});
          // Reset selections when list changes
          setSelectedIds([]);
          setInlineStock({});
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [q, showLowStockOnly, lowStockThreshold],
  );

  // Selection helpers
  const allDisplayedIds = React.useMemo(() => products.map((p) => p.id), [products]);
  const isAllSelected = selectedIds.length > 0 && selectedIds.length === allDisplayedIds.length;
  const toggleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(allDisplayedIds);
  };
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Inline stock handlers
  const handleInlineStockChange = (id, value) => {
    setInlineStock((prev) => ({ ...prev, [id]: value }));
  };
  const saveInlineStock = async (product) => {
    const raw = inlineStock[product.id];
    if (raw === undefined || raw === null || raw === '') return;
    const nextQty = Number(raw);
    if (Number.isNaN(nextQty) || nextQty < 0) {
      showError('Invalid Stock Quantity', 'Please enter a valid non-negative number.');
      return;
    }
    try {
      setSubmitting(true);
      await apiService.updateProduct(product.id, { stockQty: nextQty, inStock: nextQty > 0 });
      setInlineStock((prev) => ({ ...prev, [product.id]: '' }));
      await load(1);
      showSuccess('Stock Updated', `${product.title} stock set to ${nextQty}.`);
    } catch (e) {
      showValidationError(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk actions
  const runBulkUpdate = async () => {
    const amountNum = Number(bulkAmount);
    if (Number.isNaN(amountNum)) {
      showError('Invalid Amount', 'Please enter a valid number for bulk update.');
      return;
    }
    if (selectedIds.length === 0) {
      showError('No Products Selected', 'Select one or more products to update.');
      return;
    }
    const mapById = new Map(products.map((p) => [p.id, p]));
    try {
      setSubmitting(true);
      const updates = selectedIds.map((id) => {
        const p = mapById.get(id);
        if (!p) return Promise.resolve();
        let nextQty = p.stockQty ?? 0;
        if (bulkMode === 'increase') nextQty = Math.max(0, Number(nextQty) + amountNum);
        else nextQty = Math.max(0, amountNum);
        return apiService.updateProduct(id, { stockQty: nextQty, inStock: nextQty > 0 });
      });
      await Promise.all(updates);
      await load(1);
      setSelectedIds([]);
      setBulkAmount('');
      showSuccess('Bulk Stock Updated', 'Selected products have been updated.');
    } catch (e) {
      showValidationError(e);
    } finally {
      setSubmitting(false);
    }
  };

  React.useEffect(() => {
    load(1);
  }, [load]);

  // Update global low stock count
  React.useEffect(() => {
    setLowStockCount(lowStockCount);
  }, [lowStockCount, setLowStockCount]);

  return (
    <AdminLayout>
      {/* Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800">
                Low Stock Alert: {lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low
              </h3>
              <p className="text-sm text-amber-700">
                {getLowStockProducts()
                  .slice(0, 3)
                  .map((p) => p.title)
                  .join(', ')}{' '}
                {lowStockCount > 3 && 'and more...'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Toggle low stock filter
                setShowLowStockOnly(!showLowStockOnly);
                setQ(''); // Clear search when filtering
              }}
              className={`${
                showLowStockOnly
                  ? 'bg-amber-100 text-amber-800 border-amber-400'
                  : 'text-amber-700 border-amber-300 hover:bg-amber-100'
              }`}
            >
              {showLowStockOnly ? 'Show All Products' : 'View Low Stock'}
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {showLowStockOnly ? 'Low Stock Products' : 'Products'}
          </h1>
          {showLowStockOnly && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Filtered View
            </div>
          )}
          {!showLowStockOnly && lowStockCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              {lowStockCount} Low Stock
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showLowStockOnly && (
            <Button
              variant="outline"
              onClick={() => {
                setShowLowStockOnly(false);
                setQ('');
              }}
              className="h-12 px-4 text-slate-600 border-slate-300 hover:bg-slate-50"
            >
              Clear Filter
            </Button>
          )}
          <div className="relative group">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products..."
              className="pl-12 pr-24 h-12 bg-white/90 backdrop-blur-md border-2 border-slate-200/60 rounded-xl shadow-lg shadow-slate-200/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-xl focus:shadow-blue-500/20 transition-all duration-300 text-slate-700 placeholder:text-slate-400 max-w-sm"
            />

            {/* Search Icon */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="p-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm">
                <svg
                  className="h-3.5 w-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Search Button */}
            <Button
              onClick={() => load(1)}
              className="absolute inset-y-0 right-0 h-12 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-r-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 border-0 text-sm"
            >
              Search
            </Button>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="relative inline-flex items-center gap-3 px-6 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 border-0 overflow-hidden group"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>

            {/* Icon with animation */}
            <div className="relative flex items-center justify-center w-5 h-5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-300">
              <svg
                className="h-3.5 w-3.5 text-white group-hover:scale-110 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>

            {/* Text */}
            <span className="relative">Add Product</span>
          </Button>
        </div>
      </div>

      {/* Bulk action bar for Low Stock view */}
      {showLowStockOnly && products.length > 0 && (
        <div className="mb-4 p-4 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl shadow">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">Bulk stock update:</span>
            <select
              value={bulkMode}
              onChange={(e) => setBulkMode(e.target.value)}
              className="h-10 px-3 rounded border border-slate-300 text-sm"
            >
              <option value="increase">Increase by</option>
              <option value="set">Set to</option>
            </select>
            <input
              type="number"
              value={bulkAmount}
              onChange={(e) => setBulkAmount(e.target.value)}
              placeholder="Amount"
              className="h-10 w-28 px-3 rounded border border-slate-300 text-sm"
            />
            <Button onClick={runBulkUpdate} disabled={submitting} className="h-10">
              {submitting ? 'Updating...' : 'Apply to Selected'}
            </Button>
            <span className="text-xs text-slate-500">
              Selected: {selectedIds.length} / {products.length}
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {showLowStockOnly && (
                <TableHead>
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                {showLowStockOnly && (
                  <TableCell>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelectOne(p.id)}
                    />
                  </TableCell>
                )}
                <TableCell className="font-semibold text-slate-900">{p.title}</TableCell>
                <TableCell className="font-medium">{p.brand}</TableCell>
                <TableCell>{p.model}</TableCell>
                <TableCell className="font-semibold text-green-600">
                  ₹{Number(p.price).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                        !p.inStock
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : p.stockQty <= lowStockThreshold
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {!p.inStock
                        ? 'Out of Stock'
                        : p.stockQty <= lowStockThreshold
                          ? `Low Stock (${p.stockQty ?? 0})`
                          : `In Stock (${p.stockQty ?? 0})`}
                    </span>
                    {p.stockQty <= lowStockThreshold && p.inStock && (
                      <svg
                        className="w-4 h-4 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    )}

                    {/* Inline stock editor - only visible in low stock view */}
                    {showLowStockOnly && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={inlineStock[p.id] ?? ''}
                          onChange={(e) => handleInlineStockChange(p.id, e.target.value)}
                          placeholder="Qty"
                          className="w-20 h-8 px-2 rounded border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => saveInlineStock(p)}
                          className="h-8 px-3"
                          disabled={submitting}
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {new Date(p.updatedAt).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(p)}
                      className="h-8 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingProduct(p)}
                      className="h-8 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.page || 1}
            totalPages={pagination.totalPages}
            onPageChange={load}
            className="justify-center"
          />
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Add Product</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6" style={{ scrollBehavior: 'auto' }}>
              <ProductFormStable
                key="add-product-form"
                submitting={submitting}
                onCancel={() => setShowForm(false)}
                onValidationError={(error) => {
                  showValidationError(error);
                }}
                onSubmit={(payload) => {
                  // Handle form submission (both sync validation and async API call)
                  const handleSubmission = async () => {
                    try {
                      setSubmitting(true);
                      await apiService.createProduct(payload);
                      setShowForm(false);
                      await load(1);

                      // Show success message
                      showSuccess(
                        'Product Added Successfully! 🎉',
                        `"${payload.title}" has been added to your inventory with SKU: ${payload.sku}. The product is now available for customers to view and purchase.`,
                      );
                    } catch (e) {
                      // Show specific validation error
                      showValidationError(e);
                    } finally {
                      setSubmitting(false);
                    }
                  };

                  // Execute the async function
                  handleSubmission();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200/60 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900">Edit Product</h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6" style={{ scrollBehavior: 'auto' }}>
              <ProductFormStable
                key={`edit-product-form-${editingProduct.id}`}
                initialData={editingProduct}
                submitting={submitting}
                onCancel={() => setEditingProduct(null)}
                onValidationError={(error) => {
                  showValidationError(error);
                }}
                onSubmit={(payload) => {
                  const handleSubmission = async () => {
                    try {
                      setSubmitting(true);
                      await apiService.updateProduct(editingProduct.id, payload);
                      setEditingProduct(null);
                      await load(1);

                      showSuccess(
                        'Product Updated Successfully! 🎉',
                        `"${payload.title}" has been updated successfully. All changes are now live.`,
                      );
                    } catch (e) {
                      showValidationError(e);
                    } finally {
                      setSubmitting(false);
                    }
                  };

                  handleSubmission();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Product</h3>
                <p className="text-sm text-slate-600">This action cannot be undone.</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-slate-700 mb-2">Are you sure you want to delete this product?</p>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="font-semibold text-slate-900">{deletingProduct.title}</p>
                <p className="text-sm text-slate-600">
                  {deletingProduct.brand} {deletingProduct.model} • SKU: {deletingProduct.sku}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    await apiService.deleteProduct(deletingProduct.id);
                    setDeletingProduct(null);
                    await load(1);

                    showSuccess(
                      'Product Deleted Successfully! 🗑️',
                      `"${deletingProduct.title}" has been permanently removed from your inventory.`,
                    );
                  } catch (e) {
                    showValidationError(e);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                {submitting ? 'Deleting...' : 'Delete Product'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={closeMessageModal}
        type={messageModal.type}
        title={messageModal.title}
        message={messageModal.message}
        buttonText={messageModal.buttonText}
        onButtonClick={closeMessageModal}
      />
    </AdminLayout>
  );
}

function Th({ children }) {
  return (
    <th
      scope="col"
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
    >
      {children}
    </th>
  );
}
function Td({ children }) {
  return <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{children}</td>;
}
