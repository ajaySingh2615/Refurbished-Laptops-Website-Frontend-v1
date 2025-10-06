import React from 'react';

export default function SpecFilter({ selectedRam, selectedStorage, onRamToggle, onStorageToggle }) {
  const ramOptions = [4, 8, 16, 32];
  const storageOptions = ['SSD', 'HDD', 'NVMe'];

  return (
    <div className="space-y-4">
      {/* RAM Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">RAM</h3>
        <div className="grid grid-cols-2 gap-2">
          {ramOptions.map((ram) => (
            <label key={ram} className="flex items-center">
              <input
                type="checkbox"
                checked={Array.isArray(selectedRam) && selectedRam.includes(ram)}
                onChange={() => onRamToggle(ram)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{ram}GB</span>
            </label>
          ))}
        </div>
      </div>

      {/* Storage Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Storage Type</h3>
        <div className="space-y-2">
          {storageOptions.map((storage) => (
            <label key={storage} className="flex items-center">
              <input
                type="checkbox"
                checked={Array.isArray(selectedStorage) && selectedStorage.includes(storage)}
                onChange={() => onStorageToggle(storage)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{storage}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
