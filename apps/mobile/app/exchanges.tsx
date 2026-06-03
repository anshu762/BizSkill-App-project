import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { AppButton } from "../src/components/AppButton";
import { AvatarWithFallback } from "../src/components/AvatarWithFallback";
import { SelectableChip } from "../src/components/SelectableChip";
import { ReviewModal } from "../src/components/ReviewModal";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { useExchanges, useUpdateExchangeStatus } from "../src/lib/apiHooks";
import { readApiError } from "../src/lib/axios";
import { useAuthStore } from "../src/store/useAuthStore";
import type { ExchangeStatus } from "@bizskills/types";

const tabs = [
  { key: "", label: "All" },
  { key: "incoming", label: "Incoming" },
  { key: "outgoing", label: "Outgoing" },
  { key: "completed", label: "Completed" },
] as const;

const statusStyles: Record<ExchangeStatus, { bg: string; text: string; icon: string }> = {
  PENDING: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "time-outline" },
  ACCEPTED: { bg: "bg-blue-50", text: "text-blue-700", icon: "checkmark-circle-outline" },
  REJECTED: { bg: "bg-red-50", text: "text-red-700", icon: "close-circle-outline" },
  COMPLETED: { bg: "bg-green-50", text: "text-green-700", icon: "checkmark-done-outline" },
  CANCELLED: { bg: "bg-gray-50", text: "text-gray-500", icon: "ban-outline" },
};

export default function ExchangesScreen() {
  const router = useRouter();
  const myId = useAuthStore((state) => state.user?.id);
  const [tab, setTab] = useState("");
  const [reviewExchange, setReviewExchange] = useState<string | null>(null);
  const updateStatus = useUpdateExchangeStatus();
  const { data, isLoading, refetch } = useExchanges(tab === "completed" ? "all" : tab, tab === "completed" ? "COMPLETED" : undefined);

  const exchanges = data?.data ?? [];

  const handleAction = async (id: string, action: "accept" | "reject" | "complete" | "cancel") => {
    try {
      await updateStatus.mutateAsync({ id, action });
      Toast.show({ type: "success", text1: `Exchange ${action}ed` });
      refetch();
    } catch (error) {
      Toast.show({ type: "error", text1: "Action failed", text2: readApiError(error) });
    }
  };

  const renderActions = (item: any) => {
    const isIncoming = item.toUserId === myId;
    const isOutgoing = item.fromUserId === myId;
    switch (item.status) {
      case "PENDING":
        return (
          <View className="mt-3 flex-row">
            {isIncoming && (
              <>
                <AppButton label="Accept" onPress={() => handleAction(item.id, "accept")} className="mr-2 flex-1" />
                <AppButton label="Reject" variant="outline" onPress={() => handleAction(item.id, "reject")} className="flex-1" />
              </>
            )}
            {isOutgoing && <AppButton label="Cancel" variant="outline" onPress={() => handleAction(item.id, "cancel")} className="flex-1" />}
          </View>
        );
      case "ACCEPTED":
        return <AppButton label="Mark Complete" onPress={() => handleAction(item.id, "complete")} className="mt-3" />;
      case "COMPLETED":
        return <AppButton label="Leave Review" variant="outline" onPress={() => setReviewExchange(item.id)} className="mt-3" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#5B4DFF" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-6">
          <Text className="mb-6 mt-4 text-2xl font-bold text-ink">Exchanges</Text>
          <View className="mb-4 flex-row flex-wrap">
            {tabs.map((t) => (
              <SelectableChip
                key={t.key}
                label={t.label}
                selected={tab === t.key}
                onPress={() => setTab(t.key)}
                chipStyle="pill"
              />
            ))}
          </View>
        </View>

        <FlatList
          data={exchanges}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-8"
          ListEmptyComponent={
            <View className="mt-20 items-center px-4">
              <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-indigo-50">
                <Ionicons name="swap-horizontal-outline" size={36} color="#5B4DFF" />
              </View>
              <Text className="mt-5 text-xl font-bold text-ink">No exchanges yet</Text>
              <Text className="mt-2 text-center text-sm leading-5 text-muted">Discover skills in the marketplace and send your first exchange request to get started.</Text>
              <AppButton label="Browse Marketplace" onPress={() => router.push("/(tabs)/marketplace" as any)} className="mt-6" />
            </View>
          }
          renderItem={({ item }) => {
            const otherUser = item.fromUserId === myId ? item.toUser : item.fromUser;
            const statusStyle = statusStyles[item.status as ExchangeStatus];
            return (
              <View className="mb-4 rounded-3xl bg-white p-5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <AvatarWithFallback uri={otherUser?.avatar} name={otherUser?.name ?? "?"} size={36} />
                    <Text className="ml-3 font-semibold text-ink">{otherUser?.name}</Text>
                  </View>
                  <View className={`rounded-full ${statusStyle.bg} px-3 py-1.5`}>
                    <Text className={`text-xs font-semibold ${statusStyle.text}`}>{item.status}</Text>
                  </View>
                </View>
                <View className="mt-3 flex-row justify-between rounded-2xl bg-surface p-3">
                  <View className="flex-1 items-center">
                    <Text className="text-xs text-muted">You offer</Text>
                    <Text className="mt-1 text-sm font-semibold text-ink">{item.skillOffered?.title ?? "Skill"}</Text>
                  </View>
                  <Ionicons name="swap-horizontal" size={20} color="#5B4DFF" style={{ marginTop: 12 }} />
                  <View className="flex-1 items-center">
                    <Text className="text-xs text-muted">You get</Text>
                    <Text className="mt-1 text-sm font-semibold text-ink">{item.skillRequested?.title ?? "Skill"}</Text>
                  </View>
                </View>
                {renderActions(item)}
              </View>
            );
          }}
        />

        {reviewExchange && <ReviewModal visible={!!reviewExchange} onClose={() => setReviewExchange(null)} exchangeId={reviewExchange} />}
      </SafeAreaView>
    </ErrorBoundary>
  );
}
