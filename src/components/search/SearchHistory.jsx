import React from 'react';

export default function SearchHistory({ items = [], onSelect, onClear }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="absolute z-40 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-xs text-gray-500">Recent searches</span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          Clear
        </button>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {items.map((term, idx) => (
          <button
            key={`${term}-${idx}`}
            onClick={() => onSelect(term)}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
