import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { readApiError } from "../lib/axios";
import { useCreatePost } from "../lib/apiHooks";
import { AppButton } from "./AppButton";

const postTypes = [
  { value: "UPDATE", label: "Update" },
  { value: "LAUNCH", label: "Launch" },
  { value: "MILESTONE", label: "Milestone" },
  { value: "PRODUCT_DROP", label: "Product Drop" },
  { value: "COLLAB_REQUEST", label: "Collab" },
];

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState("UPDATE");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const createPost = useCreatePost();

  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageUploading(true);
        const reader = new FileReader();
        reader.onload = () => {
          setImageUrl(reader.result as string);
          setImageUploading(false);
        };
        reader.onerror = () => {
          Toast.show({ type: "error", text1: "Image upload failed" });
          setImageUploading(false);
        };
        reader.readAsDataURL(file);
      };
      input.click();
      return;
    }
    try {
      const { launchImageLibraryAsync } = await import("expo-image-picker");
      const result = await launchImageLibraryAsync({ quality: 0.8 });
      if (result.canceled || !result.assets?.[0]) return;
      setImageUrl(result.assets[0].uri);
    } catch {
      Toast.show({ type: "error", text1: "Image picker failed" });
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      await createPost.mutateAsync({ content: content.trim(), type, imageUrl: imageUrl || undefined });
      Toast.show({ type: "success", text1: "Posted!" });
      setContent("");
      setType("UPDATE");
      setImageUrl("");
      onClose();
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to post", text2: readApiError(error) });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 bg-surface">
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-8">
            <View className="mt-4 mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-ink">Create Post</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#101828" />
              </TouchableOpacity>
            </View>

            <Text className="mb-3 text-sm font-semibold text-ink">Post Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              {postTypes.map((t) => (
                <TouchableOpacity key={t.value} onPress={() => setType(t.value)} className={`mr-2 rounded-full px-5 py-3 ${type === t.value ? "bg-brand" : "bg-white"}`}>
                  <Text className={`text-sm font-medium ${type === t.value ? "text-white" : "text-muted"}`}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              multiline
              placeholder="What's happening with your business?"
              placeholderTextColor="#98A2B3"
              maxLength={500}
              className="mb-2 h-40 rounded-3xl border border-slate-200 bg-white px-5 pt-5 text-base leading-6 text-ink"
              value={content}
              onChangeText={setContent}
            />
            <Text className="mb-5 text-right text-xs text-muted">{content.length}/500</Text>

            {imageUrl ? (
              <View className="mb-5 relative">
                <Image source={{ uri: imageUrl }} className="h-48 w-full rounded-2xl" resizeMode="cover" />
                <TouchableOpacity onPress={() => setImageUrl("")} className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/50">
                  <Ionicons name="close" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handlePickImage} className="mb-5 flex-row items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 py-5">
                <Ionicons name={imageUploading ? "hourglass-outline" : "image-outline"} size={20} color="#5B4DFF" />
                <Text className="ml-2 font-semibold text-brand">{imageUploading ? "Uploading..." : "Add Image"}</Text>
              </TouchableOpacity>
            )}

            <AppButton label="Post" onPress={handlePost} disabled={!content.trim()} loading={createPost.isPending} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
