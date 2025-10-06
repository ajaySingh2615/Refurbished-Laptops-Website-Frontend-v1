import React from "react";

import { useState } from "react";

export default function SortDropdown({ sortBy, sortOrder, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: "createdAt", label: "Newest First", order: "desc" },
    { value: "createdAt", label: "Oldest First", order: "asc" },
    { value: "price", label: "Price: Low to High", order: "asc" },
    { value: "price", label: "Price: High to Low", order: "desc" },
    { value: "title", label: "Name: A to Z", order: "asc" },
    { value: "title", label: "Name: Z to A", order: "desc" },
  ];

  const currentOption = sortOptions.find(
    (option) => option.value === sortBy && option.order === sortOrder,
  );

  const handleOptionSelect = (option) => {
    onSortChange(option.value, option.order);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
      >
        <svg
          className="h-5 w-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {currentOption?.label || "Sort by"}
        </span>
        <svg
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-56 bg-white border border-gray-300 rounded-lg shadow-lg">
          {sortOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
                option.value === sortBy && option.order === sortOrder
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700"
              } ${index === 0 ? "rounded-t-lg" : ""} ${
                index === sortOptions.length - 1 ? "rounded-b-lg" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
