import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { queryClient } from "../src/lib/queryClient";
import { useAuthStore } from "../src/store/useAuthStore";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!isHydrated) return;
    const area = segments[0];

    if (!accessToken && area !== "(auth)") {
      router.replace("/(auth)/welcome");
    } else if (accessToken && !user?.hasOnboarded && area !== "(onboarding)") {
      router.replace("/(onboarding)");
    } else if (accessToken && user?.hasOnboarded && (area === "(auth)" || area === "(onboarding)")) {
      router.replace("/(tabs)");
    }
  }, [accessToken, isHydrated, router, segments, user?.hasOnboarded]);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#5B4DFF" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F7F8FC" } }} />
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

