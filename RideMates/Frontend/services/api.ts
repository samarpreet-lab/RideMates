// =============================================================================
// Frontend/services/api.ts — Axios HTTP Client with JWT Interceptor
// =============================================================================
// Creates a centralized Axios instance that:
//   1. Points all requests to the backend API base URL
//   2. Automatically attaches the JWT token from SecureStore to every request
//   3. Provides helper functions for token storage/retrieval/deletion
//
// SRS References:
//   FR-AUTH-04 — All protected endpoints require JWT in Authorization header
//   FR-AUTH-05 — JWT stored securely on device (expo-secure-store)
// =============================================================================

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from '../constants/config';

const TOKEN_KEY = 'ridemates_jwt_token';

// FIX: Auth expiry callback for immediate navigation on 401
let onAuthExpiredCallback: (() => void) | null = null;

/** Register a callback to be invoked when the JWT token expires (401 received) */
export function onAuthExpired(callback: () => void): () => void {
  onAuthExpiredCallback = callback;
  return () => { onAuthExpiredCallback = null; };
}

// --- Create Axios instance ---
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 15000, // 15 seconds for slower mobile networks
});

// --- JWT Token helpers ---
// These functions let any screen store/retrieve/delete the JWT

/** Save JWT token to secure device storage */
export async function saveToken(token: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token to secure store:', error);
    throw error;
  }
}

/** Retrieve JWT token from secure device storage */
export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving token from secure store:', error);
    return null;
  }
}

/** Delete JWT token (used on logout or token expiry) */
export async function deleteToken(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error deleting token from secure store:', error);
  }
}

/** Check if user is logged in (has a stored token) */
export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return token !== null;
}


// --- Request interceptor: attach JWT to every request ---
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving JWT token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response interceptor: handle 401/403 (expired/invalid token, permission denied) ---
// FIX: Added 403 handling for permission denied errors + improved error logging
let isHandling401 = false; // Prevent multiple 401 handlers from running simultaneously

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const config = error.config;
    
    // Log network errors for debugging
    if (!error.response) {
      // Network error (no response from server)
      const errorDetails = {
        message: error.message,
        code: error.code, // ECONNREFUSED, ETIMEDOUT, etc.
        url: config?.url,
        baseURL: config?.baseURL,
        timeout: config?.timeout,
      };
      
      if (error.code === 'ECONNREFUSED') {
        console.error(
          '❌ Network Error: Cannot connect to backend',
          `\n📍 URL: ${config?.baseURL}${config?.url}`,
          `\n💡 Make sure:`,
          `  1. Backend server is running (npm run dev)`,
          `  2. IP address is correct in config.ts (Android: 10.0.2.2, Device: your machine IP)`,
          `  3. Port 5000 is accessible`,
          `\n🔍 Details:`, errorDetails
        );
      } else if (error.code === 'ETIMEDOUT') {
        console.error(
          '❌ Network Error: Connection timeout',
          `\n📍 URL: ${config?.baseURL}${config?.url}`,
          `\n⏱️ Timeout: ${config?.timeout}ms`,
          `\n💡 Backend may be slow or unreachable`
        );
      } else {
        console.error('❌ Network Error:', errorDetails);
      }
    }
    
    if (status === 401 && !isHandling401) {
      // Token is expired or invalid — clear it
      isHandling401 = true;
      try {
        await deleteToken();
        console.warn('🔐 Token expired or invalid - cleared from storage');
        // FIX: Immediately notify AuthGatekeeper to redirect
        if (onAuthExpiredCallback) {
          onAuthExpiredCallback();
        }
      } finally {
        isHandling401 = false;
      }
    } else if (status === 403) {
      // Permission denied - log but don't clear token
      console.warn('🚫 Access denied (403):', error.response?.data?.message || 'Permission denied');
    }
    
    return Promise.reject(error);
  }
);

export default api;