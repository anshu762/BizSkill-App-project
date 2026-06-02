import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Text, View, Animated } from "react-native";
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
  const [isReady, setIsReady] = useState(false);
  const [splashOpacity] = useState(new Animated.Value(1));
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const hideSplash = useCallback(async () => {
    setIsReady(true);
    await SplashScreen.hideAsync();
    
    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setShowSplashOverlay(false);
    });
  }, [splashOpacity]);

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => hideSplash(), 800);
      return () => clearTimeout(timer);
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
      <View className="flex-1 items-center justify-center bg-brand">
        <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-white/20">
          <Text className="text-4xl font-bold text-white">B</Text>
        </View>
        <Text className="mt-4 text-2xl font-bold text-white">BizSkills</Text>
        <Text className="mt-2 text-sm text-indigo-200">Trade skills. Build businesses.</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F7F8FC" } }} />
        {showSplashOverlay && (
          <Animated.View 
            style={{ opacity: splashOpacity, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} 
            className="items-center justify-center bg-brand z-50"
          >
            <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-white/20">
              <Text className="text-4xl font-bold text-white">B</Text>
            </View>
            <Text className="mt-4 text-2xl font-bold text-white">BizSkills</Text>
            <Text className="mt-2 text-sm text-indigo-200">Trade skills. Build businesses.</Text>
          </Animated.View>
        )}
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
