import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api.js';
import ProductList from '../components/ProductList.jsx';
import SearchBar from '../components/search/SearchBar.jsx';
import FilterSidebar from '../components/filters/FilterSidebar.jsx';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery] = useState(searchParams.get('q') || '');
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
    async (page = 1, currentFilters = filters) => {
      try {
        setLoading(true);
        setError(null);

        const q = searchParams.get('q');
        let response;

        if (q && q.trim() !== '') {
          response = await apiService.searchProducts(q.trim());
          setProducts(response.products);
          setPagination({});
          setCurrentPage(1);
        } else {
          const params = { page, limit: 12 };
          if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
          if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;
          if (currentFilters.brand && currentFilters.brand.length)
            params.brand = currentFilters.brand.join(',');
          if (currentFilters.condition && currentFilters.condition.length)
            params.condition = currentFilters.condition.join(',');
          if (currentFilters.ramGb && currentFilters.ramGb.length)
            params.ramGb = currentFilters.ramGb.join(',');
          if (currentFilters.storage && currentFilters.storage.length)
            params.storage = currentFilters.storage.join(',');
          if (typeof currentFilters.inStock === 'boolean') params.inStock = currentFilters.inStock;
          response = await apiService.filterProducts(params);
          setProducts(response.products);
          setPagination(response.pagination || {});
          setCurrentPage(response?.pagination?.page || page || 1);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = useCallback(
    async (query) => {
      const q = typeof query === 'string' ? query : searchQuery;
      const params = new URLSearchParams(searchParams);
      if (q && q.trim() !== '') {
        params.set('q', q.trim());
      } else {
        params.delete('q');
      }
      setSearchParams(params);
      await loadProducts(1);
    },
    [searchQuery, searchParams, setSearchParams, loadProducts],
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Products</h2>
        <p className="text-gray-600">Browse all refurbished laptops</p>
        <div className="mt-4 flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Filters
          </button>
        </div>
        <div className="mt-4 w-full">
          <SearchBar onSearch={handleSearch} placeholder="Search laptops (brand, model, CPU)" />
        </div>
      </div>

      <div className="flex">
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            loadProducts(1, f);
          }}
        />
        <div className="flex-1 lg:ml-6">
          <ProductList products={products} loading={loading} error={error} />
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 flex-wrap gap-2">
          <button
            onClick={() => loadProducts(1)}
            disabled={currentPage <= 1}
            className={`px-3 py-2 rounded border ${currentPage <= 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            First
          </button>
          <button
            onClick={() => loadProducts(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className={`px-3 py-2 rounded border ${currentPage <= 1 ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Prev
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => loadProducts(pageNum)}
              className={`px-3 py-2 rounded border ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </button>
          ))}
          <button
            onClick={() => loadProducts(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage >= pagination.totalPages}
            className={`px-3 py-2 rounded border ${currentPage >= pagination.totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Next
          </button>
          <button
            onClick={() => loadProducts(pagination.totalPages)}
            disabled={currentPage >= pagination.totalPages}
            className={`px-3 py-2 rounded border ${currentPage >= pagination.totalPages ? 'text-gray-400 bg-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
}
