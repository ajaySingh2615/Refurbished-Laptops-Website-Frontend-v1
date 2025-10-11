import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PriceRangeFilter({
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
}) {
  const [localMin, setLocalMin] = useState(minPrice || '');
  const [localMax, setLocalMax] = useState(maxPrice || '');

  useEffect(() => {
    setLocalMin(minPrice || '');
    setLocalMax(maxPrice || '');
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
      <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <svg
          className="w-3 h-3 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
        Price Range
      </h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Min</label>
            <input
              type="number"
              value={localMin}
              onChange={handleMinChange}
              placeholder="0"
              min="0"
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Max</label>
            <input
              type="number"
              value={localMax}
              onChange={handleMaxChange}
              placeholder="100k"
              min="0"
              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80"
            />
          </div>
        </div>

        {/* Quick Price Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Under ₹25k', min: '', max: '25000' },
            { label: '₹25k-50k', min: '25000', max: '50000' },
            { label: '₹50k-75k', min: '50000', max: '75000' },
            { label: 'Above ₹75k', min: '75000', max: '' },
          ].map((range, index) => (
            <motion.button
              key={range.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onMinPriceChange(range.min);
                onMaxPriceChange(range.max);
              }}
              className={`px-2.5 py-1 text-xs rounded-full border transition-all duration-200 ${
                localMin === range.min && localMax === range.max
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {range.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
