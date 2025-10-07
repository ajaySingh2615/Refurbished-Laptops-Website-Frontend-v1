import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ProductFormStable from '../../components/admin/ProductFormStable.jsx';
import MessageModal from '../../components/admin/MessageModal.jsx';
import CategorySelector from '../../components/admin/CategorySelector.jsx';
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
  // Variant builder state
  const [vbColors, setVbColors] = React.useState('');
  const [vbRams, setVbRams] = React.useState('');
  const [vbStorages, setVbStorages] = React.useState('');
  const [vbRows, setVbRows] = React.useState([]); // preview rows

  // Admin filters
  const [skuQuery, setSkuQuery] = React.useState('');
  const [brands, setBrands] = React.useState([]);
  const [brandFilter, setBrandFilter] = React.useState('');

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

  // Low stock summary (global)
  const [lowStockSummary, setLowStockSummary] = React.useState({ count: 0, titles: [] });
  const lowStockCount = lowStockSummary.count;

  const load = React.useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);
        // Priority 1: direct SKU lookup
        if (skuQuery.trim()) {
          try {
            const item = await apiService.getProductBySku(skuQuery.trim());
            let list = item ? [item] : [];
            // Apply low stock filter on top if enabled
            if (showLowStockOnly) {
              list = list.filter(
                (product) => product.inStock && product.stockQty <= lowStockThreshold,
              );
            }
            setProducts(list);
            setPagination({});
            return;
          } catch {
            // Not found or error
            setProducts([]);
            setPagination({});
            setLoading(false);
            return;
          }
        }

        // Priority 2: keyword search
        if (q.trim()) {
          const res = await apiService.searchProducts(q.trim());
          let list = res.products || [];
          if (showLowStockOnly) {
            list = list.filter(
              (product) => product.inStock && product.stockQty <= lowStockThreshold,
            );
          }
          setProducts(list);
          setPagination({});
        } else if (brandFilter) {
          // Priority 3: server filtering
          const filters = {
            page: String(page),
            limit: '12',
          };
          if (brandFilter) filters.brand = brandFilter;
          const res = await apiService.filterProducts(filters);
          let list = res.products || [];
          if (showLowStockOnly) {
            list = list.filter(
              (product) => product.inStock && product.stockQty <= lowStockThreshold,
            );
          }
          setProducts(list);
          setPagination(res.pagination || {});
        } else if (showLowStockOnly) {
          // Global low stock list (across all pages)
          const res = await apiService.getLowStockList(lowStockThreshold);
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [skuQuery, q, brandFilter, showLowStockOnly, lowStockThreshold],
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

  // Load brands for filter dropdown
  React.useEffect(() => {
    (async () => {
      try {
        const list = await apiService.getBrands();
        setBrands(Array.isArray(list) ? list : []);
      } catch {
        // ignore brand load errors in admin filters
      }
    })();
  }, []);

  // Fetch global low stock summary
  React.useEffect(() => {
    (async () => {
      try {
        const sum = await apiService.getLowStockSummary(lowStockThreshold);
        setLowStockSummary(sum || { count: 0, titles: [] });
        setLowStockCount(sum?.count || 0);
      } catch {
        setLowStockSummary({ count: 0, titles: [] });
        setLowStockCount(0);
      }
    })();
  }, [lowStockThreshold, setLowStockCount]);

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
                {lowStockSummary.titles.join(', ')} {lowStockCount > 3 && 'and more...'}
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
        <div className="flex items-center gap-3 flex-wrap">
          {showLowStockOnly && (
            <Button
              variant="outline"
              onClick={() => {
                setShowLowStockOnly(false);
                setQ('');
                setSkuQuery('');
                setBrandFilter('');
              }}
              className="h-12 px-4 text-slate-600 border-slate-300 hover:bg-slate-50"
            >
              Clear Filter
            </Button>
          )}

          {/* SKU search - Aceternity style */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <div className="p-1.5 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm">
                <svg
                  className="h-3.5 w-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M3 7h18M3 12h18M3 17h10"
                  />
                </svg>
              </div>
            </div>
            <Input
              value={skuQuery}
              onChange={(e) => setSkuQuery(e.target.value)}
              placeholder="Search by SKU"
              className="pl-12 h-12 w-48"
            />
          </div>

          {/* Keyword search - Aceternity style */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <div className="p-1.5 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm">
                <svg
                  className="h-3.5 w-3.5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title / brand / CPU"
              className="pl-12 h-12 w-64"
            />
          </div>

          {/* Brand - Aceternity style */}
          <div className="relative">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="h-12 pl-3 pr-9 rounded-lg border-2 border-slate-200/60 bg-white/90 text-sm text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all appearance-none"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Removed: condition, availability, min/max price filters */}

          <Button
            onClick={() => load(1)}
            className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
          >
            Apply
          </Button>

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
                      onClick={async () => {
                        try {
                          setSubmitting(true);
                          const detail = await apiService.getProduct(p.id);
                          setEditingProduct(detail);
                        } catch (e) {
                          showValidationError(e);
                        } finally {
                          setSubmitting(false);
                        }
                      }}
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
              {/* Category selector - at top for Add Product */}
              <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm">
                <div className="mb-2 text-sm font-semibold text-slate-900">
                  Category & Sub-category
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Choose a parent category, then select a sub-category (leaf). If no sub-categories
                  exist, the parent will be used.
                </p>
                <input type="hidden" id="admin-add-category-id" defaultValue="" />
                <CategorySelector
                  value={null}
                  onChange={(id) => {
                    const el = document.getElementById('admin-add-category-id');
                    if (el) el.value = id || '';
                  }}
                />
              </div>

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
                      const categoryId = document.getElementById('admin-add-category-id')?.value;
                      if (!categoryId) {
                        showValidationError({
                          type: 'validation',
                          message: 'Please select a category (or sub-category).',
                          field: 'admin-add-category-id',
                        });
                        return;
                      }
                      await apiService.createProduct({
                        ...payload,
                        categoryId: Number(categoryId),
                      });
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
              {/* Category selector - moved to top */}
              <div className="mb-4 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm">
                <div className="mb-2 text-sm font-semibold text-slate-900">
                  Category & Sub-category
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Choose a parent category, then select a sub-category (leaf). If no sub-categories
                  exist, the parent will be used.
                </p>
                <input
                  type="hidden"
                  id="admin-category-id"
                  defaultValue={editingProduct?.categoryId || ''}
                />
                <CategorySelector
                  value={editingProduct?.categoryId || null}
                  onChange={(id) => {
                    const el = document.getElementById('admin-category-id');
                    if (el) el.value = id || '';
                  }}
                />
              </div>

              {/* Edit tabs: Details | Variants */}
              <div className="mb-4 flex items-center gap-2 border-b border-slate-200">
                <button className="px-4 py-2 text-sm font-semibold text-blue-600 border-b-2 border-blue-600">
                  Details
                </button>
                <button
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
                  onClick={() =>
                    document
                      .getElementById('variants-panel')
                      ?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  Variants
                </button>
              </div>

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
                      const categoryId = document.getElementById('admin-category-id')?.value;
                      const full = categoryId
                        ? { ...payload, categoryId: Number(categoryId) }
                        : payload;
                      await apiService.updateProduct(editingProduct.id, full);
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

              {/* Variants management */}
              <div id="variants-panel" className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-900">Variants</h3>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {editingProduct?.variants?.length || 0} total
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Manage per-variant price and stock. Use Add Variant to create new combinations
                  (e.g., different RAM/Storage/Color).
                </p>

                {/* Variant Builder (no JSON) */}
                <div className="mb-6 p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">Variant Builder</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      value={vbColors}
                      onChange={(e) => setVbColors(e.target.value)}
                      placeholder="Colors (comma separated) e.g. Silver, Black"
                      className="h-11 px-3 rounded border border-slate-300 text-sm"
                    />
                    <input
                      value={vbRams}
                      onChange={(e) => setVbRams(e.target.value)}
                      placeholder="RAM (GB, comma separated) e.g. 8, 16, 32"
                      className="h-11 px-3 rounded border border-slate-300 text-sm"
                    />
                    <input
                      value={vbStorages}
                      onChange={(e) => setVbStorages(e.target.value)}
                      placeholder="Storage (comma separated) e.g. 512GB SSD, 1TB NVMe"
                      className="h-11 px-3 rounded border border-slate-300 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const colors = vbColors
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        const rams = vbRams
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        const storages = vbStorages
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        const baseSku = (editingProduct?.sku || editingProduct?.model || 'SKU')
                          .toString()
                          .toUpperCase();
                        const rows = [];
                        const ensure = (arr) => (arr.length ? arr : ['']);
                        for (const c of ensure(colors))
                          for (const r of ensure(rams))
                            for (const st of ensure(storages)) {
                              const ramCode = r ? `-RAM${r}` : '';
                              const stCode = st ? `-${st.replace(/\s+/g, '')}` : '';
                              const colorCode = c ? `-${c.replace(/\s+/g, '').toUpperCase()}` : '';
                              const sku = `${baseSku}${ramCode}${stCode}${colorCode}`.replace(
                                /--+/g,
                                '-',
                              );
                              rows.push({
                                sku,
                                attributes: {
                                  color: c || undefined,
                                  ramGb: r ? Number(r) : undefined,
                                  storage: st || undefined,
                                },
                                price: Number(editingProduct?.price || 0),
                                stockQty: 0,
                              });
                            }
                        setVbRows(rows);
                      }}
                    >
                      Generate Variants
                    </Button>
                    {vbRows.length > 0 && (
                      <Button
                        onClick={async () => {
                          try {
                            const payload = vbRows.map((row) => ({
                              sku: row.sku,
                              attributes: {
                                ...(row.attributes.color ? { color: row.attributes.color } : {}),
                                ...(row.attributes.ramGb ? { ramGb: row.attributes.ramGb } : {}),
                                ...(row.attributes.storage
                                  ? { storage: row.attributes.storage }
                                  : {}),
                              },
                              price: Number(row.price) || 0,
                              stockQty: Math.max(0, Number(row.stockQty) || 0),
                              inStock: (Number(row.stockQty) || 0) > 0,
                            }));
                            await apiService.createProductVariants(editingProduct.id, payload);
                            setVbRows([]);
                            await load(1);
                            showSuccess('Variants Created', 'All generated variants were created.');
                          } catch (e) {
                            showValidationError(e);
                          }
                        }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                      >
                        Save All
                      </Button>
                    )}
                  </div>

                  {vbRows.length > 0 && (
                    <div className="mt-4 overflow-x-auto rounded border border-slate-200">
                      <table className="min-w-full bg-white">
                        <thead className="bg-slate-50/80">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                              SKU
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                              Attributes
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                              Price
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                              Stock
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                              Remove
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {vbRows.map((row, idx) => (
                            <tr key={row.sku + idx} className="border-t border-slate-100">
                              <td className="px-4 py-2 text-sm font-mono text-slate-800">
                                {row.sku}
                              </td>
                              <td className="px-4 py-2 text-sm text-slate-700">
                                <code className="text-xs bg-slate-50 px-2 py-1 rounded">
                                  {JSON.stringify(row.attributes)}
                                </code>
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={row.price}
                                  onChange={(e) => {
                                    const v = [...vbRows];
                                    v[idx].price = e.target.value;
                                    setVbRows(v);
                                  }}
                                  className="w-28 h-9 px-3 rounded border border-slate-300 text-sm"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <input
                                  type="number"
                                  value={row.stockQty}
                                  onChange={(e) => {
                                    const v = [...vbRows];
                                    v[idx].stockQty = e.target.value;
                                    setVbRows(v);
                                  }}
                                  className="w-24 h-9 px-3 rounded border border-slate-300 text-sm"
                                />
                              </td>
                              <td className="px-4 py-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setVbRows(vbRows.filter((_, i) => i !== idx))}
                                >
                                  Remove
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Existing variants list (if editingProduct has variants loaded on fetch in the page; fallback handled by GET /product detail) */}
                <div className="overflow-x-auto rounded border border-slate-200">
                  <table className="min-w-full bg-white">
                    <thead className="bg-slate-50/80">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                          SKU
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                          Attributes
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                          Price
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                          Stock
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(editingProduct?.variants || []).map((v) => (
                        <tr key={v.id} className="border-t border-slate-100">
                          <td className="px-4 py-2 text-sm font-mono text-slate-800">{v.sku}</td>
                          <td className="px-4 py-2 text-sm text-slate-700">
                            <code className="text-xs bg-slate-50 px-2 py-1 rounded">
                              {JSON.stringify(v.attributes)}
                            </code>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              defaultValue={v.price}
                              onBlur={async (e) => {
                                const price = Number(e.target.value);
                                if (!Number.isNaN(price)) {
                                  await apiService.updateVariant(v.id, { price });
                                }
                              }}
                              className="w-28 h-9 px-3 rounded border border-slate-300 text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              defaultValue={v.stockQty}
                              onBlur={async (e) => {
                                const stockQty = Math.max(0, Number(e.target.value) || 0);
                                await apiService.updateVariant(v.id, {
                                  stockQty,
                                  inStock: stockQty > 0,
                                });
                              }}
                              className="w-24 h-9 px-3 rounded border border-slate-300 text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await apiService.deleteVariant(v.id);
                                await load(1);
                              }}
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {(!editingProduct?.variants || editingProduct?.variants?.length === 0) && (
                        <tr>
                          <td className="px-4 py-6 text-sm text-slate-500" colSpan={5}>
                            No variants yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Quick add row removed in favor of Variant Builder */}
              </div>
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
