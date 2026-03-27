import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "https://api.payvioapp.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attach JWT
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.data.access_token;
        const newRefreshToken = data.data.refresh_token;

        await SecureStore.setItemAsync("access_token", newAccessToken);
        await SecureStore.setItemAsync("refresh_token", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear tokens and redirect to login
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        // Navigation to login handled by auth context
      }
    }

    return Promise.reject(error);
  }
);

export { api };
