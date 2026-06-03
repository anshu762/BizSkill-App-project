import React, { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, TextInput, TouchableOpacity, View, Platform, Animated, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { AppCard } from "./ui/AppCard";
import { AppText } from "./ui/AppText";
import { Avatar } from "./ui/Avatar";
import { AppButton } from "./ui/AppButton";
import { useToggleLike } from "../lib/apiHooks";
import { readApiError } from "../lib/axios";
import type { FeedPost } from "@bizskills/types";
import { useThemeColors } from "../hooks/useThemeColors";
import { Colors } from "../constants/theme";

const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
  UPDATE: { label: "Update", color: "#5B4DFF", bg: "rgba(91, 77, 255, 0.1)" },
  LAUNCH: { label: "Launch", color: "#059669", bg: "rgba(5, 150, 105, 0.1)" },
  MILESTONE: { label: "Milestone", color: "#D97706", bg: "rgba(217, 119, 6, 0.1)" },
  COLLAB_REQUEST: { label: "Looking to Collab", color: "#DC2626", bg: "rgba(220, 38, 38, 0.1)" },
  PRODUCT_DROP: { label: "Product Drop", color: "#7C3AED", bg: "rgba(124, 58, 237, 0.1)" },
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
  const theme = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const config = typeConfig[post.type] ?? typeConfig.UPDATE;

  const [localLiked, setLocalLiked] = useState(post.isLikedByMe);
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount);
  const [localCommentCount, setLocalCommentCount] = useState(post.commentCount);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!toggleLike.isPending) {
      setLocalLiked(post.isLikedByMe);
      setLocalLikeCount(post.likeCount);
    }
    setLocalCommentCount(post.commentCount);
  }, [post.isLikedByMe, post.likeCount, post.commentCount, toggleLike.isPending]);

  const handleLike = () => {
    const nextLiked = !localLiked;
    setLocalLiked(nextLiked);
    setLocalLikeCount((prev) => prev + (nextLiked ? 1 : -1));

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
    <AppCard style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => onUserPress?.(post.userId)} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Avatar uri={post.user?.avatar} name={post.user?.name ?? "?"} size={40} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold', color: theme.textPrimary }}>{post.user?.name}</AppText>
              <AppText variant="caption" style={{ color: theme.textTertiary, marginTop: 2 }}>{post.user?.businessProfile?.businessName ?? "Founder"} · {timeAgo(post.createdAt)}</AppText>
            </View>
          </TouchableOpacity>
          <View style={{ borderRadius: 999, backgroundColor: config.bg, paddingHorizontal: 12, paddingVertical: 6 }}>
            <AppText style={{ fontSize: 12, fontFamily: 'Outfit_500Medium', color: config.color }}>{config.label}</AppText>
          </View>
        </View>

        <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.8} style={{ marginTop: 16 }}>
          <AppText style={{ fontSize: 14, lineHeight: 24, color: theme.textPrimary }} numberOfLines={expanded ? undefined : 3}>
            {post.content}
          </AppText>
          {!expanded && post.content.length > 150 && (
            <AppText style={{ marginTop: 4, fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: Colors.brand }}>Read more</AppText>
          )}
        </TouchableOpacity>
      </View>

      {(post.imageUrl || post.image) && (
        <Image source={{ uri: post.imageUrl ?? post.image! }} style={{ width: '100%', aspectRatio: 16 / 9 }} resizeMode="cover" />
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: theme.border, paddingHorizontal: 20, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleLike}
            activeOpacity={1}
            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Ionicons name={localLiked ? "heart" : "heart-outline"} size={22} color={localLiked ? Colors.danger : theme.textSecondary} />
            </Animated.View>
            <AppText style={{ marginLeft: 6, fontSize: 14, fontFamily: 'Outfit_500Medium', color: localLiked ? Colors.danger : theme.textSecondary }}>
              {localLikeCount}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setLocalCommentCount((c) => c + 1); onCommentPress?.(post.id); }} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.textSecondary} />
            <AppText style={{ marginLeft: 6, fontSize: 14, color: theme.textSecondary }}>{localCommentCount}</AppText>
          </TouchableOpacity>
        </View>
        {post.isOwnPost && (
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={{ padding: 4 }}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {showMenu && post.isOwnPost && (
        <View style={{ flexDirection: 'row', borderTopWidth: 0.5, borderTopColor: theme.border, backgroundColor: theme.background }}>
          <TouchableOpacity onPress={() => { setShowMenu(false); setEditModal(true); setEditContent(post.content); }} style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="pencil-outline" size={18} color={Colors.brand} />
            <AppText style={{ marginTop: 4, fontSize: 12, fontFamily: 'Outfit_500Medium', color: Colors.brand }}>Edit</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setShowMenu(false); promptDelete(); }} style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            <AppText style={{ marginTop: 4, fontSize: 12, fontFamily: 'Outfit_500Medium', color: Colors.danger }}>Delete</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowMenu(false)} style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
            <Ionicons name="close-outline" size={18} color={theme.textTertiary} />
            <AppText style={{ marginTop: 4, fontSize: 12, fontFamily: 'Outfit_500Medium', color: theme.textTertiary }}>Cancel</AppText>
          </TouchableOpacity>
        </View>
      )}

      {post.type === "COLLAB_REQUEST" && (
        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <AppButton title="Request Collab" variant="primary" onPress={() => onUserPress?.(post.userId)} />
        </View>
      )}

      {/* Delete Modal */}
      <Modal visible={deleteModal} transparent animationType="fade" onRequestClose={() => setDeleteModal(false)}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 }}>
          <View style={{ width: '100%', borderRadius: 24, backgroundColor: theme.elevated, padding: 24 }}>
            <View style={{ marginBottom: 16, height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: Colors.dangerTint }}>
              <Ionicons name="trash-outline" size={24} color={Colors.danger} />
            </View>
            <AppText variant="h2" style={{ marginBottom: 8 }}>Delete Post?</AppText>
            <AppText variant="body" style={{ color: theme.textSecondary, marginBottom: 24 }}>Are you sure you want to delete this post? This action cannot be undone.</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppButton title="Cancel" variant="secondary" style={{ flex: 1, marginRight: 12 }} onPress={() => setDeleteModal(false)} />
              <AppButton title="Delete" variant="danger" style={{ flex: 1 }} onPress={confirmDelete} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditModal(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={{ flex: 1, paddingHorizontal: 24 }}>
              <View style={{ marginTop: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText variant="h2">Edit Post</AppText>
                <TouchableOpacity onPress={() => setEditModal(false)}>
                  <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              <TextInput
                multiline
                placeholder="What's happening with your business?"
                placeholderTextColor={theme.textTertiary}
                maxLength={500}
                style={{ marginBottom: 8, height: 160, borderRadius: 24, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.elevated, paddingHorizontal: 20, paddingTop: 20, fontSize: 16, color: theme.textPrimary }}
                value={editContent}
                onChangeText={setEditContent}
              />
              <AppText style={{ marginBottom: 20, textAlign: 'right', fontSize: 12, color: theme.textTertiary }}>{editContent.length}/500</AppText>
              <AppButton title="Save Changes" onPress={handleEdit} disabled={!editContent.trim()} />
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </AppCard>
  );
}
