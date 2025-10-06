import React from "react";
import { useState, useEffect } from "react";
import { apiService } from "../services/api.js";
import ProductList from "../components/ProductList.jsx";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProducts(page);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      setError(null);
      const q = typeof query === "string" ? query : searchQuery;
      if (!q || q.trim() === "") {
        await loadProducts(1);
      } else {
        const response = await apiService.searchProducts(q.trim());
        setProducts(response.products);
        setPagination({});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Refurbished Laptops
        </h2>
        <p className="text-gray-600">Quality-tested laptops at great value</p>
        {/* Simple search bar */}
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
              setSearchQuery("");
              loadProducts(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
        </form>
      </div>

      <ProductList products={products} loading={loading} error={error} />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => loadProducts(page)}
                className={`px-3 py-2 rounded ${
                  page === pagination.page
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
