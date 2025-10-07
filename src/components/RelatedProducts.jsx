import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api.js';

export default function RelatedProducts({ product }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!product || !product.brand) {
          if (isMounted) setItems([]);
          return;
        }

        const parsePrice = (val) => {
          const n = Number(val);
          return Number.isFinite(n) ? n : null;
        };

        const price = parsePrice(product.price);
        const pct = 0.15; // ±15%
        const minPrice = price ? Math.max(0, Math.floor(price * (1 - pct))) : undefined;
        const maxPrice = price ? Math.ceil(price * (1 + pct)) : undefined;

        // Extract storage tokens
        const storageTokens = ['SSD', 'HDD', 'NVMe'].filter((t) =>
          (product.storage || '').toUpperCase().includes(t.toUpperCase()),
        );

        const attempt = async (params) => {
          const res = await apiService.filterProducts(params);
          const list = Array.isArray(res.products) ? res.products : [];
          return list.filter((p) => p.id !== product.id);
        };

        // 1) Strict: brand + condition + price band + ram + storage + inStock
        let params1 = {
          page: 1,
          limit: 8,
          brand: String(product.brand),
          condition: product.condition ? String(product.condition) : undefined,
          inStock: true,
          minPrice,
          maxPrice,
          ramGb: product.ramGb ? String(product.ramGb) : undefined,
          storage: storageTokens.length ? storageTokens.join(',') : undefined,
        };
        let related = await attempt(params1);

        // 2) Relax RAM/Storage
        if (related.length < 4) {
          const { ramGb: _ram, storage: _storage, ...rest } = params1;
          related = await attempt(rest);
        }

        // 3) Relax price band
        if (related.length < 4) {
          const { minPrice: _mn, maxPrice: _mx, ...rest } = params1;
          related = await attempt({ ...rest, ramGb: undefined, storage: undefined });
        }

        // 4) Brand only
        if (related.length < 4) {
          related = await attempt({
            page: 1,
            limit: 8,
            brand: String(product.brand),
            inStock: true,
          });
        }

        if (isMounted) setItems(related);
      } catch {
        if (isMounted) setError('Failed to load related products');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (product) load();
    return () => {
      isMounted = false;
    };
  }, [product]);

  if (loading) return null;
  if (error || items.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Products</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            to={`/product/${item.id}`}
            key={item.id}
            className="group border rounded-lg p-3 hover:shadow transition-shadow bg-white"
          >
            <div className="aspect-square bg-gray-100 rounded mb-3" />
            <div className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
              {item.title}
            </div>
            <div className="mt-1 text-xs text-gray-500">{item.brand}</div>
            <div className="mt-2 text-sm font-semibold text-gray-900">
              ₹{Number(item.price).toLocaleString('en-IN')}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
