import React from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../../services/api.js';
import PriceRangeFilter from './PriceRangeFilter.jsx';
import BrandFilter from './BrandFilter.jsx';
import ConditionFilter from './ConditionFilter.jsx';
import SpecFilter from './SpecFilter.jsx';
import ActiveFilters from './ActiveFilters.jsx';

export default function FilterSidebar({ isOpen, onClose, filters, onChange }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load brands for filter
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const brandList = await apiService.getBrands();
        setBrands(brandList);
      } catch (error) {
        console.error('Failed to load brands:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  // Helpers to manipulate external filters state
  const updateFilter = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key, value) => {
    const current = Array.isArray(filters[key]) ? filters[key] : [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const clearFilters = () => {
    onChange({});
  };

  const getActiveFilters = () => {
    const active = [];
    Object.entries(filters || {}).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length) {
        value.forEach((v) => active.push({ key, value: v }));
      } else if (typeof value === 'string' && value.trim()) {
        active.push({ key, value });
      } else if (typeof value === 'boolean') {
        active.push({ key, value: value ? 'In Stock' : 'Out of Stock' });
      }
    });
    return active;
  };

  const activeFilters = getActiveFilters();

  // Lock body scroll when sidebar is open (mobile)
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-4/5 max-w-xs lg:w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="h-full overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <div className="flex items-center space-x-2">
              {activeFilters.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {activeFilters.length}
                </span>
              )}
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800">
                Clear All
              </button>
              <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <ActiveFilters
                filters={activeFilters}
                onRemove={(key, value) => {
                  if (Array.isArray(filters[key])) {
                    updateFilter(
                      key,
                      filters[key].filter((item) => item !== value),
                    );
                  } else {
                    updateFilter(key, '');
                  }
                }}
              />
            </div>
          )}

          {/* Filter Sections */}
          <div className="space-y-6">
            {/* Price Range */}
            <PriceRangeFilter
              minPrice={filters.minPrice}
              maxPrice={filters.maxPrice}
              onMinPriceChange={(value) => updateFilter('minPrice', value)}
              onMaxPriceChange={(value) => updateFilter('maxPrice', value)}
            />

            {/* Brand Filter */}
            <BrandFilter
              brands={brands}
              selectedBrands={filters.brand}
              onBrandToggle={(brand) => toggleArrayFilter('brand', brand)}
              loading={loading}
            />

            {/* Condition Filter */}
            <ConditionFilter
              selectedConditions={filters.condition}
              onConditionToggle={(condition) => toggleArrayFilter('condition', condition)}
            />

            {/* Specifications Filter */}
            <SpecFilter
              selectedRam={filters.ramGb}
              selectedStorage={filters.storage}
              onRamToggle={(ram) => toggleArrayFilter('ramGb', ram)}
              onStorageToggle={(storage) => toggleArrayFilter('storage', storage)}
            />

            {/* Stock Filter */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Availability</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="stock"
                    checked={filters.inStock === true}
                    onChange={() => updateFilter('inStock', true)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">In Stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="stock"
                    checked={filters.inStock === false}
                    onChange={() => updateFilter('inStock', false)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Out of Stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="stock"
                    checked={filters.inStock === null}
                    onChange={() => updateFilter('inStock', null)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">All</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
