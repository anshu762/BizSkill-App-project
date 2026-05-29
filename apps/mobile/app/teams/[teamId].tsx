import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function TeamsRedirect() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (teamId) router.replace(`/team/${teamId}` as any);
  }, [teamId]);

  return (
    <View className="flex-1 items-center justify-center bg-surface">
      <ActivityIndicator color="#5B4DFF" size="large" />
    </View>
  );
}
