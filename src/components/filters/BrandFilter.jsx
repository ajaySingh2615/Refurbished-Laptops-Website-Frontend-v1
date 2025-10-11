import React from 'react';
import { motion } from 'framer-motion';

export default function BrandFilter({ brands, selectedBrands, onBrandToggle, loading }) {
  if (loading) {
    return (
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Brand
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
        Brand
      </h3>
      <div
        className="space-y-1.5 max-h-48 overflow-y-auto brand-filter-scroll"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9',
        }}
      >
        {brands.map((brand, index) => (
          <motion.label
            key={brand}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={Array.isArray(selectedBrands) && selectedBrands.includes(brand)}
              onChange={() => onBrandToggle(brand)}
              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all duration-200"
            />
            <span className="ml-2 text-xs text-slate-700 capitalize group-hover:text-slate-900 transition-colors duration-200">
              {brand}
            </span>
          </motion.label>
        ))}
      </div>
    </div>
  );
}
