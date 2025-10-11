import React from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/formatters';
import { motion } from 'framer-motion';
import { apiService } from '../services/api.js';
import AddToCartButton from './cart/AddToCartButton.jsx';

export default function ProductCard({ product }) {
  const [productImages, setProductImages] = React.useState([]);
  const [imageLoading, setImageLoading] = React.useState(true);
  const [reviewStats, setReviewStats] = React.useState(null);
  const [reviewLoading, setReviewLoading] = React.useState(true);

  // Fetch product images
  React.useEffect(() => {
    const fetchImages = async () => {
      try {
        setImageLoading(true);
        const response = await apiService.getProductImages(product.id);
        setProductImages(response.images || []);
      } catch (error) {
        console.error('Failed to fetch product images:', error);
        setProductImages([]);
      } finally {
        setImageLoading(false);
      }
    };

    if (product.id) {
      fetchImages();
    }
  }, [product.id]);

  // Fetch review stats
  React.useEffect(() => {
    const fetchReviewStats = async () => {
      try {
        setReviewLoading(true);
        const response = await apiService.getProductReviewStats(product.id);
        // Extract the data from the response
        setReviewStats(response.data || response);
      } catch (error) {
        console.error('Failed to fetch review stats:', error);
        setReviewStats(null);
      } finally {
        setReviewLoading(false);
      }
    };

    if (product.id) {
      fetchReviewStats();
    }
  }, [product.id]);

  // Get primary image or first image
  const primaryImage = React.useMemo(() => {
    if (productImages.length === 0) return null;
    return productImages.find((img) => img.isPrimary) || productImages[0];
  }, [productImages]);

  // Calculate discount amount and percentage
  const originalPrice = product.originalPrice || product.price * 1.5; // Mock original price
  const discountAmount = originalPrice - product.price;
  const discountPercentage = Math.round((discountAmount / originalPrice) * 100);

  // Real review data
  const hasReviews = reviewStats && reviewStats.totalReviews > 0;
  const averageRating = hasReviews ? reviewStats.averageRating.toFixed(1) : null;

  // Mock data for demonstration (keep for other features)
  const stockLeft = product.inStock ? Math.floor(Math.random() * 5) + 1 : 0;
  const isFlashSale = Math.random() > 0.7;
  const isLowestPrice = Math.random() > 0.5;

  return (
    <div
      className="rounded-lg transition-all duration-300 overflow-hidden h-full flex flex-col"
      style={{ backgroundColor: '#f8f6f3' }}
    >
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
        <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          {imageLoading ? (
            <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </div>
          ) : primaryImage ? (
            <img
              src={primaryImage.cloudinaryUrl}
              alt={primaryImage.altText || product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}

          {/* Fallback when no image or image fails to load */}
          <div
            className="w-full h-full flex items-center justify-center bg-slate-200"
            style={{ display: primaryImage ? 'none' : 'flex' }}
          >
            <div className="w-16 h-16 bg-slate-300 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </div>
          </div>
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
            {hasReviews ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-600">{averageRating}</span>
                <span className="text-yellow-500">⭐</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">⭐ Be the first to review</span>
              </div>
            )}
          </div>
        </div>

        {/* Price Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-sm font-semibold">-{discountPercentage}%</span>
            <span className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm line-through">
              ₹{originalPrice.toLocaleString()}
            </span>
          </div>

          {/* Add to Cart Button */}
          <div className="pt-2">
            <AddToCartButton productId={product.id} size="sm" className="w-full" />
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
            className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-center py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-md hover:shadow-slate-900/20 relative overflow-hidden group"
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
