import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { PageHeader } from "../../src/components/PageHeader";
import { useConversations } from "../../src/lib/apiHooks";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function MessagesScreen() {
  const router = useRouter();
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#5B4DFF" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-6">
        <PageHeader eyebrow="Inbox" title="Messages" />
        {conversations?.length > 0 ? (
          <FlatList
            data={conversations}
            keyExtractor={(item: any) => item.user.id}
            renderItem={({ item }: any) => (
              <TouchableOpacity
                onPress={() => router.push(`/messages/${item.user.id}` as any)}
                activeOpacity={0.86}
                className="mb-3 flex-row items-center rounded-3xl bg-white p-4"
              >
                <AvatarWithFallback uri={item.user?.avatar} name={item.user?.name?.[0] ?? "?"} size={50} />
                <View className="ml-4 flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-ink">{item.user.name}</Text>
                    <Text className="text-xs text-muted">{item.lastMessage ? timeAgo(item.lastMessage.createdAt) : ""}</Text>
                  </View>
                  <View className="mt-1 flex-row items-center">
                    <Text numberOfLines={1} className="flex-1 text-sm text-muted">
                      {item.lastMessage?.content ?? "No messages yet"}
                    </Text>
                    {item.unreadCount > 0 && (
                      <View className="ml-2 h-6 min-w-[24px] items-center justify-center rounded-full bg-brand px-2">
                        <Text className="text-xs font-bold text-white">{item.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerClassName="pb-8"
          />
        ) : (
          <View className="mt-20 items-center">
            <Text className="text-muted">No conversations yet</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
