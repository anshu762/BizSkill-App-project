import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { AvatarWithFallback } from "./AvatarWithFallback";
import { useToggleLike } from "../lib/apiHooks";
import type { FeedPost } from "@bizskills/types";

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  UPDATE: { label: "Update", color: "#5B4DFF", bg: "bg-indigo-50" },
  LAUNCH: { label: "Launch 🚀", color: "#059669", bg: "bg-green-50" },
  MILESTONE: { label: "Milestone 🏆", color: "#D97706", bg: "bg-amber-50" },
  COLLAB_REQUEST: { label: "Looking to Collab 🤝", color: "#DC2626", bg: "bg-red-50" },
  PRODUCT_DROP: { label: "Product Drop 🔥", color: "#7C3AED", bg: "bg-purple-50" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

interface PostCardProps {
  post: FeedPost;
  onCommentPress?: (postId: string) => void;
  onUserPress?: (userId: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, onCommentPress, onUserPress, onDelete }: PostCardProps) {
  const toggleLike = useToggleLike();
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[post.type] ?? typeConfig.UPDATE;
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = () => toggleLike.mutate(post.id);

  return (
    <View className="mb-4 rounded-3xl bg-white overflow-hidden">
      <View className="p-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => onUserPress?.(post.userId)} className="flex-row items-center flex-1">
            <AvatarWithFallback uri={post.user?.avatar} name={post.user?.name ?? "?"} size={40} />
            <View className="ml-3 flex-1">
              <Text className="font-semibold text-ink">{post.user?.name}</Text>
              <Text className="text-xs text-muted">{post.user?.businessProfile?.businessName ?? "Founder"} · {timeAgo(post.createdAt)}</Text>
            </View>
          </TouchableOpacity>
          <View className={`rounded-full ${config.bg} px-3 py-1.5`}>
            <Text className="text-xs font-medium" style={{ color: config.color }}>{config.label}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text className={`mt-4 text-sm leading-6 text-ink ${expanded ? "" : "max-h-[72px]"}`} numberOfLines={expanded ? undefined : 3}>
            {post.content}
          </Text>
          {!expanded && post.content.length > 150 && (
            <Text className="mt-1 text-sm font-semibold text-brand">Read more</Text>
          )}
        </TouchableOpacity>
      </View>

      {(post.imageUrl || post.image) && (
        <Image source={{ uri: post.imageUrl ?? post.image! }} className="w-full" style={{ aspectRatio: 16 / 9 }} resizeMode="cover" />
      )}

      <View className="flex-row items-center justify-between border-t border-slate-100 px-5 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleLike} className="flex-row items-center mr-6">
            <Ionicons name={post.isLikedByMe ? "heart" : "heart-outline"} size={20} color={post.isLikedByMe ? "#EF4444" : "#98A2B3"} />
            <Text className={`ml-1.5 text-sm font-medium ${post.isLikedByMe ? "text-red-500" : "text-muted"}`}>{post.likeCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onCommentPress?.(post.id)} className="flex-row items-center mr-6">
            <Ionicons name="chatbubble-outline" size={19} color="#98A2B3" />
            <Text className="ml-1.5 text-sm text-muted">{post.commentCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="share-outline" size={19} color="#98A2B3" />
          </TouchableOpacity>
        </View>
        {post.isOwnPost && (
          <TouchableOpacity onPress={() => onDelete?.(post.id)}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#98A2B3" />
          </TouchableOpacity>
        )}
      </View>

      {post.type === "COLLAB_REQUEST" && (
        <View className="px-5 pb-4">
          <TouchableOpacity className="h-11 items-center justify-center rounded-2xl bg-brand/10">
            <Text className="text-sm font-semibold text-brand">Request Collab 🤝</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
