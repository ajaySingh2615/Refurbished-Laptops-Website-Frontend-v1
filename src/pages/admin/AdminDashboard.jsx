import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { apiService } from '../../services/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = React.useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiService.getProducts(1, 1000);
        const items = res.products || [];
        const totalProducts = items.length;
        const inStock = items.filter((p) => p.inStock).length;
        const outOfStock = totalProducts - inStock;
        const totalValue = items.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
        setStats({ totalProducts, inStock, outOfStock, totalValue });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminLayout>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card title="Total Products" value={stats.totalProducts} />
            <Card title="In Stock" value={stats.inStock} />
            <Card title="Out of Stock" value={stats.outOfStock} />
            <Card
              title="Total Value"
              value={new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(stats.totalValue)}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
