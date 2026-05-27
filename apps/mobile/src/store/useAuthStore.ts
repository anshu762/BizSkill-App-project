import type { ApiResponse, User } from "@bizskills/types";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { api } from "../lib/axios";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user_data";
const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

type Session = { accessToken: string; refreshToken: string; user: User };

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => Promise<void>;
  refreshAccessToken: () => Promise<string>;
  hydrate: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const saveSession = async (session: Session) => {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, session.accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, session.refreshToken),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(session.user)),
  ]);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isHydrated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post<ApiResponse<Session>>("/auth/login", { email, password });
      if (!response.data.data) throw new Error("Missing session response");
      await saveSession(response.data.data);
      set({ ...response.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post<ApiResponse<Session>>("/auth/register", {
        name,
        email,
        password,
      });
      if (!response.data.data) throw new Error("Missing session response");
      await saveSession(response.data.data);
      set({ ...response.data.data });
    } finally {
      set({ isLoading: false });
    }
  },

  clearSession: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    set({ user: null, accessToken: null, refreshToken: null });
  },

  logout: async () => {
    const refreshToken = get().refreshToken;
    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } finally {
      await get().clearSession();
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) throw new Error("Missing refresh token");

    const response = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${baseURL}/api/auth/refresh`,
      { refreshToken },
    );
    const accessToken = response.data.data?.accessToken;
    if (!accessToken) throw new Error("Missing access token");

    await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
    set({ accessToken });
    return accessToken;
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken, rawUser] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_KEY),
        SecureStore.getItemAsync(REFRESH_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      set({
        accessToken,
        refreshToken,
        user: rawUser ? (JSON.parse(rawUser) as User) : null,
      });
    } finally {
      set({ isHydrated: true });
    }
  },

  updateUser: async (user) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user });
  },
}));

