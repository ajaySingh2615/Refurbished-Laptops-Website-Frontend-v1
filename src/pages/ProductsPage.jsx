import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api.js';
import ProductList from '../components/ProductList.jsx';
import FilterSidebar from '../components/filters/FilterSidebar.jsx';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    brand: [],
    condition: [],
    minPrice: '',
    maxPrice: '',
    ramGb: [],
    storage: [],
    inStock: null,
  });

  const loadProducts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const q = searchParams.get('q');
        let response;

        if (q && q.trim() !== '') {
          response = await apiService.searchProducts(q.trim());
          setProducts(response.products);
          setPagination({});
        } else {
          const params = { page, limit: 12 };
          if (filters.minPrice) params.minPrice = filters.minPrice;
          if (filters.maxPrice) params.maxPrice = filters.maxPrice;
          if (filters.brand && filters.brand.length) params.brand = filters.brand.join(',');
          if (filters.condition && filters.condition.length)
            params.condition = filters.condition.join(',');
          if (filters.ramGb && filters.ramGb.length) params.ramGb = filters.ramGb.join(',');
          if (filters.storage && filters.storage.length) params.storage = filters.storage.join(',');
          if (typeof filters.inStock === 'boolean') params.inStock = filters.inStock;
          response = await apiService.filterProducts(params);
          setProducts(response.products);
          setPagination(response.pagination || {});
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [searchParams, filters],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = async (query) => {
    const q = typeof query === 'string' ? query : searchQuery;
    const params = new URLSearchParams(searchParams);
    if (q && q.trim() !== '') {
      params.set('q', q.trim());
    } else {
      params.delete('q');
    }
    setSearchParams(params);
    await loadProducts(1);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Products</h2>
        <p className="text-gray-600">Browse all refurbished laptops</p>
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Filters
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search laptops (brand, model, CPU)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              const params = new URLSearchParams(searchParams);
              params.delete('q');
              setSearchParams(params);
              loadProducts(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
        </form>
      </div>

      <div className="flex">
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onChange={(f) => setFilters(f)}
        />
        <div className="flex-1 lg:ml-6">
          <ProductList products={products} loading={loading} error={error} />
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => loadProducts(page)}
              className={`px-3 py-2 rounded ${
                page === pagination.page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
