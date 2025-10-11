import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  // Calculate discount amount and percentage
  const originalPrice = product.originalPrice || product.price * 1.5; // Mock original price
  const discountAmount = originalPrice - product.price;
  const discountPercentage = Math.round((discountAmount / originalPrice) * 100);

  // Mock data for demonstration
  const rating = (4.0 + Math.random() * 1.0).toFixed(1);
  const stockLeft = product.inStock ? Math.floor(Math.random() * 5) + 1 : 0;
  const isFlashSale = Math.random() > 0.7;
  const isLowestPrice = Math.random() > 0.5;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-100 h-full flex flex-col">
      {/* Product Image */}
      <div className="px-3 pt-3 pb-2 relative">
        {/* Stock Counter - positioned over image */}
        {stockLeft > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full shadow-sm">
              {stockLeft} left
            </span>
          </div>
        )}
        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="w-16 h-16 bg-slate-300 rounded-lg flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </div>
          {/* Mock laptop screen content */}
          <div className="absolute inset-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded opacity-20"></div>
        </div>
      </div>

      {/* Discount Amount */}
      <div className="px-3 pb-1">
        <span className="text-green-600 text-sm font-semibold">
          ₹{discountAmount.toLocaleString()} OFF
        </span>
      </div>

      {/* Product Title - Fixed height */}
      <div className="px-3 pb-2 h-12 flex items-start">
        <h3 className="font-semibold text-sm text-slate-900 leading-tight line-clamp-2">
          {product.title}
        </h3>
      </div>

      {/* Pricing and Rating Section - Flexible height */}
      <div className="px-3 pb-3 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isFlashSale ? (
              <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">
                Flash Sale
              </span>
            ) : isLowestPrice ? (
              <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                Lowest Price
              </span>
            ) : null}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-600">{rating}</span>
              <span className="text-yellow-500">⭐</span>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-sm font-semibold">-{discountPercentage}%</span>
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* View Details Link - Fixed at bottom */}
      <div className="px-3 pb-3 mt-auto">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Link
            to={`/product/${encodeURIComponent(product.sku)}`}
            className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-center py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/25 relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: '-100%' }}
              whileHover={{ x: '0%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
            <span className="relative z-10">View Details</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
