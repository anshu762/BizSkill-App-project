import "../global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Text, View, Animated, Easing, LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";
import { queryClient } from "../src/lib/queryClient";
import { useAuthStore } from "../src/store/useAuthStore";

LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  
  const [splashOpacity] = useState(new Animated.Value(1));
  const [splashScale] = useState(new Animated.Value(0.95));
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);

  // Initial gentle scale-in animation
  useEffect(() => {
    Animated.timing(splashScale, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [splashScale]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Premium splash screen fade out
  useEffect(() => {
    if (isHydrated) {
      // Hold for 2.2 seconds to let app mount, feel deliberate like Instagram
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync();
        
        Animated.parallel([
          Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(splashScale, {
            toValue: 1.15, // Smooth zoom-in as it fades away
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        ]).start(() => {
          setShowSplashOverlay(false);
        });
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, splashOpacity, splashScale]);

  useEffect(() => {
    if (!isHydrated) return;
    const area = segments[0];

    // Tiny delay to ensure navigation is ready
    setTimeout(() => {
      if (!accessToken && area !== "(auth)") {
        router.replace("/(auth)/welcome");
      } else if (accessToken && !user?.hasOnboarded && area !== "(onboarding)") {
        router.replace("/(onboarding)");
      } else if (accessToken && user?.hasOnboarded && (area === "(auth)" || area === "(onboarding)")) {
        router.replace("/(tabs)");
      }
    }, 10);
  }, [accessToken, isHydrated, router, segments, user?.hasOnboarded]);

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
            <Animated.View style={{ transform: [{ scale: splashScale }], alignItems: "center" }}>
              <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-white/20">
                <Text className="text-4xl font-bold text-white">B</Text>
              </View>
              <Text className="mt-4 text-2xl font-bold text-white">BizSkills</Text>
              <Text className="mt-2 text-sm text-indigo-200">Trade skills. Build businesses.</Text>
            </Animated.View>
          </Animated.View>
        )}
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
