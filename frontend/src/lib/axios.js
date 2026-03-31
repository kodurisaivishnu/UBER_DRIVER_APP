import axios from 'axios';
import useAuthStore from '@/store/authStore';
import { API, MESSAGES } from '@/constants';
import logger from '@/lib/logger';

const api = axios.create({
  baseURL: '/auth',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Auto-refresh on 401
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Don't retry refresh/login requests or already-retried requests
    const isAuthRequest =
      originalRequest.url === API.REFRESH ||
      originalRequest.url === API.LOGIN;

    if (status !== 401 || isAuthRequest || originalRequest._retried) {
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    // Single refresh call for concurrent 401s
    if (!refreshPromise) {
      refreshPromise = api
        .post(API.REFRESH)
        .then((res) => {
          const { accessToken } = res.data.data;
          useAuthStore.getState().setAuth(accessToken, useAuthStore.getState().user);
          logger.info('Token refreshed automatically');
          return accessToken;
        })
        .catch((err) => {
          useAuthStore.getState().clearAuth();
          logger.warn(MESSAGES.SESSION_EXPIRED);
          window.location.href = '/login';
          return Promise.reject(err);
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newToken = await refreshPromise;
    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  }
);

export default api;
