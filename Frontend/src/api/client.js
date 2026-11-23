// Centralized API client helper
const API_BASE = '/api';

export const getStoredToken = () => {
  return localStorage.getItem('lead_manager_token') || null;
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem('lead_manager_token', token);
  } else {
    localStorage.removeItem('lead_manager_token');
  }
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('lead_manager_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('lead_manager_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('lead_manager_user');
  }
};

export const apiRequest = async (endpoint, options = {}) => {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include'
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
};

