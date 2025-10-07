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
}

export const apiService = new ApiService();
