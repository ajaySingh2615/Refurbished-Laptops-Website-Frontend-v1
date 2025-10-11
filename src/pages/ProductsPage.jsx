import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api.js';
import ProductList from '../components/ProductList.jsx';
import SearchBar from '../components/search/SearchBar.jsx';
import FilterSidebar from '../components/filters/FilterSidebar.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { Button } from '../components/ui/Button.jsx';

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
      <div className="mb-6">
        <div className="flex items-center justify-end mb-4">
          <div className="lg:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
                />
              </svg>
              Filters
            </Button>
          </div>
        </div>
        <div className="w-full">
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
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={loadProducts}
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
}
