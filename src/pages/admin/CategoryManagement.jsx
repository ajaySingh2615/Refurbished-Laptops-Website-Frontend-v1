import React, { useState, useEffect, useCallback } from 'react';
import { motion as Motion } from 'framer-motion';
import AdminLayout from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '../../components/ui/Modal';
import MessageModal from '../../components/admin/MessageModal';
import { apiService } from '../../services/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [messageModal, setMessageModal] = useState({
    show: false,
    type: '',
    title: '',
    message: '',
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: null,
  });

  const showMessage = useCallback((type, title, message) => {
    setMessageModal({ show: true, type, title, message });
  }, []);

  const showSuccess = useCallback(
    (message) => showMessage('success', 'Success', message),
    [showMessage],
  );
  const showError = useCallback((message) => showMessage('error', 'Error', message), [showMessage]);
  const closeMessageModal = useCallback(
    () => setMessageModal({ show: false, type: '', title: '', message: '' }),
    [],
  );

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
        parentId: formData.parentId || null,
      };

      await apiService.createCategory(payload);
      showSuccess('Category created successfully');
      setShowAddModal(false);
      setFormData({ name: '', slug: '', parentId: null });
      loadCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      showError(error.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
        parentId: formData.parentId || null,
      };

      await apiService.updateCategory(editingCategory.id, payload);
      showSuccess('Category updated successfully');
      setShowEditModal(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', parentId: null });
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      showError(error.message || 'Failed to update category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      setSubmitting(true);
      await apiService.deleteCategory(deletingCategory.id);
      showSuccess('Category deleted successfully');
      setShowDeleteModal(false);
      setDeletingCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showError(error.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const openAddModal = () => {
    setFormData({ name: '', slug: '', parentId: null });
    setShowAddModal(true);
  };

  // Flatten the tree structure for easier processing
  const flattenCategories = (categories) => {
    const result = [];
    const flatten = (nodes) => {
      nodes.forEach((node) => {
        result.push(node);
        if (node.children && node.children.length > 0) {
          flatten(node.children);
        }
      });
    };
    flatten(categories);
    return result;
  };

  const flatCategories = flattenCategories(categories);
  const getChildrenCount = (categoryId) => {
    return flatCategories.filter((cat) => cat.parentId === categoryId).length;
  };

  // Enhanced search that includes parent categories when subcategories match
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) {
      return {
        rootCategories: flatCategories.filter((cat) => !cat.parentId),
        childCategories: flatCategories.filter((cat) => cat.parentId),
      };
    }

    const query = searchQuery.toLowerCase();
    const matchingCategories = flatCategories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query),
    );

    // Include parent categories of matching subcategories
    const parentIds = new Set();
    matchingCategories.forEach((cat) => {
      if (cat.parentId) {
        parentIds.add(cat.parentId);
      }
    });

    // Get all parent categories that have matching children
    const parentCategories = flatCategories.filter((cat) => !cat.parentId && parentIds.has(cat.id));

    // Combine matching categories with their parents
    const allMatching = [...matchingCategories, ...parentCategories];
    const uniqueMatching = allMatching.filter(
      (cat, index, arr) => arr.findIndex((c) => c.id === cat.id) === index,
    );

    return {
      rootCategories: uniqueMatching.filter((cat) => !cat.parentId),
      childCategories: uniqueMatching.filter((cat) => cat.parentId),
    };
  };

  const { rootCategories, childCategories } = getFilteredCategories();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="mt-2 text-sm text-slate-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Category Management</h1>
            <p className="text-slate-600">Manage product categories and subcategories</p>
          </div>
          <Button
            onClick={openAddModal}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Category
          </Button>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">How to Create Categories</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  <strong>🏠 Main Categories:</strong> Leave "Parent Category" as "Root Category" to
                  create main categories like "Electronics" or "Peripherals"
                </p>
                <p>
                  <strong>📁 Subcategories:</strong> Select a parent category to create
                  subcategories like "Laptops" under "Electronics"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm p-4">
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Categories List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Categories ({rootCategories.length + childCategories.length})
              </h3>
              {searchQuery.trim() && (
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  🔍 Search results (including parent categories)
                </div>
              )}
            </div>
          </div>

          <div className="divide-y divide-slate-200/60">
            {/* Root Categories */}
            {rootCategories.map((category) => (
              <React.Fragment key={category.id}>
                <div className="p-4 hover:bg-slate-50/50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {category.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{category.name}</h4>
                        <p className="text-sm text-slate-500">/{category.slug}</p>
                        <p className="text-xs text-slate-400">
                          {getChildrenCount(category.id)} subcategor
                          {getChildrenCount(category.id) === 1 ? 'y' : 'ies'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(category)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteModal(category)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Child Categories */}
                {childCategories
                  .filter((child) => child.parentId === category.id)
                  .map((child) => (
                    <div
                      key={child.id}
                      className="p-4 pl-12 bg-slate-50/30 hover:bg-slate-50/50 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-slate-400 to-slate-600 flex items-center justify-center text-white font-semibold text-xs">
                              {child.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-slate-800">{child.name}</h5>
                            <p className="text-sm text-slate-500">/{child.slug}</p>
                            <p className="text-xs text-slate-400">Subcategory</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(child)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDeleteModal(child)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </React.Fragment>
            ))}
          </div>

          {rootCategories.length === 0 && childCategories.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <svg
                className="h-12 w-12 mx-auto mb-4 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p>No categories found</p>
              <p className="text-sm">Try adjusting your search or add a new category</p>
            </div>
          )}
        </div>

        {/* Add Category Modal */}
        {showAddModal && (
          <Modal onClose={() => setShowAddModal(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <h3 className="text-lg font-semibold text-slate-900">Add New Category</h3>
              </ModalHeader>
              <form onSubmit={handleAddCategory}>
                <ModalBody>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter category name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                      <Input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="category-slug (auto-generated if empty)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Parent Category
                      </label>
                      <select
                        value={formData.parentId || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parentId: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="">🏠 Root Category (Main Category)</option>
                        {flatCategories
                          .filter((cat) => !cat.parentId)
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              📁 {category.name}
                            </option>
                          ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        💡 <strong>Tip:</strong> Leave as "Root Category" to create a main category,
                        or select a parent to create a subcategory.
                      </p>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {submitting ? 'Creating...' : 'Create Category'}
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
        )}

        {/* Edit Category Modal */}
        {showEditModal && (
          <Modal onClose={() => setShowEditModal(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <h3 className="text-lg font-semibold text-slate-900">Edit Category</h3>
              </ModalHeader>
              <form onSubmit={handleEditCategory}>
                <ModalBody>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter category name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Slug</label>
                      <Input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                        placeholder="category-slug"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Parent Category
                      </label>
                      <select
                        value={formData.parentId || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            parentId: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      >
                        <option value="">🏠 Root Category (Main Category)</option>
                        {flatCategories
                          .filter((cat) => !cat.parentId && cat.id !== editingCategory?.id)
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              📁 {category.name}
                            </option>
                          ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-1">
                        💡 <strong>Tip:</strong> Select "Root Category" to make this a main
                        category, or choose a parent to make it a subcategory.
                      </p>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {submitting ? 'Updating...' : 'Update Category'}
                  </Button>
                </ModalFooter>
              </form>
            </ModalContent>
          </Modal>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <Modal onClose={() => setShowDeleteModal(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                <h3 className="text-lg font-semibold text-slate-900">Delete Category</h3>
              </ModalHeader>
              <ModalBody>
                <div className="text-center py-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">
                    Are you sure you want to delete "{deletingCategory?.name}"?
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    This action cannot be undone. All subcategories and products in this category
                    will be affected.
                  </p>
                  {getChildrenCount(deletingCategory?.id) > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-amber-800">
                        <strong>Warning:</strong> This category has{' '}
                        {getChildrenCount(deletingCategory?.id)} subcategor
                        {getChildrenCount(deletingCategory?.id) === 1 ? 'y' : 'ies'}.
                      </p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDeleteCategory}
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {submitting ? 'Deleting...' : 'Delete Category'}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}

        {/* Message Modal */}
        <MessageModal
          isOpen={messageModal.show}
          type={messageModal.type}
          title={messageModal.title}
          message={messageModal.message}
          onClose={closeMessageModal}
        />
      </div>
    </AdminLayout>
  );
}
