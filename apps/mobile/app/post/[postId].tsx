import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { PostCard } from "../../src/components/PostCard";
import { useComments, useAddComment, useFeed } from "../../src/lib/apiHooks";
import { readApiError } from "../../src/lib/axios";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function PostScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [newComment, setNewComment] = useState("");
  const { data: feedData } = useFeed();
  const post = feedData?.pages.flatMap((p) => p.data).find((p) => p.id === postId);
  const { data: commentsData, isLoading } = useComments(postId!);
  const addComment = useAddComment();
  const comments = commentsData?.data ?? [];

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment.mutateAsync({ postId: postId!, content: newComment.trim() });
      setNewComment("");
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed", text2: readApiError(error) });
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
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1">
        <View className="px-6 pt-4 pb-2">
          <TouchableOpacity onPress={() => router.back()} className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-white">
            <Ionicons name="arrow-back" size={21} color="#101828" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          className="flex-1"
          contentContainerClassName="px-6 pb-4"
          ListHeaderComponent={post ? <PostCard post={post} /> : null}
          ListEmptyComponent={<Text className="mt-6 text-center text-sm text-muted">No comments yet.</Text>}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View className="mb-4 flex-row rounded-3xl bg-white p-4">
              <AvatarWithFallback uri={item.author?.avatar} name={item.author?.name ?? "?"} size={32} />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm font-semibold text-ink">{item.author?.name}</Text>
                  <Text className="ml-2 text-xs text-muted">{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text className="mt-1 text-sm leading-5 text-muted">{item.content}</Text>
              </View>
            </View>
          )}
        />

        <View
          className="flex-row items-center border-t border-slate-200 bg-white px-4 py-3"
          style={{ paddingBottom: keyboardHeight > 0 ? keyboardHeight - insets.bottom + 12 : undefined }}
        >
          <AvatarWithFallback uri={user?.avatar} name={user?.name ?? "B"} size={32} />
          <TextInput
            placeholder="Write a comment..."
            placeholderTextColor="#98A2B3"
            className="ml-3 flex-1 text-base text-ink bg-white"
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity onPress={handleAddComment} disabled={!newComment.trim()}>
            <Ionicons name="send" size={22} color={newComment.trim() ? "#5B4DFF" : "#D0D5DD"} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
