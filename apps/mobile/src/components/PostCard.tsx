import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import { Alert, Image, Modal, Text, TextInput, TouchableOpacity, View, Platform, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AvatarWithFallback } from "./AvatarWithFallback";
import { AppButton } from "./AppButton";
import { useToggleLike } from "../lib/apiHooks";
import { readApiError } from "../lib/axios";
import type { FeedPost } from "@bizskills/types";

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  UPDATE: { label: "Update", color: "#5B4DFF", bg: "bg-indigo-50" },
  LAUNCH: { label: "Launch", color: "#059669", bg: "bg-green-50" },
  MILESTONE: { label: "Milestone", color: "#D97706", bg: "bg-amber-50" },
  COLLAB_REQUEST: { label: "Looking to Collab", color: "#DC2626", bg: "bg-red-50" },
  PRODUCT_DROP: { label: "Product Drop", color: "#7C3AED", bg: "bg-purple-50" },
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
  onEdit?: (postId: string, content: string) => void;
}

export function PostCard({ post, onCommentPress, onUserPress, onDelete, onEdit }: PostCardProps) {
  const toggleLike = useToggleLike();
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const config = typeConfig[post.type] ?? typeConfig.UPDATE;

  const [localLiked, setLocalLiked] = useState(post.isLikedByMe);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLocalLiked(post.isLikedByMe);
    setLocalLikeCount(post.likeCount);
  }, [post.isLikedByMe, post.likeCount]);

  const handleLike = () => {
    const nextLiked = !localLiked;
    setLocalLiked(nextLiked);
    setLocalLikeCount((prev) => prev + (nextLiked ? 1 : -1));

    // Spring animation for heart click
    scaleAnim.setValue(0.7);
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();

    toggleLike.mutate(post.id);
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await onEdit?.(post.id, editContent.trim());
      setEditModal(false);
      Toast.show({ type: "success", text1: "Post updated" });
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to update", text2: readApiError(error) });
    }
  };

  const promptDelete = () => {
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    setDeleteModal(false);
    onDelete?.(post.id);
  };

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
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons name={localLiked ? "heart" : "heart-outline"} size={20} color={localLiked ? "#EF4444" : "#98A2B3"} />
            </Animated.View>
            <Text className={`ml-1.5 text-sm font-medium ${localLiked ? "text-red-500" : "text-muted"}`}>{localLikeCount}</Text>
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
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)} className="p-1">
            <Ionicons name="ellipsis-horizontal" size={18} color="#98A2B3" />
          </TouchableOpacity>
        )}
      </View>

      {showMenu && post.isOwnPost && (
        <View className="flex-row border-t border-slate-100 bg-surface">
          <TouchableOpacity onPress={() => { setShowMenu(false); setEditModal(true); setEditContent(post.content); }} className="flex-1 items-center py-3">
            <Ionicons name="pencil-outline" size={18} color="#5B4DFF" />
            <Text className="mt-0.5 text-xs font-medium text-brand">Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowMenu(false); promptDelete(); }} className="flex-1 items-center py-3">
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text className="mt-0.5 text-xs font-medium text-red-500">Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMenu(false)} className="flex-1 items-center py-3">
            <Ionicons name="close-outline" size={18} color="#667085" />
            <Text className="mt-0.5 text-xs font-medium text-muted">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={deleteModal} transparent animationType="fade" onRequestClose={() => setDeleteModal(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full rounded-3xl bg-white p-6">
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </View>
            <Text className="mb-2 text-xl font-bold text-ink">Delete Post?</Text>
            <Text className="mb-6 text-sm leading-5 text-muted">Are you sure you want to delete this post? This action cannot be undone.</Text>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => setDeleteModal(false)} className="mr-3 flex-1 items-center justify-center rounded-full bg-slate-100 py-3.5">
                <Text className="font-semibold text-ink">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} className="flex-1 items-center justify-center rounded-full bg-red-500 py-3.5">
                <Text className="font-semibold text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={editModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditModal(false)}>
        <SafeAreaView className="flex-1 bg-surface">
          <View className="flex-1 px-6">
            <View className="mt-4 mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-ink">Edit Post</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color="#101828" />
              </TouchableOpacity>
            </View>
            <TextInput
              multiline
              placeholder="What's happening with your business?"
              placeholderTextColor="#98A2B3"
              maxLength={500}
              className="mb-2 h-40 rounded-3xl border border-slate-200 bg-white px-5 pt-5 text-base leading-6 text-ink"
              value={editContent}
              onChangeText={setEditContent}
            />
            <Text className="mb-5 text-right text-xs text-muted">{editContent.length}/500</Text>
            <AppButton label="Save Changes" onPress={handleEdit} disabled={!editContent.trim()} />
          </View>
        </SafeAreaView>
      </Modal>

      {post.type === "COLLAB_REQUEST" && (
        <View className="px-5 pb-4">
          <TouchableOpacity onPress={() => onUserPress?.(post.userId)} className="h-11 items-center justify-center rounded-2xl bg-brand/10">
            <Text className="text-sm font-semibold text-brand">Request Collab</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
