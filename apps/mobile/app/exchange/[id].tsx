import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { AppButton } from "../../src/components/AppButton";
import { useExchange } from "../../src/lib/apiHooks";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function ExchangeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const myId = useAuthStore((state) => state.user?.id);
  const { data: exchange, isLoading } = useExchange(id);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#5B4DFF" size="large" />
      </SafeAreaView>
    );
  }

  if (!exchange) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg text-muted">Exchange not found</Text>
          <AppButton label="Go back" variant="outline" onPress={() => router.back()} className="mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  const otherUser = exchange.fromUserId === myId ? exchange.toUser : exchange.fromUser;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mt-3 h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <Ionicons name="arrow-back" size={21} color="#101828" />
        </TouchableOpacity>
        <View className="mt-8 rounded-[30px] bg-white p-6">
          <View className="flex-row justify-between">
            <Text className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-brand">{exchange.skillRequested?.category ?? "SKILL"}</Text>
            <Text className="text-lg font-bold text-brand">{exchange.coinsOffered} BC</Text>
          </View>
          <Text className="mt-7 text-3xl font-bold tracking-tight text-ink">{exchange.skillRequested?.title ?? "Skill Exchange"}</Text>
          <Text className="mt-4 text-sm leading-6 text-muted">
            {exchange.skillRequested?.description ?? "Skill exchange request"}
          </Text>
          <View className="mt-7 flex-row items-center rounded-2xl bg-surface p-4">
            <AvatarWithFallback uri={otherUser?.avatar} name={otherUser?.name ?? "?"} size={48} />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-ink">{otherUser?.name ?? "User"}</Text>
              <Text className="mt-1 text-xs text-muted">Status: {exchange.status}</Text>
            </View>
          </View>
        </View>
        <View className="mt-8 rounded-3xl bg-white p-5">
          <Text className="mb-3 text-lg font-bold text-ink">Exchange Details</Text>
          <View className="flex-row justify-between rounded-2xl bg-surface p-3">
            <View className="flex-1 items-center">
              <Text className="text-xs text-muted">You offer</Text>
              <Text className="mt-1 text-sm font-semibold text-ink">{exchange.skillOffered?.title ?? "Skill"}</Text>
            </View>
            <Ionicons name="swap-horizontal" size={20} color="#5B4DFF" style={{ marginTop: 12 }} />
            <View className="flex-1 items-center">
              <Text className="text-xs text-muted">You get</Text>
              <Text className="mt-1 text-sm font-semibold text-ink">{exchange.skillRequested?.title ?? "Skill"}</Text>
            </View>
          </View>
          {exchange.message && (
            <View className="mt-4">
              <Text className="text-sm font-semibold text-ink">Message</Text>
              <Text className="mt-1 text-sm text-muted">{exchange.message}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

