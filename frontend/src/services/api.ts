import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const USE_DEMO_FALLBACK =
  import.meta.env.VITE_USE_MOCK !== 'false';

export const TOKEN_STORAGE_KEY = 'jansahayak_auth_token';
export const USER_STORAGE_KEY = 'jansahayak_current_user';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    return Promise.reject(error);
  },
);

export async function withApiFallback<T>(
  apiCall: () => Promise<T>,
  fallbackCall: () => Promise<T> | T,
): Promise<T> {
  if (USE_DEMO_FALLBACK && !import.meta.env.VITE_API_BASE_URL) {
    return await fallbackCall();
  }
  try {
    return await apiCall();
  } catch (err) {
    if (USE_DEMO_FALLBACK) {
      return await fallbackCall();
    }
    throw err;
  }
}

export function simulateDelay(ms = 260): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
