import React from 'react';

export default function SearchHistory({ items = [], onSelect, onClear }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="absolute z-40 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg shadow-slate-200/50">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <span className="text-xs font-medium text-slate-600">Recent searches</span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          Clear
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {items.map((term, idx) => (
          <button
            key={`${term}-${idx}`}
            onClick={() => onSelect(term)}
            className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              className="h-3 w-3 text-slate-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="truncate">{term}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
