import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../src/store/useAuthStore";

export default function EntryScreen() {
  const { accessToken, user, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#5B4DFF" />
      </View>
    );
  }

  if (!accessToken) return <Redirect href="/(auth)/welcome" />;
  if (!user?.hasOnboarded) return <Redirect href="/(onboarding)" />;
  return <Redirect href="/(tabs)" />;
}

