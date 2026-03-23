/**
 * API Client for ModShop
 * Handles all API requests with proper error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Make an authenticated API request
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request failed: ${endpoint}`, error);
    throw error;
  }
}

/**
 * GET request helper
 */
export async function get(endpoint) {
  return apiRequest(endpoint, { method: 'GET' });
}

/**
 * POST request helper
 */
export async function post(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT request helper
 */
export async function put(endpoint, body) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request helper
 */
export async function del(endpoint) {
  return apiRequest(endpoint, { method: 'DELETE' });
}

/**
 * Upload file helper
 */
export async function uploadFile(endpoint, file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Upload failed: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`File upload failed: ${endpoint}`, error);
    throw error;
  }
}
