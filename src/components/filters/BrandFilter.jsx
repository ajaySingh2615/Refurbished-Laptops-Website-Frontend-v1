import React from 'react';

export default function BrandFilter({ brands, selectedBrands, onBrandToggle, loading }) {
  if (loading) {
    return (
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Brand</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Brand</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {brands.map((brand) => (
          <label key={brand} className="flex items-center">
            <input
              type="checkbox"
              checked={Array.isArray(selectedBrands) && selectedBrands.includes(brand)}
              onChange={() => onBrandToggle(brand)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700 capitalize">{brand}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
