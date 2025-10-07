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

export default function ProductManagement() {
  const [products, setProducts] = React.useState([]);
  const [pagination, setPagination] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [q, setQ] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
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
          setProducts(res.products || []);
          setPagination(res.pagination || {});
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [q],
  );

  React.useEffect(() => {
    load(1);
  }, [load]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex items-center gap-2">
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

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-semibold text-slate-900">{p.title}</TableCell>
                <TableCell className="font-medium">{p.brand}</TableCell>
                <TableCell>{p.model}</TableCell>
                <TableCell className="font-semibold text-green-600">
                  ₹{Number(p.price).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                      p.inStock
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {p.inStock ? `In Stock (${p.stockQty ?? 0})` : 'Out of Stock'}
                  </span>
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {new Date(p.updatedAt).toLocaleString('en-IN')}
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
                        `"${payload.title}" has been added to your inventory. The product is now available for customers to view and purchase.`,
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
