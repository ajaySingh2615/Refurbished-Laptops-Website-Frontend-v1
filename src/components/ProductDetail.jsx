import React from 'react';
import { motion } from 'framer-motion';
import { formatPrice, formatDate } from '../utils/formatters.js';
import RelatedProducts from './RelatedProducts.jsx';
import ProductReviews from './ProductReviews.jsx';
import { apiService } from '../services/api.js';
import { Button } from './ui/Button.jsx';
import { Input } from './ui/Input.jsx';

export default function ProductDetail({ product, loading, error }) {
  const [productImages, setProductImages] = React.useState([]);
  const [imageLoading, setImageLoading] = React.useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [reviewStats, setReviewStats] = React.useState(null);
  const [reviewLoading, setReviewLoading] = React.useState(true);

  // Fetch product images
  React.useEffect(() => {
    const fetchImages = async () => {
      if (!product?.id) return;

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

    fetchImages();
  }, [product?.id]);

  // Fetch review stats
  React.useEffect(() => {
    const fetchReviewStats = async () => {
      if (!product?.id) return;

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

    fetchReviewStats();
  }, [product?.id]);

  // Get primary image or first image
  const primaryImage = React.useMemo(() => {
    if (productImages.length === 0) return null;
    return productImages.find((img) => img.isPrimary) || productImages[0];
  }, [productImages]);

  // Move all hooks to the top, before any conditional returns
  const variants = React.useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product?.variants],
  );

  const variantSets = React.useMemo(() => {
    const colors = new Set();
    const rams = new Set();
    const storages = new Set();
    for (const v of variants) {
      const a = v.attributes || {};
      if (a.color) colors.add(a.color);
      if (typeof a.ramGb === 'number') rams.add(a.ramGb);
      if (a.storage) storages.add(a.storage);
    }
    return {
      colors: Array.from(colors),
      rams: Array.from(rams).sort((a, b) => a - b),
      storages: Array.from(storages),
    };
  }, [variants]);

  // Selected attributes/variant
  const initialSelected = React.useMemo(() => {
    const pre = product?.selectedVariant;
    const a = pre?.attributes || {};
    return {
      color: a.color || variantSets.colors[0] || null,
      ramGb: typeof a.ramGb === 'number' ? a.ramGb : variantSets.rams[0] || null,
      storage: a.storage || variantSets.storages[0] || null,
    };
  }, [product?.selectedVariant, variantSets]);

  const [sel, setSel] = React.useState(initialSelected);
  React.useEffect(() => {
    setSel(initialSelected);
  }, [initialSelected]);

  const selectedVariant = React.useMemo(() => {
    if (!variants.length) return null;
    return (
      variants.find((v) => {
        const a = v.attributes || {};
        const matchesColor = sel.color ? a.color === sel.color : true;
        const matchesRam = sel.ramGb ? a.ramGb === sel.ramGb : true;
        const matchesStorage = sel.storage ? a.storage === sel.storage : true;
        return matchesColor && matchesRam && matchesStorage;
      }) || null
    );
  }, [variants, sel]);

  // Now handle conditional returns after all hooks
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

  // Effective values from selected variant (fallback to base product)
  const effPrice = selectedVariant?.price ?? product.price;
  const effRamGb =
    typeof selectedVariant?.attributes?.ramGb === 'number'
      ? selectedVariant.attributes.ramGb
      : product.ramGb;
  const effStorage = selectedVariant?.attributes?.storage || product.storage;
  const effColor = selectedVariant?.attributes?.color || product.color;

  // Build specification rows
  const specRows = [
    ['Brand', product.brand],
    ['Model', product.model],
    ['SKU', selectedVariant?.sku || product.sku],
    ['CPU', product.cpu],
    ['GPU', product.gpu],
    ['RAM', typeof effRamGb === 'number' ? `${effRamGb} GB` : undefined],
    ['Storage', effStorage],
    ['Color', effColor],
    [
      'Display',
      product.displaySizeInches
        ? `${product.displaySizeInches}" ${product.displayResolution || ''} ${product.displayPanel || ''}`.trim()
        : undefined,
    ],
    ['Refresh Rate', product.displayRefreshHz ? `${product.displayRefreshHz} Hz` : undefined],
    ['Brightness', product.brightnessNits ? `${product.brightnessNits} nits` : undefined],
    ['OS', product.os],
    ['Keyboard', product.keyboardLayout],
    ['Weight', product.weightKg ? `${product.weightKg} kg` : undefined],
    ['Dimensions', product.dimensionsMm],
    ['Ports', product.ports],
    ['Battery Health', product.batteryHealthPct ? `${product.batteryHealthPct}%` : undefined],
    ['Battery Cycles', product.batteryCycles],
    ['Condition', product.condition],
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');

  const mrp = product.mrp ? Number(product.mrp) : null;
  const price = typeof effPrice !== 'undefined' && effPrice !== null ? Number(effPrice) : null;
  const discountPct =
    typeof product.discountPercent === 'number'
      ? product.discountPercent
      : mrp && price
        ? Math.round(((mrp - price) / mrp) * 100)
        : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f6f3' }}>
      <div className="max-w-7xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left: Media */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="sticky top-4">
              {/* Main Image */}
              <motion.div
                className="aspect-square bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 flex items-center justify-center relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {imageLoading ? (
                  <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                  </div>
                ) : productImages.length > 0 ? (
                  <img
                    src={productImages[selectedImageIndex]?.cloudinaryUrl}
                    alt={productImages[selectedImageIndex]?.altText || product.title}
                    className="w-full h-full object-cover rounded-2xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Fallback when no image or image fails to load */}
                <div
                  className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl"
                  style={{ display: productImages.length > 0 ? 'none' : 'flex' }}
                >
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 text-slate-400 mx-auto mb-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                    </svg>
                    <span className="text-slate-500 text-sm">No Image Available</span>
                  </div>
                </div>
              </motion.div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <motion.div
                  className="mt-4 grid grid-cols-5 gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  {productImages.slice(0, 5).map((image, index) => (
                    <motion.button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        selectedImageIndex === index
                          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src={image.cloudinaryUrl}
                        alt={image.altText || `${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Product Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3 leading-tight">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <motion.span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    product.inStock
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </motion.span>
                {typeof product.stockQty === 'number' &&
                  product.stockQty <= 5 &&
                  product.stockQty > 0 && (
                    <motion.span
                      className="text-sm text-red-600 font-medium bg-red-50 px-2 py-1 rounded-lg"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Only {product.stockQty} left
                    </motion.span>
                  )}
              </div>
            </motion.div>

            {/* Product Options & Pricing */}
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {/* Variant selectors */}
              {variants.length > 0 && (
                <div className="space-y-4 mb-6">
                  {variantSets.colors.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-slate-800 mb-2">Color</div>
                      <div className="flex flex-wrap gap-2">
                        {variantSets.colors.map((c, index) => (
                          <motion.button
                            key={`color-${c}-${index}`}
                            onClick={() => setSel((s) => ({ ...s, color: c }))}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                              sel.color === c
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-md'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {c}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  {variantSets.rams.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-slate-800 mb-2">RAM</div>
                      <div className="flex flex-wrap gap-2">
                        {variantSets.rams.map((r, index) => (
                          <motion.button
                            key={`ram-${r}-${index}`}
                            onClick={() => setSel((s) => ({ ...s, ramGb: r }))}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                              sel.ramGb === r
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-md'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {r} GB
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  {variantSets.storages.length > 0 && (
                    <div>
                      <div className="text-sm font-semibold text-slate-800 mb-2">Storage</div>
                      <div className="flex flex-wrap gap-2">
                        {variantSets.storages.map((st, index) => (
                          <motion.button
                            key={`storage-${st}-${index}`}
                            onClick={() => setSel((s) => ({ ...s, storage: st }))}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                              sel.storage === st
                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-md'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {st}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedVariant && (
                    <div className="text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                      Selected SKU:{' '}
                      <span className="font-mono text-slate-700">{selectedVariant.sku}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing */}
              <div className="flex items-end gap-4 mb-4">
                {price !== null && (
                  <motion.div
                    className="text-4xl font-bold text-slate-900"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    {formatPrice(price)}
                  </motion.div>
                )}
                {mrp && (
                  <div className="text-lg text-slate-500 line-through">{formatPrice(mrp)}</div>
                )}
                {discountPct !== null && discountPct > 0 && (
                  <motion.span
                    className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-lg"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    {discountPct}% off
                  </motion.span>
                )}
              </div>

              {typeof product.gstPercent !== 'undefined' && (
                <div className="text-xs text-slate-500 mb-4">
                  Inclusive of GST ({product.gstPercent}%)
                </div>
              )}

              {/* Rating Display */}
              {reviewStats && reviewStats.totalReviews > 0 && (
                <motion.div
                  className="flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(reviewStats.averageRating)
                              ? 'text-yellow-400'
                              : 'text-slate-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {reviewStats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-500">
                      ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                      product.inStock
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full py-3 rounded-xl font-medium border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                  >
                    Buy Now
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Delivery & Warranty Info */}
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Input type="text" placeholder="Enter delivery pincode" className="flex-1" />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="px-6 py-2 rounded-xl">Check</Button>
                </motion.div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-slate-700">
                {product.warrantyMonths && (
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Warranty:</span> {product.warrantyMonths} months
                  </div>
                )}
                {product.returnWindowDays && (
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Returns:</span> {product.returnWindowDays} days
                  </div>
                )}
                {product.fulfillmentLocation && (
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Ships From:</span> {product.fulfillmentLocation}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Available Offers */}
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h3 className="font-semibold text-slate-900 mb-4 text-lg">Available Offers</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-800">
                    No-cost EMI available on select cards
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-800">
                    Extra 5% off with Axis Bank Credit Card
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-purple-800">
                    Free shipping for orders above ₹50,000
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="lg:col-span-7 space-y-6">
            {product.highlights && (
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <h3 className="font-semibold mb-4 text-lg text-slate-900">Highlights</h3>
                <div className="space-y-3">
                  {product.highlights.split('\n').map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-slate-700">{h}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            {product.description && (
              <motion.div
                className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <h3 className="font-semibold mb-4 text-lg text-slate-900">Description</h3>
                <p className="text-slate-700 leading-relaxed">{product.description}</p>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-5">
            <motion.div
              className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              <h3 className="font-semibold mb-4 text-lg text-slate-900">Specifications</h3>
              <div className="space-y-3">
                {specRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-slate-600">{label}</div>
                    <div className="text-sm text-slate-800 text-right">{value}</div>
                  </div>
                ))}
                {(product.cosmeticNotes || product.functionalNotes) && (
                  <div className="pt-3 space-y-2">
                    {product.cosmeticNotes && (
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <span className="text-xs font-medium text-amber-800">Cosmetic:</span>
                        <p className="text-sm text-amber-700 mt-1">{product.cosmeticNotes}</p>
                      </div>
                    )}
                    {product.functionalNotes && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-xs font-medium text-blue-800">Functional:</span>
                        <p className="text-sm text-blue-700 mt-1">{product.functionalNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="mt-4 text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <p>Added: {formatDate(product.createdAt)}</p>
              {product.updatedAt !== product.createdAt && (
                <p>Updated: {formatDate(product.updatedAt)}</p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Reviews & Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <ProductReviews productId={product.id} />
        </motion.div>

        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <RelatedProducts product={product} />
        </motion.div>
      </div>
    </div>
  );
}
