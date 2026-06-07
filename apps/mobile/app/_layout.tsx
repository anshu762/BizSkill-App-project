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
import { toastConfig } from "../src/components/ui/ToastConfig";

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
  "Unable to activate keep awake",
]);
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

  // Hide the native OS splash ONLY when fonts are ready.
  // This prevents the JS AnimatedSplash from rendering text without fonts.
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    void hydrate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Route only after: auth hydrated + fonts loaded + splash animation done
  useEffect(() => {
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

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />

        {/* Main app — only mount after fonts are ready */}
        {fontsLoaded && (
          <>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FFFFFF" } }} />
            <Toast config={toastConfig} visibilityTime={2000} topOffset={50} />
          </>
        )}

        {/* JS Splash overlay — starts seamlessly after native splash hides */}
        {showSplashOverlay && fontsLoaded && (
          <AnimatedSplash onAnimationComplete={() => setShowSplashOverlay(false)} />
        )}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
