import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
import { queryClient } from "../src/lib/queryClient";
import { useAuthStore } from "../src/store/useAuthStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const splashOpacity = useRef(new Animated.Value(1));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const hideSplash = useCallback(async () => {
    Animated.timing(splashOpacity.current, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(async () => {
      setIsReady(true);
      await SplashScreen.hideAsync();
    });
  }, []);

  useEffect(() => {
    if (isHydrated) {
      setTimeout(() => hideSplash(), 800);
    }
  }, [isHydrated, hideSplash]);

  useEffect(() => {
    if (!isReady) return;
    const area = segments[0];

    if (!accessToken && area !== "(auth)") {
      router.replace("/(auth)/welcome");
    } else if (accessToken && !user?.hasOnboarded && area !== "(onboarding)") {
      router.replace("/(onboarding)");
    } else if (accessToken && user?.hasOnboarded && (area === "(auth)" || area === "(onboarding)")) {
      router.replace("/(tabs)");
    }
  }, [accessToken, isReady, router, segments, user?.hasOnboarded]);

  if (!isReady) {
    return (
      <Animated.View style={[styles.splash, { opacity: splashOpacity.current }]}>
        <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-brand">
          <Animated.Text className="text-4xl font-bold text-white">B</Animated.Text>
        </View>
        <Animated.Text className="mt-4 text-2xl font-bold text-white">BizSkills</Animated.Text>
        <Animated.Text className="mt-2 text-sm text-indigo-200">Trade skills. Build businesses.</Animated.Text>
      </Animated.View>
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

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#5B4DFF",
  },
});
