// GitWork API service - connects to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// API functions
export const api = {
  // Authentication
  async loginWithGithub() {
    // Redirect to GitHub OAuth
    window.location.href = `${API_BASE_URL}/auth/github?returnTo=${window.location.pathname}`;
  },

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  },

  // User status and profile
  async getUserStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/status`, {
        credentials: 'include'
      });
      return await response.json();
    } catch (error) {
      console.error('User status error:', error);
      return { authenticated: false };
    }
  },

  async getUserProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get profile');
      }
      
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Bounties
  async searchBounties(query = '') {
    try {
      const url = new URL(`${API_BASE_URL}/api/bounties/search`);
      if (query && query.trim() !== '') {
        url.searchParams.append('query', query.trim());
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to search bounties');
      }
      
      return data.bounties || [];
    } catch (error) {
      console.error('Search bounties error:', error);
      return [];
    }
  },

  async getBountyStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bounties/stats`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get stats');
      }
      
      return data.stats || {};
    } catch (error) {
      console.error('Get stats error:', error);
      return {};
    }
  },

  // Contact form
  async sendContactForm(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      return data;
    } catch (error) {
      console.error('Send contact form error:', error);
      throw error;
    }
  }
};

export default api;
