import React from 'react';
import { motion } from 'framer-motion';

export default function ConditionFilter({ selectedConditions, onConditionToggle }) {
  const conditions = [
    { value: 'Refurbished-A', label: 'Refurbished A (Excellent)' },
    { value: 'Refurbished-B', label: 'Refurbished B (Good)' },
    { value: 'Refurbished-C', label: 'Refurbished C (Fair)' },
    { value: 'Used', label: 'Used' },
  ];

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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Condition
      </h3>
      <div className="space-y-1.5">
        {conditions.map((condition, index) => (
          <motion.label
            key={condition.value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={
                Array.isArray(selectedConditions) && selectedConditions.includes(condition.value)
              }
              onChange={() => onConditionToggle(condition.value)}
              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all duration-200"
            />
            <span className="ml-2 text-xs text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
              {condition.label}
            </span>
          </motion.label>
        ))}
      </div>
    </div>
  );
}
