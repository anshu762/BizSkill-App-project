import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/useAuthStore";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const api = axios.create({ baseURL: `${baseURL}/api` });

api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableConfig | undefined;
    const isAuthAction = original?.url?.startsWith("/auth/");

    if (error.response?.status === 401 && original && !original._retry && !isAuthAction) {
      original._retry = true;
      try {
        const accessToken = await useAuthStore.getState().refreshAccessToken();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        await useAuthStore.getState().clearSession();
      }
    }

    return Promise.reject(error);
  },
);

export const readApiError = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Unable to complete your request";
  }
  return "Something went wrong. Please try again.";
};

