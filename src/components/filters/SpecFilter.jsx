import React from 'react';
import { motion } from 'framer-motion';

export default function SpecFilter({ selectedRam, selectedStorage, onRamToggle, onStorageToggle }) {
  const ramOptions = [4, 8, 16, 32];
  const storageOptions = ['SSD', 'HDD', 'NVMe'];

  return (
    <div className="space-y-4">
      {/* RAM Filter */}
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
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
          </svg>
          RAM
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {ramOptions.map((ram, index) => (
            <motion.label
              key={ram}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={Array.isArray(selectedRam) && selectedRam.includes(ram)}
                onChange={() => onRamToggle(ram)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all duration-200"
              />
              <span className="ml-2 text-xs text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
                {ram}GB
              </span>
            </motion.label>
          ))}
        </div>
      </div>

      {/* Storage Filter */}
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
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
            />
          </svg>
          Storage Type
        </h3>
        <div className="space-y-1.5">
          {storageOptions.map((storage, index) => (
            <motion.label
              key={storage}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={Array.isArray(selectedStorage) && selectedStorage.includes(storage)}
                onChange={() => onStorageToggle(storage)}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all duration-200"
              />
              <span className="ml-2 text-xs text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
                {storage}
              </span>
            </motion.label>
          ))}
        </div>
      </div>
    </div>
  );
}
