import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api.js';

export default function CategoryPage() {
  const { '*': slugRest } = useParams(); // support nested slugs
  const slug = `/${slugRest || ''}`.replace(/^\/+|\/+$/g, '');
  const [data, setData] = React.useState(null);
  const [products, setProducts] = React.useState([]);
  const [pagination, setPagination] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [sp, setSp] = useSearchParams();

  const page = Number(sp.get('page') || 1);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const cat = await apiService.getCategory(slug);
        setData(cat);
        const res = await apiService.getCategoryProducts(slug, { page, limit: 12 });
        setProducts(res.products || []);
        setPagination(res.pagination || {});
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, page]);

  if (loading) return <div className="max-w-7xl mx-auto p-6">Loading…</div>;
  if (error) return <div className="max-w-7xl mx-auto p-6 text-red-600">{error}</div>;
  if (!data) return <div className="max-w-7xl mx-auto p-6">Not found</div>;

  const children = data.children || [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{data.name}</h1>
        {children.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {children.map((c) => (
              <Link
                key={c.id}
                to={`/c/${c.slug}`}
                className="px-3 py-1.5 rounded-full border border-gray-300 text-sm hover:bg-gray-50"
              >
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Link
            key={p.id}
            to={`/product/${encodeURIComponent(p.sku || p.id)}`}
            className="border rounded-lg p-4 hover:shadow bg-white"
          >
            <div className="aspect-video bg-gray-100 rounded mb-2" />
            <div className="font-semibold text-gray-900 line-clamp-2">{p.title}</div>
            <div className="text-sm text-gray-600">{p.brand}</div>
            <div className="mt-1 text-sm font-bold text-green-700">
              ₹{Number(p.price).toLocaleString('en-IN')}
            </div>
          </Link>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center gap-2 justify-center mt-4">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setSp({ page: String(1) })}
          >
            First
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setSp({ page: String(page - 1) })}
          >
            Prev
          </button>
          <span className="text-sm text-gray-700">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page >= pagination.totalPages}
            onClick={() => setSp({ page: String(page + 1) })}
          >
            Next
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={page >= pagination.totalPages}
            onClick={() => setSp({ page: String(pagination.totalPages) })}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
