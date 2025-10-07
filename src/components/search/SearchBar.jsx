import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useSearch } from '../../hooks/useSearch.js';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
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
      } catch (error) {
        console.warn('Failed to save search history:', error);
      }
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
    } catch (error) {
      console.warn('Failed to save search history:', error);
    }
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

  // Debounced live search with stable onSearch reference
  useEffect(() => {
    const q = searchQuery.trim();
    // if cleared, reset immediately
    if (q.length === 0) {
      onSearch('');
      return;
    }
    const id = setTimeout(() => {
      // trigger live search for >=2 chars
      if (q.length >= 2) {
        onSearch(q);
      }
    }, 500); // Increased debounce time to reduce API calls
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Removed onSearch from dependencies to prevent infinite loops

  return (
    <div ref={searchRef} className="relative w-full z-[70]">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          <Input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="pl-12 pr-24 h-12 bg-white/90 backdrop-blur-md border-2 border-slate-200/60 rounded-xl shadow-lg shadow-slate-200/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:shadow-xl focus:shadow-blue-500/20 transition-all duration-300 text-slate-700 placeholder:text-slate-400"
          />

          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-sm">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Clear Button */}
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                clearSearch();
                setIsOpen(false);
              }}
              className="absolute inset-y-0 right-16 h-12 w-12 text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 rounded-lg transition-all duration-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          )}

          {/* Search Button */}
          <Button
            type="submit"
            className="absolute inset-y-0 right-0 h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-r-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 border-0"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Suggestions or History Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 z-[80]">
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
        </div>
      )}
    </div>
  );
}
