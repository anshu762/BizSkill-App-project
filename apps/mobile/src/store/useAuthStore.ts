import type { ApiResponse, User } from "@bizskills/types";
import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { create } from "zustand";
import { api } from "../lib/axios";
import { storage } from "../lib/storage";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user_data";

function getBaseUrl(): string {
  if (Platform.OS === "web") return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
  try {
    const hostUri = (Constants.expoConfig as any)?.hostUri;
    if (hostUri) return `http://${hostUri.split(":")[0]}:3000`;
  } catch {}
  if (Platform.OS === "android") return "http://10.0.2.2:3000";
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
}

const baseURL = getBaseUrl();

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
    storage.setItem(ACCESS_KEY, session.accessToken),
    storage.setItem(REFRESH_KEY, session.refreshToken),
    storage.setItem(USER_KEY, JSON.stringify(session.user)),
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
      storage.deleteItem(ACCESS_KEY),
      storage.deleteItem(REFRESH_KEY),
      storage.deleteItem(USER_KEY),
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

    await storage.setItem(ACCESS_KEY, accessToken);
    set({ accessToken });
    return accessToken;
  },

  hydrate: async () => {
    try {
      const [accessToken, refreshToken, rawUser] = await Promise.all([
        storage.getItem(ACCESS_KEY),
        storage.getItem(REFRESH_KEY),
        storage.getItem(USER_KEY),
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
    await storage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },
}));

