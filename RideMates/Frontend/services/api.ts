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

// --- Create Axios instance ---
const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 10000, // If the backend takes longer than 10 seconds, fail safely
});

// --- JWT Token helpers ---
// These functions let any screen store/retrieve/delete the JWT

/** Save JWT token to secure device storage */
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/** Retrieve JWT token from secure device storage */
export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/** Delete JWT token (used on logout or token expiry) */
export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
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

// --- Response interceptor: handle 401 (expired/invalid token) ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid — clear it
      await deleteToken();
      // The frontend should redirect to login screen when it detects no token
    }
    return Promise.reject(error);
  }
);

export default api;