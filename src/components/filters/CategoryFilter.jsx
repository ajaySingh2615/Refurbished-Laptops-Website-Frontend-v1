import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api.js';

export default function CategoryFilter({ selectedCategory, onCategoryChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiService.getAllCategories();
        // Get only parent categories
        const parentCategories = data.filter((cat) => !cat.parentId);
        setCategories(parentCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <svg
          className="w-3 h-3 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
        Category
      </h3>
      <div className="space-y-1.5">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* All Categories Option */}
            <motion.label
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                checked={!selectedCategory}
                onChange={() => onCategoryChange('')}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300 transition-all duration-200"
              />
              <span className="ml-2 text-xs text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
                All Categories
              </span>
            </motion.label>

            {/* Individual Categories */}
            {categories.map((category, index) => (
              <motion.label
                key={category.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.05 }}
                className="flex items-center cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === category.slug}
                  onChange={() => onCategoryChange(category.slug)}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-slate-300 transition-all duration-200"
                />
                <span className="ml-2 text-xs text-slate-700 group-hover:text-slate-900 transition-colors duration-200">
                  {category.name}
                </span>
              </motion.label>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
