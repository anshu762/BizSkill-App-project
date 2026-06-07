import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast } from "./ui/AppToast";
import { readApiError } from "../lib/axios";
import { ResponsiveLayout } from "./ui/ResponsiveLayout";
import { useCreatePost } from "../lib/apiHooks";
import { AppButton } from "./AppButton";
import { SelectableChip } from "./SelectableChip";

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
          showToast({ type: "error", text1: "Image upload failed" });
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
      showToast({ type: "error", text1: "Image picker failed" });
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    try {
      await createPost.mutateAsync({ content: content.trim(), type, imageUrl: imageUrl || undefined });
      setContent("");
      setType("UPDATE");
      setImageUrl("");
      onClose();
      // Show toast AFTER modal closes so it renders in the root tree
      setTimeout(() => showToast({ type: "success", text1: "Posted successfully!" }), 400);
    } catch (error) {
      showToast({ type: "error", text1: "Failed to post", text2: readApiError(error) });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ResponsiveLayout>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1 bg-surface">
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-8">
            <View style={{ marginTop: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color="#101828" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-ink">New Post</Text>
              <TouchableOpacity 
                onPress={handlePost} 
                disabled={!content.trim() || createPost.isPending}
                style={{
                  backgroundColor: content.trim() ? '#5B4DFF' : '#E2E8F0',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20
                }}
              >
                <Text style={{ color: content.trim() ? '#FFFFFF' : '#94A3B8', fontWeight: 'bold' }}>
                  {createPost.isPending ? "Posting..." : "Post"}
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="mb-3 text-sm font-semibold text-ink">Post Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
              {postTypes.map((t) => (
                <SelectableChip
                  key={t.value}
                  label={t.label}
                  selected={type === t.value}
                  onPress={() => setType(t.value)}
                  chipStyle="pill"
                />
              ))}
            </ScrollView>

            <TextInput
              multiline
              autoFocus
              placeholder="What do you want to share with your network?"
              placeholderTextColor="#94A3B8"
              maxLength={500}
              style={{
                fontSize: 18,
                color: '#101828',
                lineHeight: 28,
                minHeight: 160,
                textAlignVertical: 'top',
                marginBottom: 16,
              }}
              value={content}
              onChangeText={setContent}
            />
            
            <View className="flex-row items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <Text className="text-xs text-slate-400">{content.length}/500</Text>
            </View>

            {imageUrl ? (
              <View className="mb-5 relative">
                <Image source={{ uri: imageUrl }} className="h-64 w-full rounded-2xl" resizeMode="cover" />
                <TouchableOpacity onPress={() => setImageUrl("")} className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-black/60">
                  <Ionicons name="close" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handlePickImage} className="mb-5 flex-row items-center rounded-2xl bg-slate-50 px-4 py-4 border border-slate-200 border-dashed">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                  <Ionicons name={imageUploading ? "hourglass-outline" : "image-outline"} size={20} color="#5B4DFF" />
                </View>
                <View className="ml-3">
                  <Text className="font-semibold text-ink">{imageUploading ? "Uploading image..." : "Add a photo"}</Text>
                  <Text className="text-xs text-slate-500">Showcase your work or milestone</Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
      </ResponsiveLayout>
    </Modal>
  );
}
