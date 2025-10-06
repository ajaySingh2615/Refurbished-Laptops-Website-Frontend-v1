import React from "react";
import { useState, useEffect } from "react";

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}) {
  const [localMin, setLocalMin] = useState(minPrice || "");
  const [localMax, setLocalMax] = useState(maxPrice || "");

  useEffect(() => {
    setLocalMin(minPrice || "");
    setLocalMax(maxPrice || "");
  }, [minPrice, maxPrice]);

  const handleMinChange = (e) => {
    const value = e.target.value;
    setLocalMin(value);
    onMinPriceChange(value);
  };

  const handleMaxChange = (e) => {
    const value = e.target.value;
    setLocalMax(value);
    onMaxPriceChange(value);
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Price Range (₹)
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Min Price
            </label>
            <input
              type="number"
              value={localMin}
              onChange={handleMinChange}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Max Price
            </label>
            <input
              type="number"
              value={localMax}
              onChange={handleMaxChange}
              placeholder="100000"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Price Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Under ₹25k", min: "", max: "25000" },
            { label: "₹25k-50k", min: "25000", max: "50000" },
            { label: "₹50k-75k", min: "50000", max: "75000" },
            { label: "Above ₹75k", min: "75000", max: "" },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => {
                onMinPriceChange(range.min);
                onMaxPriceChange(range.max);
              }}
              className={`px-3 py-1 text-xs rounded-full border ${
                localMin === range.min && localMax === range.max
                  ? "bg-blue-100 text-blue-800 border-blue-300"
                  : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
