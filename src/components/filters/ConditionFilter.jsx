import React from 'react';

export default function ConditionFilter({ selectedConditions, onConditionToggle }) {
  const conditions = [
    { value: 'Refurbished-A', label: 'Refurbished A (Excellent)' },
    { value: 'Refurbished-B', label: 'Refurbished B (Good)' },
    { value: 'Refurbished-C', label: 'Refurbished C (Fair)' },
    { value: 'Used', label: 'Used' },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Condition</h3>
      <div className="space-y-2">
        {conditions.map((condition) => (
          <label key={condition.value} className="flex items-center">
            <input
              type="checkbox"
              checked={
                Array.isArray(selectedConditions) && selectedConditions.includes(condition.value)
              }
              onChange={() => onConditionToggle(condition.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">{condition.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
