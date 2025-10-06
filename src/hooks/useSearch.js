import { useState, useEffect, useCallback } from "react";
import { apiService } from "../services/api.js";

export const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  // Save search history
  const saveToHistory = useCallback(
    (query) => {
      if (!query.trim()) return;

      const newHistory = [
        query,
        ...searchHistory.filter((item) => item !== query),
      ].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    },
    [searchHistory],
  );

  // Search products
  const searchProducts = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await apiService.searchProducts(query);
        setSearchResults(response.products);
        saveToHistory(query);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [saveToHistory],
  );

  // Generate suggestions based on search history and popular terms
  const generateSuggestions = useCallback(
    (query) => {
      if (!query.trim()) {
        setSuggestions(searchHistory.slice(0, 5));
        return;
      }

      const popularTerms = [
        "Dell",
        "Lenovo",
        "HP",
        "i5",
        "i7",
        "8GB",
        "16GB",
        "SSD",
        "HDD",
      ];
      const filtered = popularTerms
        .filter((term) => term.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);

      setSuggestions(filtered);
    },
    [searchHistory],
  );

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    searchHistory,
    suggestions,
    searchProducts,
    generateSuggestions,
    clearSearch: () => {
      setSearchQuery("");
      setSearchResults([]);
      setSuggestions([]);
    },
  };
};
