import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { apiService } from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { motion } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  StarOff,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Plus,
  Eye,
  Download,
} from 'lucide-react';

export default function ImageManagement() {
  const { accessToken, refresh } = useAuth();
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(20);
  const [totalPages, setTotalPages] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState('all');
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [uploadForm, setUploadForm] = React.useState({
    productId: '',
    altText: '',
    isPrimary: false,
    sortOrder: 0,
    file: null,
  });

  const [products, setProducts] = React.useState([]);
  const [loadingProducts, setLoadingProducts] = React.useState(false);
  const [productSearchTerm, setProductSearchTerm] = React.useState('');
  const [showProductSearch, setShowProductSearch] = React.useState(false);

  const fetchImages = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      let token = accessToken;
      if (!token) {
        const ok = await refresh();
        if (ok) token = (await apiService.refresh())?.access || token;
      }

      const params = {
        page,
        limit: pageSize,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedProduct !== 'all' && { productId: selectedProduct }),
      };

      const res = await apiService.getAllImages(params, token || accessToken);
      setImages(res.images || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (e) {
      setError(e?.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, selectedProduct, accessToken, refresh]);

  React.useEffect(() => {
    if (accessToken) fetchImages();
  }, [fetchImages, accessToken]);

  // Search products with debouncing
  const searchProducts = React.useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setProducts([]);
      return;
    }

    try {
      setLoadingProducts(true);
      const res = await apiService.searchProducts(searchTerm);
      setProducts(res.products || []);
    } catch (e) {
      console.error('Failed to search products:', e);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Debounced search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (showProductSearch) {
        searchProducts(productSearchTerm);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearchTerm, showProductSearch, searchProducts]);

  // Close search dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProductSearch && !event.target.closest('.product-search-container')) {
        setShowProductSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProductSearch]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file || !uploadForm.productId) {
      alert('Please select a file and product');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', uploadForm.file);
      formData.append('productId', uploadForm.productId);
      formData.append('altText', uploadForm.altText);
      formData.append('isPrimary', uploadForm.isPrimary);
      formData.append('sortOrder', uploadForm.sortOrder);

      await apiService.uploadImage(formData, accessToken);
      setUploadOpen(false);
      setUploadForm({ productId: '', altText: '', isPrimary: false, sortOrder: 0, file: null });
      await fetchImages();
    } catch (e) {
      alert(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Delete this image? This action cannot be undone.')) return;
    try {
      await apiService.deleteImage(imageId, accessToken);
      await fetchImages();
    } catch (e) {
      alert(e?.message || 'Delete failed');
    }
  };

  const handleSetPrimary = async (productId, imageId) => {
    try {
      await apiService.setPrimaryImage(productId, imageId, accessToken);
      await fetchImages();
    } catch (e) {
      alert(e?.message || 'Failed to set primary image');
    }
  };

  const handleUpdateOrder = async (imageId, newOrder) => {
    try {
      await apiService.updateImageOrder(imageId, newOrder, accessToken);
      await fetchImages();
    } catch (e) {
      alert(e?.message || 'Failed to update order');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Image Management</h1>
            <p className="text-slate-600 mt-1">Manage product images and uploads</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 p-4 mb-6 shadow-lg shadow-slate-200/30">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white min-w-[150px]"
              >
                <option value="all">All Products</option>
                {/* Add product options here */}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Images Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse">
                <div className="aspect-square bg-slate-200 rounded-t-lg"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : images.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No images found</h3>
              <p className="text-slate-500 mb-4">Upload your first product image to get started</p>
              <button
                onClick={() => setUploadOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Upload Image
              </button>
            </div>
          ) : (
            images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.cloudinaryUrl}
                    alt={image.altText || 'Product image'}
                    className="w-full h-full object-cover"
                  />
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Primary
                      </span>
                    </div>
                  )}
                </div>

                {/* Image Info */}
                <div className="p-4">
                  <h3 className="font-medium text-slate-900 truncate">
                    {image.productTitle || 'Unknown Product'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {image.width} × {image.height} • {Math.round(image.fileSize / 1024)}KB
                  </p>
                  {image.altText && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{image.altText}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSetPrimary(image.productId, image.id)}
                        className={`p-1.5 rounded transition-colors duration-200 ${
                          image.isPrimary
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-yellow-100 hover:text-yellow-600'
                        }`}
                        title={image.isPrimary ? 'Primary image' : 'Set as primary'}
                      >
                        {image.isPrimary ? (
                          <Star className="w-3 h-3" />
                        ) : (
                          <StarOff className="w-3 h-3" />
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateOrder(image.id, image.sortOrder - 1)}
                        className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded transition-colors duration-200"
                        title="Move up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleUpdateOrder(image.id, image.sortOrder + 1)}
                        className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded transition-colors duration-200"
                        title="Move down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </motion.button>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(image.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                      title="Delete image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {uploadOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200"
            >
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Upload Image</h2>
                <p className="text-sm text-slate-500 mt-1">Add a new product image</p>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Product *
                  </label>
                  <div className="relative product-search-container">
                    <input
                      type="text"
                      placeholder="Search products by name, SKU, or ID..."
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value);
                        setShowProductSearch(true);
                      }}
                      onFocus={() => setShowProductSearch(true)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />

                    {/* Selected Product Display */}
                    {uploadForm.productId && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">
                            Selected:{' '}
                            {products.find((p) => p.id == uploadForm.productId)?.title ||
                              'Product ID: ' + uploadForm.productId}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setUploadForm({ ...uploadForm, productId: '' });
                              setProductSearchTerm('');
                              setShowProductSearch(false);
                            }}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Change
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Search Results Dropdown */}
                    {showProductSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {loadingProducts ? (
                          <div className="p-3 text-center text-slate-500">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            Searching products...
                          </div>
                        ) : products.length === 0 ? (
                          <div className="p-3 text-center text-slate-500">
                            {productSearchTerm.length < 2
                              ? 'Type at least 2 characters to search'
                              : 'No products found'}
                          </div>
                        ) : (
                          products.map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                setUploadForm({ ...uploadForm, productId: product.id });
                                setProductSearchTerm('');
                                setShowProductSearch(false);
                              }}
                              className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-900">{product.title}</div>
                              <div className="text-sm text-slate-500">
                                ID: {product.id} • SKU: {product.sku}
                              </div>
                              <div className="text-sm text-slate-400">
                                ₹{product.price?.toLocaleString()}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Image File *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Alt Text</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Describe the image"
                    value={uploadForm.altText}
                    onChange={(e) => setUploadForm({ ...uploadForm, altText: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                      checked={uploadForm.isPrimary}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, isPrimary: e.target.checked })
                      }
                    />
                    <span className="ml-2 text-sm text-slate-700">Set as primary image</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setUploadOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
