/**
 * ============================================================
 * API CLIENT SERVICE
 * Centralized fetch wrapper that communicates with our Spring Boot REST API.
 * Automatically attaches JWT Authorization headers to protected requests.
 * Intelligently routes between local Spring Boot (http://localhost:8080)
 * and production Railway cloud backend (https://loanvault-production.up.railway.app).
 * ============================================================
 */

const rawEnv = (import.meta.env.VITE_API_URL || '').trim();

const isLocalHost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const CLOUD_URL = 'https://loanvault-production.up.railway.app';
const LOCAL_URL = 'http://localhost:8080';

// Primary URL: If VITE_API_URL is configured, use it.
// If running on localhost, prefer http://localhost:8080 first.
// Otherwise, default to cloud Railway backend.
const PRIMARY_BASE_URL = (rawEnv && rawEnv.startsWith('http'))
  ? rawEnv.replace(/\/+$/, '')
  : (isLocalHost ? LOCAL_URL : CLOUD_URL);

const SECONDARY_BASE_URL = (PRIMARY_BASE_URL === LOCAL_URL) ? CLOUD_URL : LOCAL_URL;

/**
 * Core fetch helper function
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('lms_token');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let targetUrl = `${PRIMARY_BASE_URL}${path}`;

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
    let response;
    try {
      response = await fetch(targetUrl, config);
    } catch (networkErr) {
      // If primary fetch failed, attempt fallback to secondary URL
      try {
        targetUrl = `${SECONDARY_BASE_URL}${path}`;
        response = await fetch(targetUrl, config);
      } catch (fallbackErr) {
        throw networkErr;
      }
    }

    // Handle 401 Unauthorized globally (token expired / invalid)
    if (response.status === 401 && !endpoint.includes('/api/auth/')) {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_session');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }

    let data = null;
    let rawText = '';
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('json')) {
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
    }

    if (data === null) {
      rawText = await response.text().catch(() => '');
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          data = null;
        }
      }
    }

    if (!response.ok) {
      if (response.status === 502 || response.status === 503) {
        throw new Error('Backend server is starting up or offline. If running locally, please ensure Spring Boot is running on http://localhost:8080.');
      }
      if (data && typeof data === 'object' && data.message) {
        throw new Error(data.message);
      }
      if (rawText && !rawText.trim().startsWith('<')) {
        throw new Error(rawText.trim());
      }
      const statusText = response.statusText ? ` ${response.statusText}` : '';
      throw new Error(`Server error (${response.status})${statusText}`);
    }

    return data !== null ? data : rawText;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    if (error.name === 'TypeError' || (error.message && error.message.includes('Failed to fetch'))) {
      throw new Error('Unable to connect to LoanVault backend (http://localhost:8080). Please start your local Spring Boot server with "mvn spring-boot:run" in the backend directory.');
    }
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
  googleAuthUrl: `${PRIMARY_BASE_URL}/oauth2/authorization/google`,
};
