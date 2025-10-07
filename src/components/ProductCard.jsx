import React from 'react';

import { Link } from 'react-router-dom';
import { formatPrice, truncateText } from '../utils/formatters';

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="aspect-video bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500 text-sm">Product Image</span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>

        <div className="space-y-1 text-sm text-gray-600 mb-3">
          <p>
            <span className="font-medium">Brand:</span> {product.brand}
          </p>
          {product.cpu && (
            <p>
              <span className="font-medium">CPU:</span> {product.cpu}
            </p>
          )}
          {product.ramGb && (
            <p>
              <span className="font-medium">RAM:</span> {product.ramGb}GB
            </p>
          )}
          {product.storage && (
            <p>
              <span className="font-medium">Storage:</span> {product.storage}
            </p>
          )}
          <p>
            <span className="font-medium">Condition:</span> {product.condition}
          </p>
        </div>

        {product.description && (
          <p className="text-sm text-gray-700 mb-3">{truncateText(product.description, 80)}</p>
        )}

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-green-600">{formatPrice(product.price)}</span>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        <Link
          to={`/product/${encodeURIComponent(product.sku)}`}
          className="block w-full mt-3 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
