import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast, ToastContainer } from "./ui/AppToast";
import { readApiError } from "../lib/axios";
import { ResponsiveLayout } from "./ui/ResponsiveLayout";
import { useCreatePost } from "../lib/apiHooks";
import { AppButton } from "./AppButton";
import { SelectableChip } from "./SelectableChip";

const postTypes = [
  { value: "UPDATE", label: "Update", icon: "megaphone-outline" },
  { value: "LAUNCH", label: "Launch", icon: "rocket-outline" },
  { value: "MILESTONE", label: "Milestone", icon: "trophy-outline" },
  { value: "PRODUCT_DROP", label: "Product Drop", icon: "cube-outline" },
  { value: "COLLAB_REQUEST", label: "Collab", icon: "people-outline" },
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
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-slate-100">
              <TouchableOpacity onPress={onClose} className="h-10 w-10 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
                <Ionicons name="close" size={20} color="#334155" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-slate-800">Create Post</Text>
              <AppButton 
                title="Post" 
                onPress={handlePost} 
                loading={createPost.isPending} 
                disabled={!content.trim()} 
                size="sm"
                style={{ paddingHorizontal: 24, borderRadius: 999 }}
              />
            </View>

            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
              
              {/* Post Type Selector */}
              <View className="px-4 pt-5 pb-2">
                <Text className="mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">What are you sharing?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16, alignItems: 'center' }}>
                  {postTypes.map((t) => (
                    <SelectableChip
                      key={t.value}
                      label={t.label}
                      icon={t.icon as any}
                      selected={type === t.value}
                      onPress={() => setType(t.value)}
                      chipStyle="pill"
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Text Input */}
              <View className="px-4 pt-4 flex-1">
                <TextInput
                  multiline
                  autoFocus
                  placeholder="What's on your mind? Share your updates, milestones or product drops..."
                  placeholderTextColor="#94A3B8"
                  maxLength={500}
                  style={{
                    fontSize: 18,
                    color: '#1E293B',
                    lineHeight: 28,
                    minHeight: 180,
                    textAlignVertical: 'top',
                  }}
                  value={content}
                  onChangeText={setContent}
                />
              </View>

              {/* Image Preview & Actions Footer */}
              <View className="px-4 pb-6 pt-2">
                {imageUrl ? (
                  <View className="mb-5 relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <Image source={{ uri: imageUrl }} className="h-64 w-full" resizeMode="cover" />
                    <TouchableOpacity 
                      onPress={() => setImageUrl("")} 
                      className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-black/50"
                    >
                      <Ionicons name="close" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ) : null}

                <View className="flex-row items-center justify-between border-t border-slate-100 pt-4">
                  <TouchableOpacity 
                    onPress={handlePickImage} 
                    className="flex-row items-center bg-slate-50 px-4 py-2.5 rounded-full border border-slate-200"
                    disabled={imageUploading}
                  >
                    <Ionicons name={imageUploading ? "hourglass-outline" : "image-outline"} size={20} color="#5B4DFF" />
                    <Text className="ml-2 font-medium text-slate-700">
                      {imageUploading ? "Uploading..." : "Add Photo"}
                    </Text>
                  </TouchableOpacity>
                  
                  <Text className={`text-xs font-semibold ${content.length > 450 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {content.length}/500
                  </Text>
                </View>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      <ToastContainer />
      </ResponsiveLayout>
    </Modal>
  );
}
