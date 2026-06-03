import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { PostCard } from "../../src/components/PostCard";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { CreatePostModal } from "../../src/components/CreatePostModal";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { PostCardSkeleton } from "../../src/components/Skeletons";
import { useFeed, useProfileCompletion, useUnreadCount, useUpdatePost, useDeletePost, useUnreadMessageCount } from "../../src/lib/apiHooks";
import { api } from "../../src/lib/axios";
import { storage } from "../../src/lib/storage";
import { useAuthStore } from "../../src/store/useAuthStore";

const filterIcons: Record<string, string> = {
  all: "apps-outline",
  following: "people-outline",
  launches: "rocket-outline",
  milestones: "trophy-outline",
  collab: "hand-left-outline",
};

const filters = [
  { key: "all", label: "All" },
  { key: "following", label: "Following" },
  { key: "launches", label: "Launches" },
  { key: "milestones", label: "Milestones" },
  { key: "collab", label: "Collabs" },
];

function DashboardCard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [visible, setVisible] = useState(false);
  const completion = useProfileCompletion();

  const { data: wallet } = useQuery({ queryKey: ["wallet"], queryFn: async () => { const r = await api.get("/wallet"); return r.data.data; } });
  const { data: exchanges } = useQuery({ queryKey: ["exchanges"], queryFn: async () => { const r = await api.get("/exchanges?status=PENDING"); return r.data; } });
  const { data: messages } = useUnreadMessageCount();

  useEffect(() => {
    storage.getItem("dashboard_last_seen").then((d) => {
      if (d !== new Date().toDateString()) setVisible(true);
    });
  }, []);

  const dismiss = () => {
    setVisible(false);
    storage.setItem("dashboard_last_seen", new Date().toDateString());
  };

  if (!visible) return null;

  const pendingExchanges = exchanges?.pagination?.total ?? 0;
  const unreadMessages = messages ?? 0;

  return (
    <View className="mb-5 rounded-3xl bg-ink p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-white">Your BizSkills Today</Text>
        <TouchableOpacity onPress={dismiss}>
          <Ionicons name="close" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      <View className="mt-4 flex-row justify-between">
        <StatItem icon="wallet-outline" value={wallet?.balance ?? user?.bizCoins ?? 0} label="Coins" />
        <StatItem icon="swap-horizontal-outline" value={pendingExchanges} label="Pending" />
        <StatItem icon="chatbubble-ellipses-outline" value={unreadMessages} label="Messages" />
      </View>
      <View className="mt-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-indigo-200">Profile completion</Text>
          <Text className="text-xs font-semibold text-white">{completion}%</Text>
        </View>
        <View className="mt-1.5 h-2 overflow-hidden rounded-full bg-indigo-900/50">
          <View className="h-full rounded-full bg-brand" style={{ width: `${completion}%` }} />
        </View>
      </View>
    </View>
  );
}

function StatItem({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <View className="items-center">
      <Ionicons name={icon as any} size={18} color="#A5B4FC" />
      <Text className="mt-1 text-lg font-bold text-white">{value}</Text>
      <Text className="text-xs text-indigo-200">{label}</Text>
    </View>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(filter);
  const { data: unreadCount } = useUnreadCount();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const allPosts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <ErrorBoundary>
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
                activeOpacity={0.88}
                className={`mr-2 flex-row items-center rounded-xl border px-4 py-2.5 ${
                  filter === item.key
                    ? "border-brand bg-brand"
                    : "border-slate-200 bg-white"
                }`}
                style={filter === item.key ? { backgroundColor: "#5B4DFF", borderColor: "#5B4DFF" } : undefined}
              >
                <Ionicons
                  name={filterIcons[item.key] as any}
                  size={14}
                  color={filter === item.key ? "#FFFFFF" : "#667085"}
                />
                <Text
                  className={`ml-1.5 text-sm font-medium ${
                    filter === item.key ? "text-white" : "text-muted"
                  }`}
                  style={filter === item.key ? { color: "#FFFFFF" } : undefined}
                >{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        <FlatList
          data={isLoading ? Array(3).fill(null) : allPosts}
          keyExtractor={(item, i) => item?.id ?? String(i)}
          contentContainerClassName="px-6 pb-8"
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={<DashboardCard />}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-4" color="#5B4DFF" /> : null}
          ListEmptyComponent={
            isLoading ? (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            ) : (
              <View className="mt-16 items-center px-4">
                <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-indigo-50">
                  <Ionicons name="newspaper-outline" size={36} color="#5B4DFF" />
                </View>
                <Text className="mt-5 text-xl font-bold text-ink">No posts yet</Text>
                <Text className="mt-2 text-center text-sm leading-5 text-muted">The feed is empty. Share your first update, milestone, or launch with the community!</Text>
                <TouchableOpacity
                  onPress={() => setCreateOpen(true)}
                  className="mt-6 rounded-full bg-brand px-8 py-3.5"
                >
                  <Text className="font-semibold text-white">Create Your First Post</Text>
                </TouchableOpacity>
              </View>
            )
          }
          renderItem={({ item }) =>
            isLoading ? <PostCardSkeleton /> : (
              <PostCard
                post={item}
                onCommentPress={(postId) => router.push(`/post/${postId}` as any)}
                onUserPress={(userId) => router.push(`/profile/${userId}` as any)}
                onDelete={(postId) => deletePost.mutate(postId)}
                onEdit={(postId, content) => updatePost.mutateAsync({ postId, content })}
              />
            )
          }
        />

        <CreatePostModal visible={createOpen} onClose={() => setCreateOpen(false)} />
      </SafeAreaView>
    </ErrorBoundary>
  );
}
