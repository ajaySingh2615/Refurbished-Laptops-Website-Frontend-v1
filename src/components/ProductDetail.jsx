import React from 'react';

import { formatPrice, formatDate } from '../utils/formatters.js';

export default function ProductDetail({ product, loading, error }) {
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">Product Image</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-2xl font-bold text-green-600 mb-4">{formatPrice(product.price)}</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Specifications */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Specifications</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">Brand:</span>
              <span className="ml-2">{product.brand}</span>
            </div>
            {product.model && (
              <div>
                <span className="font-medium">Model:</span>
                <span className="ml-2">{product.model}</span>
              </div>
            )}
            {product.sku && (
              <div>
                <span className="font-medium">SKU:</span>
                <span className="ml-2">{product.sku}</span>
              </div>
            )}
            {product.cpu && (
              <div>
                <span className="font-medium">CPU:</span>
                <span className="ml-2">{product.cpu}</span>
              </div>
            )}
            {product.gpu && (
              <div>
                <span className="font-medium">GPU:</span>
                <span className="ml-2">{product.gpu}</span>
              </div>
            )}
            {product.ramGb && (
              <div>
                <span className="font-medium">RAM:</span>
                <span className="ml-2">{product.ramGb}GB</span>
              </div>
            )}
            {product.storage && (
              <div>
                <span className="font-medium">Storage:</span>
                <span className="ml-2">{product.storage}</span>
              </div>
            )}
            {product.displaySizeInches && (
              <div>
                <span className="font-medium">Display:</span>
                <span className="ml-2">
                  {product.displaySizeInches}" {product.displayResolution} {product.displayPanel}
                </span>
              </div>
            )}
            {product.displayRefreshHz && (
              <div>
                <span className="font-medium">Refresh:</span>
                <span className="ml-2">{product.displayRefreshHz}Hz</span>
              </div>
            )}
            {product.brightnessNits && (
              <div>
                <span className="font-medium">Brightness:</span>
                <span className="ml-2">{product.brightnessNits} nits</span>
              </div>
            )}
            {product.os && (
              <div>
                <span className="font-medium">OS:</span>
                <span className="ml-2">{product.os}</span>
              </div>
            )}
            {product.keyboardLayout && (
              <div>
                <span className="font-medium">Keyboard:</span>
                <span className="ml-2">{product.keyboardLayout}</span>
              </div>
            )}
            {product.color && (
              <div>
                <span className="font-medium">Color:</span>
                <span className="ml-2">{product.color}</span>
              </div>
            )}
            {product.weightKg && (
              <div>
                <span className="font-medium">Weight:</span>
                <span className="ml-2">{product.weightKg} kg</span>
              </div>
            )}
            {product.dimensionsMm && (
              <div>
                <span className="font-medium">Dimensions:</span>
                <span className="ml-2">{product.dimensionsMm}</span>
              </div>
            )}
            <div>
              <span className="font-medium">Condition:</span>
              <span className="ml-2">{product.condition}</span>
            </div>
          </div>
          {(product.cosmeticNotes || product.functionalNotes) && (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              {product.cosmeticNotes && (
                <p>
                  <span className="font-medium">Cosmetic:</span> {product.cosmeticNotes}
                </p>
              )}
              {product.functionalNotes && (
                <p>
                  <span className="font-medium">Functional:</span> {product.functionalNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Highlights & Description */}
        {product.highlights && (
          <div>
            <h3 className="font-semibold mb-2">Highlights</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              {product.highlights.split('\n').map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          </div>
        )}
        {/* Description */}
        {product.description && (
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
              product.inStock
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button className="w-full py-3 px-6 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            Add to Wishlist
          </button>
        </div>

        {/* Pricing & Policy */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Pricing & Policy</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {product.mrp && (
              <div>
                <span className="font-medium">MRP:</span>
                <span className="ml-2">{formatPrice(product.mrp)}</span>
              </div>
            )}
            {typeof product.discountPercent !== 'undefined' && (
              <div>
                <span className="font-medium">Discount:</span>
                <span className="ml-2">{product.discountPercent}%</span>
              </div>
            )}
            {typeof product.gstPercent !== 'undefined' && (
              <div>
                <span className="font-medium">GST:</span>
                <span className="ml-2">{product.gstPercent}%</span>
              </div>
            )}
            {typeof product.stockQty !== 'undefined' && (
              <div>
                <span className="font-medium">Stock:</span>
                <span className="ml-2">{product.stockQty}</span>
              </div>
            )}
            {product.warrantyMonths && (
              <div>
                <span className="font-medium">Warranty:</span>
                <span className="ml-2">{product.warrantyMonths} months</span>
              </div>
            )}
            {product.returnWindowDays && (
              <div>
                <span className="font-medium">Return Policy:</span>
                <span className="ml-2">{product.returnWindowDays} days</span>
              </div>
            )}
            {product.fulfillmentLocation && (
              <div>
                <span className="font-medium">Ships From:</span>
                <span className="ml-2">{product.fulfillmentLocation}</span>
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Added: {formatDate(product.createdAt)}</p>
          {product.updatedAt !== product.createdAt && (
            <p>Updated: {formatDate(product.updatedAt)}</p>
          )}
        </div>
      </div>
    </div>
  );
}
