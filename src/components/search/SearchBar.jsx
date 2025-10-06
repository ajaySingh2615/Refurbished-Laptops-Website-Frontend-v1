import React from 'react';

import { useState, useRef, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch.js';
import SearchSuggestions from './SearchSuggestions.jsx';
import SearchHistory from './SearchHistory.jsx';

export default function SearchBar({ onSearch, placeholder = 'Search laptops...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const { searchQuery, setSearchQuery, suggestions, generateSuggestions, clearSearch } =
    useSearch();

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    generateSuggestions(value);
    setIsOpen(value.length > 0);
  };

  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      // persist to history
      try {
        const prev = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const next = [q, ...prev.filter((t) => t !== q)].slice(0, 10);
        localStorage.setItem('searchHistory', JSON.stringify(next));
      } catch {}
      onSearch(q);
      setIsOpen(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    // persist to history
    try {
      const prev = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const next = [suggestion, ...prev.filter((t) => t !== suggestion)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(next));
    } catch {}
    onSearch(suggestion);
    setIsOpen(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          handleSuggestionSelect(suggestions[focusedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className="relative w-full z-30">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
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
        </div>

        {/* Clear Button */}
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg
              className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
        )}
      </form>

      {/* Suggestions or History Dropdown */}
      {isOpen && (
        <>
          <SearchSuggestions
            ref={suggestionsRef}
            suggestions={suggestions}
            focusedIndex={focusedIndex}
            onSelect={handleSuggestionSelect}
          />
          {!searchQuery && (
            <SearchHistory
              items={JSON.parse(localStorage.getItem('searchHistory') || '[]')}
              onSelect={handleSuggestionSelect}
              onClear={() => localStorage.removeItem('searchHistory')}
            />
          )}
        </>
      )}
    </div>
  );
}
