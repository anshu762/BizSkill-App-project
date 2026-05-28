import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PostCard } from "../../src/components/PostCard";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { CreatePostModal } from "../../src/components/CreatePostModal";
import { useFeed, useUnreadCount } from "../../src/lib/apiHooks";
import { useAuthStore } from "../../src/store/useAuthStore";

const filters = [
  { key: "all", label: "All" },
  { key: "following", label: "Following" },
  { key: "launches", label: "🚀 Launches" },
  { key: "milestones", label: "🏆 Milestones" },
  { key: "collab", label: "🤝 Collabs" },
];

export default function FeedScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(filter);
  const { data: unreadCount } = useUnreadCount();

  const allPosts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6">
        <View className="mt-4 mb-5 flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-ink">BizSkills</Text>
          <TouchableOpacity onPress={() => router.push("/notifications" as any)} className="relative">
            <Ionicons name="notifications-outline" size={24} color="#101828" />
            {(unreadCount ?? 0) > 0 && (
              <View className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                <Text className="text-[10px] font-bold text-white">{unreadCount! > 9 ? "9+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setCreateOpen(true)}
          className="mb-4 flex-row items-center rounded-3xl bg-white p-4"
        >
          <AvatarWithFallback uri={user?.avatar} name={user?.name ?? "B"} size={40} />
          <Text className="ml-3 text-sm text-muted">What's happening with your business?</Text>
        </TouchableOpacity>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(f) => f.key}
          className="mb-4"
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.key)}
              className={`mr-2 rounded-full px-5 py-3 ${filter === item.key ? "bg-brand" : "bg-white"}`}
            >
              <Text className={`text-sm font-medium ${filter === item.key ? "text-white" : "text-muted"}`}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={allPosts}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-6 pb-8"
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-4" color="#5B4DFF" /> : null}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator className="mt-10" color="#5B4DFF" size="large" />
          ) : (
            <View className="mt-10 items-center">
              <Text className="text-sm text-muted">No posts yet. Be the first to post!</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onCommentPress={(postId) => router.push(`/post/${postId}` as any)}
            onUserPress={(userId) => router.push(`/profile/${userId}` as any)}
          />
        )}
      />

      <CreatePostModal visible={createOpen} onClose={() => setCreateOpen(false)} />
    </SafeAreaView>
  );
}
