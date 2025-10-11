import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService } from '../services/api.js';
import { formatPrice } from '../utils/formatters';

export default function RelatedProducts({ product }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productImages, setProductImages] = useState({});

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!product || !product.brand) {
          if (isMounted) setItems([]);
          return;
        }

        const parsePrice = (val) => {
          const n = Number(val);
          return Number.isFinite(n) ? n : null;
        };

        const price = parsePrice(product.price);
        const pct = 0.15; // ±15%
        const minPrice = price ? Math.max(0, Math.floor(price * (1 - pct))) : undefined;
        const maxPrice = price ? Math.ceil(price * (1 + pct)) : undefined;

        // Extract storage tokens
        const storageTokens = ['SSD', 'HDD', 'NVMe'].filter((t) =>
          (product.storage || '').toUpperCase().includes(t.toUpperCase()),
        );

        const attempt = async (params) => {
          const res = await apiService.filterProducts(params);
          const list = Array.isArray(res.products) ? res.products : [];
          return list.filter((p) => p.id !== product.id);
        };

        // 1) Strict: brand + condition + price band + ram + storage + inStock
        let params1 = {
          page: 1,
          limit: 4,
          brand: String(product.brand),
          condition: product.condition ? String(product.condition) : undefined,
          inStock: true,
          minPrice,
          maxPrice,
          ramGb: product.ramGb ? String(product.ramGb) : undefined,
          storage: storageTokens.length ? storageTokens.join(',') : undefined,
        };
        let related = await attempt(params1);

        // 2) Relax RAM/Storage
        if (related.length < 4) {
          const { ramGb: _ram, storage: _storage, ...rest } = params1;
          related = await attempt(rest);
        }

        // 3) Relax price band
        if (related.length < 4) {
          const { minPrice: _mn, maxPrice: _mx, ...rest } = params1;
          related = await attempt({ ...rest, ramGb: undefined, storage: undefined });
        }

        // 4) Brand only
        if (related.length < 4) {
          related = await attempt({
            page: 1,
            limit: 4,
            brand: String(product.brand),
            inStock: true,
          });
        }

        if (isMounted) setItems(related);

        // Fetch images for related products
        if (related.length > 0) {
          const imagePromises = related.map(async (item) => {
            try {
              const response = await apiService.getProductImages(item.id);
              return { productId: item.id, images: response.images || [] };
            } catch (error) {
              console.error(`Failed to fetch images for product ${item.id}:`, error);
              return { productId: item.id, images: [] };
            }
          });

          const imageResults = await Promise.all(imagePromises);
          const imagesMap = {};
          imageResults.forEach(({ productId, images }) => {
            imagesMap[productId] = images;
          });

          if (isMounted) setProductImages(imagesMap);
        }
      } catch {
        if (isMounted) setError('Failed to load related products');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (product) load();
    return () => {
      isMounted = false;
    };
  }, [product]);

  if (loading) {
    return (
      <motion.div
        className="mt-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ backgroundColor: '#f8f6f3' }}
      >
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#f8f6f3' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded-lg w-32 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl p-3 animate-pulse h-full flex flex-col"
                style={{ backgroundColor: '#f8f6f3' }}
              >
                <div className="aspect-square bg-slate-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mt-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || items.length === 0) return null;

  return (
    <motion.div
      className="mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ backgroundColor: '#f8f6f3' }}
    >
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#f8f6f3' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Related Products</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
          {items.map((item, index) => {
            const images = productImages[item.id] || [];
            const primaryImage = images.find((img) => img.isPrimary) || images[0];

            // Calculate discount
            const originalPrice = item.originalPrice || item.price * 1.3;
            const discountAmount = originalPrice - item.price;
            const discountPercentage = Math.round((discountAmount / originalPrice) * 100);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/product/${encodeURIComponent(item.sku)}`}
                  className="group block h-full"
                >
                  <motion.div
                    className="rounded-xl p-4 transition-all duration-300 overflow-hidden h-full flex flex-col"
                    style={{ backgroundColor: '#f8f6f3' }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden mb-3">
                      {primaryImage ? (
                        <img
                          src={primaryImage.cloudinaryUrl}
                          alt={primaryImage.altText || item.title}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}

                      {/* Fallback when no image */}
                      <div
                        className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg"
                        style={{ display: primaryImage ? 'none' : 'flex' }}
                      >
                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-slate-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                          </svg>
                        </div>
                      </div>

                      {/* Discount Badge */}
                      {discountPercentage > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
                          {discountPercentage}% OFF
                        </div>
                      )}

                      {/* Stock Badge */}
                      {!item.inStock && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-lg">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2 flex-1 flex flex-col">
                      <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {item.title}
                      </h4>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          {item.brand}
                        </span>
                        {item.condition && (
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {item.condition}
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">
                          {formatPrice(item.price)}
                        </span>
                        {originalPrice > item.price && (
                          <span className="text-sm text-slate-500 line-through">
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>

                      {/* Rating (Mock) */}
                      <div className="flex items-center gap-1 mt-auto">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className="w-3 h-3 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">(4.2)</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
