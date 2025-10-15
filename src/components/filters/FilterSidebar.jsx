import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api.js';
import { Button } from '../ui/Button.jsx';
import PriceRangeFilter from './PriceRangeFilter.jsx';
import BrandFilter from './BrandFilter.jsx';
import ConditionFilter from './ConditionFilter.jsx';
import SpecFilter from './SpecFilter.jsx';
import CategoryFilter from './CategoryFilter.jsx';
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
        fixed lg:static inset-y-0 left-0 z-50 w-4/5 max-w-xs lg:w-72 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white lg:bg-transparent shadow-xl lg:shadow-none
      `}
      >
        <div className="h-full overflow-y-auto p-4 lg:p-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
            <div className="flex items-center space-x-2">
              {activeFilters.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {activeFilters.length}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Clear
              </button>
              <button onClick={onClose} className="lg:hidden p-1 hover:bg-slate-100 rounded">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="mb-4">
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
          <div className="space-y-4">
            {/* Category Filter */}
            <CategoryFilter
              selectedCategory={filters.category}
              onCategoryChange={(category) => updateFilter('category', category)}
            />

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
              <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg
                  className="w-3 h-3 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Availability
              </h3>
              <div className="space-y-1.5">
                {[
                  { value: true, label: 'In Stock' },
                  { value: false, label: 'Out of Stock' },
                  { value: null, label: 'All' },
                ].map((option, index) => (
                  <motion.label
                    key={option.label}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="stock"
                      checked={filters.inStock === option.value}
                      onChange={() => updateFilter('inStock', option.value)}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300 transition-all duration-200"
                    />
                    <span className="ml-2 text-xs text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
                      {option.label}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
