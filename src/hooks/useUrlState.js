import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useUrlState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [urlState, setUrlState] = useState({});

  // Initialize state from URL
  useEffect(() => {
    const state = {};
    for (const [key, value] of searchParams.entries()) {
      if (
        key === "brand" ||
        key === "condition" ||
        key === "ramGb" ||
        key === "storage"
      ) {
        state[key] = value.split(",");
      } else if (key === "minPrice" || key === "maxPrice") {
        state[key] = value;
      } else if (key === "inStock") {
        state[key] = value === "true";
      } else if (key === "sortBy" || key === "sortOrder") {
        state[key] = value;
      } else if (key === "q") {
        state.searchQuery = value;
      }
    }
    setUrlState(state);
  }, [searchParams]);

  // Update URL with current state
  const updateUrl = (newState) => {
    const params = new URLSearchParams();

    Object.entries(newState).forEach(([key, value]) => {
      if (key === "searchQuery") {
        if (value) params.set("q", value);
      } else if (Array.isArray(value) && value.length > 0) {
        params.set(key, value.join(","));
      } else if (typeof value === "string" && value.trim()) {
        params.set(key, value);
      } else if (typeof value === "boolean" && value !== null) {
        params.set(key, value.toString());
      }
    });

    setSearchParams(params);
  };

  return { urlState, updateUrl };
};
