import "../global.css";

import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from "@expo-google-fonts/outfit";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { LogBox } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as SplashScreen from "expo-splash-screen";

import { queryClient } from "../src/lib/queryClient";
import { useAuthStore } from "../src/store/useAuthStore";
import { AnimatedSplash } from "../src/components/AnimatedSplash";

LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrate = useAuthStore((state) => state.hydrate);
  
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    // Only route once hydrated AND fonts are loaded AND splash animation completes
    if (!isHydrated || !fontsLoaded || showSplashOverlay) return;
    const area = segments[0];

    setTimeout(() => {
      if (!accessToken && area !== "(auth)") {
        router.replace("/(auth)/welcome");
      } else if (accessToken && !user?.hasOnboarded && area !== "(onboarding)") {
        router.replace("/(onboarding)");
      } else if (accessToken && user?.hasOnboarded && (area === "(auth)" || area === "(onboarding)")) {
        router.replace("/(tabs)");
      }
    }, 10);
  }, [accessToken, isHydrated, router, segments, user?.hasOnboarded, fontsLoaded, showSplashOverlay]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F7F8FC" } }} />
        {showSplashOverlay && (
          <AnimatedSplash onAnimationComplete={() => setShowSplashOverlay(false)} />
        )}
        <Toast />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
