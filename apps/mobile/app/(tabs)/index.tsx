import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { AppText } from "../../src/components/ui/AppText";
import { AppCard } from "../../src/components/ui/AppCard";
import { AppButton } from "../../src/components/ui/AppButton";
import { SkeletonPostCard } from "../../src/components/ui/ShimmerLoader";
import { EmptyFeed } from "../../src/components/ui/EmptyState";
import { Avatar } from "../../src/components/ui/Avatar";
import { PostCard } from "../../src/components/PostCard";
import { CreatePostModal } from "../../src/components/CreatePostModal";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { useFeed, useProfileCompletion, useUnreadCount, useUpdatePost, useDeletePost, useUnreadMessageCount } from "../../src/lib/apiHooks";
import { api } from "../../src/lib/axios";
import { storage } from "../../src/lib/storage";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { Colors } from "../../src/constants/theme";

// Icons removed for cleaner UI

const filters = [
  { key: "all", label: "All" },
  { key: "following", label: "Following" },
  { key: "launches", label: "Launches" },
  { key: "milestones", label: "Milestones" },
  { key: "collab", label: "Collabs" },
];

function DashboardCard() {
  const user = useAuthStore((s) => s.user);
  const [visible, setVisible] = useState(false);
  const completion = useProfileCompletion();
  const theme = useThemeColors();

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
    <AppCard elevated style={{ marginBottom: 20, backgroundColor: theme.isDark ? '#231F35' : Colors.inkPrimary }}>
      <View className="flex-row items-center justify-between">
        <AppText variant="h3" style={{ color: '#FFFFFF', fontSize: 18 }}>Your BizSkills Today</AppText>
        <TouchableOpacity onPress={dismiss}>
          <Ionicons name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      <View className="mt-6 flex-row justify-between">
        <StatItem icon="wallet-outline" value={wallet?.balance ?? user?.bizCoins ?? 0} label="Coins" />
        <StatItem icon="swap-horizontal-outline" value={pendingExchanges} label="Pending" />
        <StatItem icon="chatbubble-ellipses-outline" value={unreadMessages} label="Messages" />
      </View>
      <View className="mt-6">
        <View className="flex-row items-center justify-between">
          <AppText variant="caption" style={{ color: '#A5B4FC' }}>Profile completion</AppText>
          <AppText variant="label" style={{ color: '#FFFFFF' }}>{completion}%</AppText>
        </View>
        <View className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-900/50">
          <View className="h-full rounded-full bg-brand" style={{ width: `${completion}%` }} />
        </View>
      </View>
    </AppCard>
  );
}

function StatItem({ icon, value, label }: { icon: keyof typeof Ionicons.glyphMap; value: number; label: string }) {
  return (
    <View className="items-center">
      <Ionicons name={icon} size={20} color="#A5B4FC" />
      <AppText variant="h2" style={{ color: '#FFFFFF', marginTop: 8 }}>{value}</AppText>
      <AppText variant="caption" style={{ color: '#A5B4FC', marginTop: 2 }}>{label}</AppText>
    </View>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const theme = useThemeColors();
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed(filter);
  const { data: unreadCount } = useUnreadCount();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const allPosts = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View className="px-6">
          <View className="mt-4 mb-5 flex-row items-center justify-between">
            <AppText variant="h1">BizSkills</AppText>
            <TouchableOpacity onPress={() => router.push("/notifications" as any)} className="relative">
              <Ionicons name="notifications-outline" size={26} color={theme.textPrimary} />
              {(unreadCount ?? 0) > 0 && (
                <View className="absolute -right-1.5 -top-1.5 h-5 w-5 items-center justify-center rounded-full bg-red-500">
                  <AppText style={{ fontSize: 10, color: '#FFFFFF', fontFamily: 'Outfit_700Bold' }}>{unreadCount! > 9 ? "9+" : unreadCount}</AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setCreateOpen(true)}
            activeOpacity={0.8}
            style={{ marginBottom: 16 }}
          >
            <AppCard style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <Avatar uri={user?.avatar} name={user?.name ?? "B"} size={40} />
              <AppText variant="body" style={{ color: theme.textTertiary, marginLeft: 12 }}>What's happening with your business?</AppText>
            </AppCard>
          </TouchableOpacity>

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={filters}
            keyExtractor={(f) => f.key}
            className="mb-4"
            renderItem={({ item }) => {
              const isSelected = filter === item.key;
              return (
                <TouchableOpacity
                  onPress={() => setFilter(item.key)}
                  activeOpacity={0.88}
                  className="mr-2 flex-row items-center rounded-xl border px-4 py-2.5"
                  style={{
                    backgroundColor: isSelected ? Colors.brand : theme.elevated,
                    borderColor: isSelected ? Colors.brand : theme.border,
                  }}
                >
                  <AppText
                    variant="label"
                    style={{
                      color: isSelected ? "#FFFFFF" : theme.textSecondary,
                    }}
                  >{item.label}</AppText>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <FlatList
          data={isLoading ? Array(3).fill(null) : allPosts}
          keyExtractor={(item, i) => item?.id ?? String(i)}
          contentContainerClassName="px-6 pb-24"
          onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={<DashboardCard />}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-4" color={Colors.brand} /> : null}
          ListEmptyComponent={
            isLoading ? (
              <>
                <SkeletonPostCard />
                <SkeletonPostCard />
                <SkeletonPostCard />
              </>
            ) : (
              <EmptyFeed onAction={() => setCreateOpen(true)} />
            )
          }
          renderItem={({ item }) =>
            isLoading ? <SkeletonPostCard /> : (
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
