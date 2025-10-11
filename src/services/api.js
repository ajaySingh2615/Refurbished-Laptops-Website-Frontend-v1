const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error('Failed to fetch data, please try again');
    }
  }

  // Products
  async getProducts(page = 1, limit = 12) {
    return this.request(`/api/products?page=${page}&limit=${limit}`);
  }

  async getProduct(id) {
    return this.request(`/api/products/${id}`);
  }

  async getProductBySku(sku) {
    return this.request(`/api/products/sku/${encodeURIComponent(sku)}`);
  }

  async searchProducts(query) {
    return this.request(`/api/products/search?q=${encodeURIComponent(query)}`);
  }

  async filterProducts(filters) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/products/filter?${params}`);
  }

  async getLowStockSummary(threshold = 5) {
    return this.request(`/api/products/low-stock/summary?threshold=${threshold}`);
  }

  async getLowStockList(threshold = 5) {
    return this.request(`/api/products/low-stock/list?threshold=${threshold}`);
  }

  // Brands
  async getBrands() {
    return this.request('/api/brands');
  }

  // Admin product mutations
  async createProduct(body) {
    return this.request('/api/products', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateProduct(id, body) {
    return this.request(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteProduct(id) {
    return this.request(`/api/products/${id}`, { method: 'DELETE' });
  }

  // Variants
  async createProductVariants(productId, variants) {
    return this.request(`/api/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify({ variants }),
    });
  }

  async updateVariant(variantId, body) {
    return this.request(`/api/products/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async deleteVariant(variantId) {
    return this.request(`/api/products/variants/${variantId}`, { method: 'DELETE' });
  }

  async getVariantBySku(sku) {
    return this.request(`/api/products/variants/sku/${encodeURIComponent(sku)}`);
  }

  // Categories
  async getCategories() {
    return this.request('/api/categories');
  }

  async getCategory(slug) {
    return this.request(`/api/categories/${encodeURIComponent(slug)}`);
  }

  async getCategoryProducts(slug, { page = 1, limit = 12 } = {}) {
    return this.request(
      `/api/categories/${encodeURIComponent(slug)}/products?page=${page}&limit=${limit}`,
    );
  }

  // Admin category mutations
  async createCategory(body) {
    return this.request('/api/categories', { method: 'POST', body: JSON.stringify(body) });
  }

  async updateCategory(id, body) {
    return this.request(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  async deleteCategory(id) {
    return this.request(`/api/categories/${id}`, { method: 'DELETE' });
  }

  // Auth
  async login(body) {
    return this.request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) });
  }

  async register(body) {
    return this.request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) });
  }

  async refresh() {
    return this.request('/api/auth/refresh', { method: 'POST' });
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  async me(accessToken) {
    return this.request('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache',
      },
    });
  }

  // Email verification
  async verifyEmail(token) {
    return this.request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
  }

  async resendVerification(accessToken) {
    return this.request('/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  // Phone OTP (to be wired on backend):
  async sendPhoneOtp(body) {
    return this.request('/api/auth/phone/send-otp', { method: 'POST', body: JSON.stringify(body) });
  }

  async verifyPhoneOtp(body) {
    return this.request('/api/auth/phone/verify-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Password reset
  async forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Admin auth
  async adminLogin(body) {
    return this.request('/api/auth/admin/login', { method: 'POST', body: JSON.stringify(body) });
  }

  // Admin users
  async adminListUsers({ page = 1, pageSize = 20, search, role, status } = {}, accessToken) {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('pageSize', pageSize);

    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);
    if (status && status !== 'all') params.append('status', status);

    return this.request(`/api/auth/admin/users?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async adminCreateUser(body, accessToken) {
    return this.request('/api/auth/admin/users', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  async adminUpdateUser(id, body, accessToken) {
    return this.request(`/api/auth/admin/users/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  async adminDeleteUser(id, accessToken) {
    return this.request(`/api/auth/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  // Image management methods
  async uploadImage(formData, accessToken) {
    return this.request('/api/images/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
  }

  async getProductImages(productId) {
    return this.request(`/api/images/product/${productId}`);
  }

  async getAllImages(params = {}, accessToken) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value);
      }
    });
    return this.request(`/api/images/admin/all?${searchParams}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async deleteImage(imageId, accessToken) {
    return this.request(`/api/images/admin/${imageId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async setPrimaryImage(productId, imageId, accessToken) {
    return this.request('/api/images/admin/set-primary', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, imageId }),
    });
  }

  async updateImageOrder(imageId, sortOrder, accessToken) {
    return this.request(`/api/images/admin/${imageId}/order`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sortOrder }),
    });
  }

  // Review methods
  async getProductReviews(productId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const queryString = params.toString();
    return this.request(`/api/reviews/product/${productId}${queryString ? `?${queryString}` : ''}`);
  }

  async getProductReviewStats(productId) {
    return this.request(`/api/reviews/product/${productId}/stats`);
  }

  async createReview(productId, reviewData) {
    const accessToken = localStorage.getItem('accessToken');
    return this.request(`/api/reviews/product/${productId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    });
  }

  async updateReviewHelpfulness(reviewId, isHelpful) {
    const accessToken = localStorage.getItem('accessToken');
    return this.request(`/api/reviews/${reviewId}/helpful`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isHelpful }),
    });
  }

  async canUserReview(productId) {
    const accessToken = localStorage.getItem('accessToken');
    return this.request(`/api/reviews/product/${productId}/can-review`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  // Admin review methods
  async getAdminReviews(options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.search) params.append('search', options.search);
    if (options.limit) params.append('limit', options.limit);
    if (options.offset) params.append('offset', options.offset);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.productId) params.append('productId', options.productId);

    const queryString = params.toString();
    return this.request(`/api/reviews/admin/reviews${queryString ? `?${queryString}` : ''}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async approveReview(reviewId, adminNotes = null) {
    const accessToken = localStorage.getItem('accessToken');
    return this.request(`/api/reviews/admin/${reviewId}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adminNotes }),
    });
  }

  async rejectReview(reviewId, adminNotes = null) {
    const accessToken = localStorage.getItem('accessToken');
    return this.request(`/api/reviews/admin/${reviewId}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ adminNotes }),
    });
  }
}

// Cart API functions
export const cartAPI = {
  // Get cart with all items
  async getCart() {
    return apiService.request('/api/cart');
  },

  // Get cart summary for header
  async getCartSummary() {
    return apiService.request('/api/cart/summary');
  },

  // Add item to cart
  async addToCart(data) {
    return apiService.request('/api/cart/add', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update cart item quantity
  async updateCartItem(itemId, data) {
    return apiService.request(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Remove item from cart
  async removeFromCart(itemId) {
    return apiService.request(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Clear entire cart
  async clearCart() {
    return apiService.request('/api/cart/clear', {
      method: 'DELETE',
    });
  },

  // Apply coupon
  async applyCoupon(data) {
    return apiService.request('/api/cart/coupon', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Track cart abandonment
  async trackAbandonment(data) {
    return apiService.request('/api/cart/track-abandonment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Save cart as wishlist (authenticated only)
  async saveCart(data) {
    return apiService.request('/api/cart/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get saved carts (authenticated only)
  async getSavedCarts() {
    return apiService.request('/api/cart/saved');
  },

  // Merge guest cart with user cart (authenticated only)
  async mergeCarts(data) {
    return apiService.request('/api/cart/merge', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const apiService = new ApiService();
