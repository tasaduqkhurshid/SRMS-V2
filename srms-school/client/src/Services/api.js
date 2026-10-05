// src/api.js
import axios from "axios";

/**
 * Axios instance
 * baseURL is read from Vite env: VITE_API_BASE
 * Defaults to the same-origin Nginx API proxy.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api/admin/",
  // timeout: 10000, // optional
});

/**
 * Set or remove Authorization header and persist token
 * token: raw JWT string (NOT "Bearer ...")
 */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    try {
      localStorage.setItem("token", token);
    } catch (e) {
      console.warn("Could not write token to localStorage", e);
    }
  } else {
    delete api.defaults.headers.common.Authorization;
    try {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    } catch (e) {
      /* ignore */
    }
  }
};

/**
 * Get token from localStorage (safe)
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  } catch (e) {
    // silent localStorage read failure (removed console.warn)
    return null;
  }
};

/**
 * Request interceptor - always ensure Authorization header is present
 * even if api.defaults was lost. We read from localStorage for resilience.
 */
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      // normalize headers object (case-insensitive)
      config.headers = config.headers || {};
      if (!config.headers.Authorization && !config.headers.authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/**
 * Response interceptor - clear local authentication on 401 Unauthorized.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error?.config;

    // If 401 and not a retry, clear auth and optionally notify app
    if (error?.response?.status === 401) {
      // Prevent infinite loops for endpoints that return 401 on refresh attempts
      if (!originalRequest?._retry) {
        originalRequest._retry = true;

        // Clear token locally
        setAuthToken(null);
        try {
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
        } catch (e) {}

        return Promise.reject(error);
      }
    }

    // Other errors
    return Promise.reject(error);
  }
);

export default api;
