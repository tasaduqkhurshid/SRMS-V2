// src/api.js
import axios from "axios";

/**
 * Axios instance
 * baseURL is read from Vite env: VITE_API_BASE
 * fallback to http://localhost:5050/
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5050/",
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
    return localStorage.getItem("token");
  } catch (e) {
    // silent localStorage read failure (removed console.warn)
    return null;
  }
};

/**
 * Logout helper - clears token and optional user storage keys.
 * Optionally provide a callback (e.g. to redirect).
 */
export const logout = (onLogoutCallback) => {
  setAuthToken(null);
  try {
    localStorage.removeItem("user");
  } catch (e) {}
  if (typeof onLogoutCallback === "function") onLogoutCallback();
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
 * Response interceptor - optional auto-logout on 401 Unauthorized.
 * You can pass an onLogout callback during import by setting api.__onLogout (not typical),
 * or simply listen for 401s and handle them globally in your app.
 *
 * NOTE: If you implement refresh-token flow, implement it here and return a retried request.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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
        } catch (e) {}

        // If you want a global handler (e.g. to redirect to login), set this on the api object:
        // api.__onLogout && api.__onLogout();
        // Otherwise handle 401 in your error boundaries or central store.

        // Optionally, return Promise.reject(error) so callers handle it
        return Promise.reject(error);
      }
    }

    // Other errors
    return Promise.reject(error);
  }
);

/**
 * Optional helper to restore token into axios defaults at app startup.
 * Call this once in your app entry (e.g. main.js) to hydrate axios with stored token:
 *
 *   import { hydrateAuth } from "./api";
 *   hydrateAuth();
 */
export const hydrateAuth = () => {
  const token = getAuthToken();
  if (token) setAuthToken(token);
};

/**
 * Optional: allow setting a global on-logout callback.
 * Example:
 *   import { api } from "./api";
 *   api.setOnLogout(() => router.push("/login"));
 */
api.setOnLogout = (fn) => {
  if (typeof fn === "function") {
    api.__onLogout = fn;
  }
};

export default api;

/*
==========================================
Notes & optional refresh-token sketch (not implemented):
==========================================

If you use refresh tokens, implement the refresh flow in the response interceptor:
- On 401, check if originalRequest._retry is false.
- Call your refresh endpoint with refresh token (must be stored securely - httpOnly cookie preferred).
- If refresh succeeds, set new token (setAuthToken) and retry originalRequest.
- If refresh fails, logout.

Do NOT store refresh tokens in localStorage if you care about XSS security.
Prefer httpOnly secure cookies for refresh tokens and read new access token from response.

*/
