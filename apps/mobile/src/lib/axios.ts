import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

export function getBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web") return "http://localhost:3000";

  try {
    const hostUri = (Constants.expoConfig as any)?.hostUri;
    if (hostUri) {
      const host = hostUri.split(":")[0];
      return `http://${host}:3000`;
    }
  } catch {}

  if (Platform.OS === "android") return "http://10.0.2.2:3000";

  return "http://localhost:3000";
}

const baseURL = getBaseUrl();

export const api = axios.create({ baseURL: `${baseURL}/api`, timeout: 10_000 });

function getAuthStore() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require("../store/useAuthStore").useAuthStore;
}

api.interceptors.request.use((config) => {
  const accessToken = getAuthStore().getState().accessToken;
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
        const accessToken = await getAuthStore().getState().refreshAccessToken();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        await getAuthStore().getState().clearSession();
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

