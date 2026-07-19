/**
 * ============================================================
 * API CLIENT SERVICE
 * Centralized fetch wrapper that communicates with our Spring Boot REST API.
 * Automatically attaches JWT Authorization headers to protected requests.
 * ============================================================
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://loanvault-production.up.railway.app';

/**
 * Core fetch helper function
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('lms_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized globally (token expired / invalid)
    if (response.status === 401 && !endpoint.includes('/api/auth/')) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_session');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    let data = null;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (!response.ok) {
          throw new Error(`Server error (${response.status}): ${response.statusText || 'Unexpected response'}`);
        }
        data = text;
      }
    }

    if (!response.ok) {
      const message = (data && typeof data === 'object' && data.message)
        ? data.message
        : `Server error (${response.status}): ${response.statusText || 'Unable to complete request'}`;
      throw new Error(message);
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// Export API helper methods
export const api = {
  get: (endpoint, headers = {}) => request(endpoint, { method: 'GET', headers }),
  post: (endpoint, body, headers = {}) => request(endpoint, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (endpoint, body, headers = {}) => request(endpoint, { method: 'PUT', body: JSON.stringify(body), headers }),
  delete: (endpoint, headers = {}) => request(endpoint, { method: 'DELETE', headers }),
  
  // OAuth2 Google Redirect URL
  googleAuthUrl: `${API_BASE_URL}/oauth2/authorization/google`,
};
