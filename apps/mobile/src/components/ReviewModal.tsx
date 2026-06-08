import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { showToast, ToastContainer } from "./ui/AppToast";
import { readApiError } from "../lib/axios";
import { useCreateReview } from "../lib/apiHooks";
import { AppButton } from "./AppButton";
import { ResponsiveLayout } from "./ui/ResponsiveLayout";

interface ReviewModalProps {
  visible: boolean;
  onClose: () => void;
  exchangeId: string;
}

export function ReviewModal({ visible, onClose, exchangeId }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const createReview = useCreateReview();

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await createReview.mutateAsync({ exchangeId, rating, comment: comment || undefined });
      onClose();
      setTimeout(() => showToast({ type: "success", text1: "Review submitted!" }), 400);
    } catch (error) {
      showToast({ type: "error", text1: "Failed", text2: readApiError(error) });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <ResponsiveLayout>
        <SafeAreaView className="flex-1 bg-surface">
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: 64 }} className="px-6">
            <View className="mt-4 mb-8 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-ink">Leave a Review</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#101828" />
              </TouchableOpacity>
            </View>

            <View className="mb-8 items-center">
              <Text className="mb-4 text-sm font-semibold text-muted">How was your exchange experience?</Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} className="mx-1">
                    <Ionicons
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color={star <= rating ? "#FFB547" : "#D0D5DD"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {rating > 0 && (
                <Text className="mt-3 text-sm font-medium text-ink">
                  {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Great" : "Excellent!"}
                </Text>
              )}
            </View>

            <Text className="mb-2 text-sm font-semibold text-ink">Comment (optional)</Text>
            <TextInput
              multiline
              placeholder="Share your experience..."
              placeholderTextColor="#98A2B3"
              maxLength={200}
              className="mb-1 h-28 rounded-2xl border border-slate-200 bg-white px-4 pt-4 text-base text-ink"
              value={comment}
              onChangeText={setComment}
            />
            <Text className="mb-6 text-right text-xs text-muted">{comment.length}/200</Text>

            <AppButton
              label="Submit Review"
              onPress={handleSubmit}
              disabled={rating === 0}
              loading={createReview.isPending}
            />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        <ToastContainer />
      </ResponsiveLayout>
    </Modal>
  );
}
