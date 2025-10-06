import React from "react";

export default function ActiveFilters({ filters, onRemove }) {
  if (filters.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Active Filters</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            <span className="capitalize">
              {filter.key}: {filter.value}
            </span>
            <button
              onClick={() => onRemove(filter.key, filter.value)}
              className="ml-1 hover:text-blue-600"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
