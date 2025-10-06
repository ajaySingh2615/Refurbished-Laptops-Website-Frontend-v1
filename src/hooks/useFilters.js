import { useState, useCallback } from "react";

export const useFilters = () => {
  const [filters, setFilters] = useState({
    brand: [],
    condition: [],
    minPrice: "",
    maxPrice: "",
    ramGb: [],
    storage: [],
    inStock: null,
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Update a specific filter
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Toggle array-based filters (brand, condition, ramGb, storage)
  const toggleArrayFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      brand: [],
      condition: [],
      minPrice: "",
      maxPrice: "",
      ramGb: [],
      storage: [],
      inStock: null,
    });
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: Array.isArray(prev[key]) ? [] : "",
    }));
  }, []);

  // Get active filter count
  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        count += value.length;
      } else if (typeof value === "string" && value.trim()) {
        count += 1;
      } else if (typeof value === "boolean" && value !== null) {
        count += 1;
      }
    });
    return count;
  }, [filters]);

  // Get active filters for display
  const getActiveFilters = useCallback(() => {
    const active = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((item) =>
          active.push({ key, value: item, type: "array" }),
        );
      } else if (typeof value === "string" && value.trim()) {
        active.push({ key, value, type: "string" });
      } else if (typeof value === "boolean" && value !== null) {
        active.push({
          key,
          value: value ? "In Stock" : "Out of Stock",
          type: "boolean",
        });
      }
    });
    return active;
  }, [filters]);

  return {
    filters,
    sortBy,
    sortOrder,
    updateFilter,
    toggleArrayFilter,
    clearFilters,
    clearFilter,
    setSortBy,
    setSortOrder,
    getActiveFilterCount,
    getActiveFilters,
  };
};
