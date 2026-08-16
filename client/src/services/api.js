const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Simple API helper wrapping native fetch
const api = {
  async request(endpoint, options = {}) {
    const headers = { ...options.headers };

    // Automatically set Content-Type to JSON if sending body, unless it's FormData
    if (options.body && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const config = {
      ...options,
      credentials: 'include',
      headers
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // If unauthorized, clear token and redirect (optional, handled by context)
        const error = new Error(data.error || 'Something went wrong.');
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};

export default api;
