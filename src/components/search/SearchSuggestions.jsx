import React from 'react';

import { forwardRef } from 'react';

const SearchSuggestions = forwardRef(({ suggestions, focusedIndex, onSelect }, ref) => {
  if (suggestions.length === 0) return null;

  return (
    <div
      ref={ref}
      className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg shadow-slate-200/50 max-h-48 overflow-y-auto"
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className={`w-full px-3 py-2 text-left transition-colors duration-200 flex items-center gap-2 ${
            index === focusedIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
          }`}
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="truncate text-sm">{suggestion}</span>
        </button>
      ))}
    </div>
  );
});

SearchSuggestions.displayName = 'SearchSuggestions';

export default SearchSuggestions;
