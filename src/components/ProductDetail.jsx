import React from 'react';

import { formatPrice, formatDate } from '../utils/formatters.js';
import RelatedProducts from './RelatedProducts.jsx';

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

  // Variant sets from product.variants
  const variants = Array.isArray(product?.variants) ? product.variants : [];
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

  // Build specification rows
  const specRows = [
    ['Brand', product.brand],
    ['Model', product.model],
    ['SKU', selectedVariant?.sku || product.sku],
    ['CPU', product.cpu],
    ['GPU', product.gpu],
    [
      'RAM',
      selectedVariant?.attributes?.ramGb
        ? `${selectedVariant.attributes.ramGb} GB`
        : product.ramGb
          ? `${product.ramGb} GB`
          : undefined,
    ],
    ['Storage', selectedVariant?.attributes?.storage || product.storage],
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
    ['Color', product.color],
    ['Weight', product.weightKg ? `${product.weightKg} kg` : undefined],
    ['Dimensions', product.dimensionsMm],
    ['Ports', product.ports],
    ['Battery Health', product.batteryHealthPct ? `${product.batteryHealthPct}%` : undefined],
    ['Battery Cycles', product.batteryCycles],
    ['Condition', product.condition],
  ].filter(([, v]) => v !== undefined && v !== null && v !== '');

  const mrp = product.mrp ? Number(product.mrp) : null;
  const price = selectedVariant?.price
    ? Number(selectedVariant.price)
    : product.price
      ? Number(product.price)
      : null;
  const discountPct =
    typeof product.discountPercent === 'number'
      ? product.discountPercent
      : mrp && price
        ? Math.round(((mrp - price) / mrp) * 100)
        : null;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Media */}
        <div className="lg:col-span-5">
          <div className="sticky top-4">
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Product Image</span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">{product.title}</h1>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              {typeof product.stockQty === 'number' &&
                product.stockQty <= 5 &&
                product.stockQty > 0 && (
                  <span className="text-sm text-red-600 font-medium">
                    Only {product.stockQty} left
                  </span>
                )}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white">
            {/* Variant selectors */}
            {variants.length > 0 && (
              <div className="space-y-3 mb-4">
                {variantSets.colors.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-800 mb-1">Color</div>
                    <div className="flex flex-wrap gap-2">
                      {variantSets.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSel((s) => ({ ...s, color: c }))}
                          className={`px-3 py-1.5 rounded-full text-sm border ${sel.color === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {variantSets.rams.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-800 mb-1">RAM</div>
                    <div className="flex flex-wrap gap-2">
                      {variantSets.rams.map((r) => (
                        <button
                          key={r}
                          onClick={() => setSel((s) => ({ ...s, ramGb: r }))}
                          className={`px-3 py-1.5 rounded-full text-sm border ${sel.ramGb === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                        >
                          {r} GB
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {variantSets.storages.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-800 mb-1">Storage</div>
                    <div className="flex flex-wrap gap-2">
                      {variantSets.storages.map((st) => (
                        <button
                          key={st}
                          onClick={() => setSel((s) => ({ ...s, storage: st }))}
                          className={`px-3 py-1.5 rounded-full text-sm border ${sel.storage === st ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {selectedVariant && (
                  <div className="text-xs text-gray-600">
                    Selected SKU: <span className="font-mono">{selectedVariant.sku}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-end gap-3">
              {price !== null && (
                <div className="text-3xl font-bold text-gray-900">{formatPrice(price)}</div>
              )}
              {mrp && <div className="text-sm text-gray-500 line-through">{formatPrice(mrp)}</div>}
              {discountPct !== null && discountPct > 0 && (
                <div className="text-sm font-semibold text-green-700">{discountPct}% off</div>
              )}
            </div>
            {typeof product.gstPercent !== 'undefined' && (
              <div className="text-xs text-gray-600 mt-1">
                Inclusive of GST ({product.gstPercent}%)
              </div>
            )}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                className={`w-full py-3 rounded-md font-medium ${product.inStock ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="w-full py-3 rounded-md font-medium border border-gray-300 hover:bg-gray-50">
                Buy Now
              </button>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Enter delivery pincode"
                className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-4 py-2 border rounded-md hover:bg-gray-50">Check</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
              {product.warrantyMonths && (
                <div>
                  <span className="font-medium">Warranty:</span> {product.warrantyMonths} months
                </div>
              )}
              {product.returnWindowDays && (
                <div>
                  <span className="font-medium">Returns:</span> {product.returnWindowDays} days
                </div>
              )}
              {product.fulfillmentLocation && (
                <div>
                  <span className="font-medium">Ships From:</span> {product.fulfillmentLocation}
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold text-gray-900 mb-2">Available Offers</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>No-cost EMI available on select cards</li>
              <li>Extra 5% off with Axis Bank Credit Card</li>
              <li>Free shipping for orders above ₹50,000</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          {product.highlights && (
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="font-semibold mb-2">Highlights</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                {product.highlights.split('\n').map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {product.description && (
            <div className="border rounded-lg p-4 bg-white">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-3">Specifications</h3>
            <div className="divide-y">
              {specRows.map(([label, value]) => (
                <div key={label} className="py-2 grid grid-cols-5 text-sm">
                  <div className="col-span-2 text-gray-500">{label}</div>
                  <div className="col-span-3 text-gray-800">{value}</div>
                </div>
              ))}
              {(product.cosmeticNotes || product.functionalNotes) && (
                <div className="py-2 text-sm">
                  {product.cosmeticNotes && (
                    <p className="text-gray-800">
                      <span className="text-gray-500">Cosmetic:</span> {product.cosmeticNotes}
                    </p>
                  )}
                  {product.functionalNotes && (
                    <p className="text-gray-800">
                      <span className="text-gray-500">Functional:</span> {product.functionalNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500 space-y-1">
            <p>Added: {formatDate(product.createdAt)}</p>
            {product.updatedAt !== product.createdAt && (
              <p>Updated: {formatDate(product.updatedAt)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts product={product} />
    </div>
  );
}
