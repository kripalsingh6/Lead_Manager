// Centralized API client helper
const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_API_URL ? `${RAW_API_URL.replace(/\/+$/, '')}/api` : '/api';

// Purge any legacy persistent tokens so sessions are strictly tab/window scoped
try {
  localStorage.removeItem('lead_manager_token');
  localStorage.removeItem('lead_manager_user');
} catch {
  // Ignore
}

/**
 * Session storage is destroyed automatically when the tab or browser is closed
 */
export const getStoredToken = () => {
  try {
    return sessionStorage.getItem('lead_manager_token') || null;
  } catch {
    return null;
  }
};

export const setStoredToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem('lead_manager_token', token);
    } else {
      sessionStorage.removeItem('lead_manager_token');
    }
  } catch {
    // Ignore
  }
};

export const getStoredUser = () => {
  try {
    const raw = sessionStorage.getItem('lead_manager_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user) {
      sessionStorage.setItem('lead_manager_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('lead_manager_user');
    }
  } catch {
    // Ignore
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
    if (response.status === 401) {
      // Clear expired short-lived session token
      setStoredToken(null);
      setStoredUser(null);
    }
    const message = data.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.errors = data.errors || [];
    throw error;
  }

  return data;
};

/**
 * Format a human-readable display name from an email prefix
 * e.g. "kripal.singh@gmail.com" -> "Kripal Singh"
 * e.g. "john_doe@company.io" -> "John Doe"
 */
export const formatNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return 'User';
  const prefix = email.split('@')[0];
  const cleaned = prefix.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
  if (!cleaned) return prefix;
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Get effective user display name:
 * - "Alex Morgan" ONLY for alex@leadmanager.io or demo@leadmanager.io
 * - For any other email: uses their saved custom name or extracts name from email
 */
export const getEffectiveDisplayName = (user) => {
  if (!user) return 'Guest';
  const email = (user.email || '').toLowerCase().trim();
  const isAlexDemo = email === 'alex@leadmanager.io' || email === 'demo@leadmanager.io';

  if (user.name && user.name.trim()) {
    // If user's email is not the demo email, don't show "Alex Morgan"
    if (!isAlexDemo && (user.name === 'Alex Morgan' || user.name === 'User' || user.name === 'Demo User')) {
      return formatNameFromEmail(user.email);
    }
    return user.name;
  }

  return formatNameFromEmail(user.email);
};

