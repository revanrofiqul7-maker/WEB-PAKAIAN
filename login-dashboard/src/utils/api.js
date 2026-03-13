// API Utility dengan auto-refresh token
let authContext = null;

export const setAuthContext = (context) => {
  authContext = context;
};

const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const apiCall = async (endpoint, options = {}) => {
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  // Jika token expired (403), coba refresh dan retry
  if (response.status === 403) {
    if (authContext && typeof authContext.refreshAccessToken === 'function') {
      const newToken = await authContext.refreshAccessToken();
      
      if (newToken) {
        // Retry request dengan token baru
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            ...getHeaders(),
            ...options.headers,
          },
        });
      }
    }
  }

  return response;
};

// Special handler untuk FormData (product upload, dll)
export const apiFormData = async (endpoint, method, formData) => {
  const token = localStorage.getItem('token');
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
    // Don't set Content-Type for FormData - browser will set it with boundary
  });

  // Jika token expired (403), coba refresh dan retry
  if (response.status === 403) {
    if (authContext && typeof authContext.refreshAccessToken === 'function') {
      const newToken = await authContext.refreshAccessToken();
      
      if (newToken) {
        const updatedHeaders = { 'Authorization': `Bearer ${newToken}` };
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method,
          headers: updatedHeaders,
          body: formData,
        });
      }
    }
  }

  return response;
};

// Helper untuk GET
export const apiGet = async (endpoint) => {
  const response = await apiCall(endpoint, {
    method: 'GET',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'API error');
  }
  
  return response.json();
};

// Helper untuk POST
export const apiPost = async (endpoint, data) => {
  const response = await apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'API error');
  }
  
  return response.json();
};

// Helper untuk PUT
export const apiPut = async (endpoint, data) => {
  const response = await apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'API error');
  }
  
  return response.json();
};

// Helper untuk DELETE
export const apiDelete = async (endpoint) => {
  const response = await apiCall(endpoint, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'API error');
  }
  
  return response.json();
};
