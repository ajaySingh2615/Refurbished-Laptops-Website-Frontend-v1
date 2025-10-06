import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import ProductForm from '../../components/admin/ProductForm.jsx';
import { apiService } from '../../services/api.js';

export default function ProductManagement() {
  const [products, setProducts] = React.useState([]);
  const [pagination, setPagination] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [q, setQ] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

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
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="px-3 py-2 border rounded-md"
          />
          <button onClick={() => load(1)} className="px-3 py-2 border rounded-md hover:bg-gray-50">
            Search
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <Th>Name</Th>
                <Th>Brand</Th>
                <Th>Model</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Updated</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p) => (
                <tr key={p.id}>
                  <Td>{p.title}</Td>
                  <Td>{p.brand}</Td>
                  <Td>{p.model}</Td>
                  <Td>₹{Number(p.price).toLocaleString('en-IN')}</Td>
                  <Td>{p.inStock ? `In (${p.stockQty ?? 0})` : 'Out'}</Td>
                  <Td>{new Date(p.updatedAt).toLocaleString('en-IN')}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => load(n)}
              className={`px-3 py-2 rounded border ${pagination.page === n ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Product</h2>
              <button
                onClick={() => setShowForm(false)}
                className="px-2 py-1 rounded hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <ProductForm
              submitting={submitting}
              onCancel={() => setShowForm(false)}
              onSubmit={async (payload) => {
                try {
                  setSubmitting(true);
                  await apiService.createProduct(payload);
                  setShowForm(false);
                  await load(1);
                } catch (e) {
                  alert(e.message);
                } finally {
                  setSubmitting(false);
                }
              }}
            />
          </div>
        </div>
      )}
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
