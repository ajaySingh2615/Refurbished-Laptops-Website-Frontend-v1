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
  Package,
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
  const [uploadProgress, setUploadProgress] = React.useState({ current: 0, total: 0 });
  const [selectedProductImages, setSelectedProductImages] = React.useState(null);
  const [showImageModal, setShowImageModal] = React.useState(false);
  // Removed viewMode - only using table view

  const [uploadForm, setUploadForm] = React.useState({
    productId: '',
    altText: '',
    isPrimary: false,
    sortOrder: 0,
    files: [],
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
    if (!uploadForm.files.length || !uploadForm.productId) {
      alert('Please select files and a product');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress({ current: 0, total: uploadForm.files.length });
      let successCount = 0;
      let errorCount = 0;

      // Upload each file
      for (let i = 0; i < uploadForm.files.length; i++) {
        try {
          setUploadProgress({ current: i + 1, total: uploadForm.files.length });

          const formData = new FormData();
          formData.append('image', uploadForm.files[i]);
          formData.append('productId', uploadForm.productId);
          formData.append('altText', uploadForm.altText);
          formData.append('isPrimary', i === 0 ? uploadForm.isPrimary : false); // Only first image can be primary
          formData.append('sortOrder', i);

          await apiService.uploadImage(formData, accessToken);
          successCount++;
        } catch (error) {
          console.error(`Failed to upload file ${i + 1}:`, error);
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        alert(
          `Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
        );
        setUploadOpen(false);
        setUploadForm({ productId: '', altText: '', isPrimary: false, sortOrder: 0, files: [] });
        setUploadProgress({ current: 0, total: 0 });
        await fetchImages();
      } else {
        alert('All uploads failed. Please try again.');
      }
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

  const handleViewAllImages = (productId, productTitle) => {
    const productImages = images.filter((img) => img.productId === productId);
    setSelectedProductImages({
      productId,
      productTitle,
      images: productImages,
    });
    setShowImageModal(true);
  };

  const handleDeleteImage = async (imageId, imageUrl) => {
    if (!confirm('Delete this image? This action cannot be undone.')) return;
    try {
      await apiService.deleteImage(imageId, accessToken);
      await fetchImages();
      // Update modal if open
      if (selectedProductImages) {
        const updatedImages = selectedProductImages.images.filter((img) => img.id !== imageId);
        setSelectedProductImages({
          ...selectedProductImages,
          images: updatedImages,
        });
      }
    } catch (e) {
      alert(e?.message || 'Failed to delete image');
    }
  };

  const handleSetPrimaryFromModal = async (productId, imageId) => {
    try {
      await apiService.setPrimaryImage(productId, imageId, accessToken);
      await fetchImages();
      // Update modal
      if (selectedProductImages) {
        const updatedImages = selectedProductImages.images.map((img) => ({
          ...img,
          isPrimary: img.id === imageId,
        }));
        setSelectedProductImages({
          ...selectedProductImages,
          images: updatedImages,
        });
      }
    } catch (e) {
      alert(e?.message || 'Failed to set primary image');
    }
  };

  // Group images by product for table view
  const groupedImages = React.useMemo(() => {
    const groups = {};
    images.forEach((image) => {
      const productId = image.productId;
      if (!groups[productId]) {
        groups[productId] = {
          productId,
          productTitle: image.productTitle || 'Unknown Product',
          productSku: image.productSku || 'N/A',
          images: [],
        };
      }
      groups[productId].images.push(image);
    });
    return Object.values(groups);
  }, [images]);

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
            Upload Images
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

        {/* Images Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Primary
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-600 text-sm">Loading images...</span>
                      </div>
                    </td>
                  </tr>
                ) : groupedImages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="text-slate-500">
                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-medium">No images found</p>
                        <p className="text-xs">Upload your first product image to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  groupedImages.map((group, index) => (
                    <motion.tr
                      key={group.productId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors duration-150"
                    >
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                            <Package className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {group.productTitle}
                            </p>
                            <p className="text-xs text-slate-500">SKU: {group.productSku}</p>
                            <p className="text-xs text-slate-400">
                              {group.images.length} image{group.images.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Images Preview */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {group.images.slice(0, 3).map((image) => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.cloudinaryUrl}
                                alt={image.altText || 'Product image'}
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                              />
                              {image.isPrimary && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                                  <Star className="w-2.5 h-2.5 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                          {group.images.length > 3 && (
                            <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-xs font-medium text-slate-500">
                              +{group.images.length - 3}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Primary Image */}
                      <td className="px-6 py-4">
                        {group.images.find((img) => img.isPrimary) ? (
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-slate-700">Set</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setUploadOpen(true)}
                            className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                            title="Add more images"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewAllImages(group.productId, group.productTitle)}
                            className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                            title="View all images"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                    Image Files * (Multiple selection allowed)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, files: Array.from(e.target.files) })
                    }
                  />
                  {uploadForm.files.length > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium mb-2">
                        Selected {uploadForm.files.length} file
                        {uploadForm.files.length > 1 ? 's' : ''}:
                      </p>
                      <div className="space-y-1">
                        {uploadForm.files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-xs text-blue-600"
                          >
                            <span className="truncate flex-1">{file.name}</span>
                            <span className="ml-2 text-blue-500">
                              {(file.size / 1024 / 1024).toFixed(1)}MB
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    <span className="ml-2 text-sm text-slate-700">
                      Set first image as primary
                      {uploadForm.files.length > 1 && (
                        <span className="text-xs text-slate-500 block">
                          (Only the first image will be set as primary)
                        </span>
                      )}
                    </span>
                  </label>
                </div>

                {/* Progress Bar */}
                {uploading && uploadProgress.total > 0 && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <span>Uploading images...</span>
                      <span>
                        {uploadProgress.current} of {uploadProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setUploadOpen(false)}
                    disabled={uploading}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading
                      ? `Uploading ${uploadProgress.current}/${uploadProgress.total}...`
                      : `Upload ${uploadForm.files.length || 0} Image${uploadForm.files.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedProductImages && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] border border-slate-200 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {selectedProductImages.productTitle}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {selectedProductImages.images.length} image
                      {selectedProductImages.images.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5 text-slate-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Images Grid */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {selectedProductImages.images.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No images found for this product</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedProductImages.images.map((image, index) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300"
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
                        <div className="p-3">
                          <p className="text-xs text-slate-500 mb-2">
                            {image.width} × {image.height} • {Math.round(image.fileSize / 1024)}KB
                          </p>
                          {image.altText && (
                            <p className="text-xs text-slate-400 truncate mb-2">{image.altText}</p>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleSetPrimaryFromModal(
                                    selectedProductImages.productId,
                                    image.id,
                                  )
                                }
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
                                onClick={() => handleDeleteImage(image.id, image.cloudinaryUrl)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                                title="Delete image"
                              >
                                <Trash2 className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    Click on images to manage them individually
                  </div>
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setUploadOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                    >
                      <Plus className="w-4 h-4" />
                      Add More Images
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowImageModal(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all duration-200"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
