import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotifications, useMarkAllRead } from "../src/lib/apiHooks";

const iconMap: Record<string, { icon: string; color: string }> = {
  LIKE: { icon: "heart", color: "#EF4444" },
  COMMENT: { icon: "chatbubble", color: "#5B4DFF" },
  FOLLOW: { icon: "person-add", color: "#059669" },
  EXCHANGE_REQUEST: { icon: "swap-horizontal", color: "#D97706" },
  EXCHANGE_UPDATE: { icon: "checkmark-circle", color: "#5B4DFF" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading } = useNotifications();
  const markAllRead = useMarkAllRead();
  const notifications = data?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-white">
              <Ionicons name="arrow-back" size={21} color="#101828" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-ink">Notifications</Text>
          </View>
          {notifications.some((n: any) => !n.isRead) && (
            <TouchableOpacity onPress={() => markAllRead.mutate()}>
              <Text className="text-sm font-semibold text-brand">Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#5B4DFF" size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item: any) => item.id}
          contentContainerClassName="px-6 pb-8"
          ListEmptyComponent={<Text className="mt-10 text-center text-sm text-muted">No notifications yet</Text>}
          renderItem={({ item }: { item: any }) => {
            const config = iconMap[item.type] ?? { icon: "ellipse", color: "#98A2B3" };
            return (
              <TouchableOpacity
                className={`mb-3 flex-row items-center rounded-3xl p-4 ${item.isRead ? "bg-white" : "bg-indigo-50/60"}`}
                onPress={() => {
                  if (item.link) router.push(item.link as any);
                }}
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                  <Ionicons name={config.icon as any} size={20} color={config.color} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className={`text-sm leading-5 ${item.isRead ? "text-muted" : "font-semibold text-ink"}`}>{item.message}</Text>
                  <Text className="mt-0.5 text-xs text-muted">{timeAgo(item.createdAt)}</Text>
                </View>
                {!item.isRead && <View className="h-2.5 w-2.5 rounded-full bg-brand" />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
