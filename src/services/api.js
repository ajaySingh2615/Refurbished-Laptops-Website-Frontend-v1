const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
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
}

export const apiService = new ApiService();
