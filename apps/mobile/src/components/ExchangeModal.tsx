import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { readApiError } from "../lib/axios";
import { useProfile } from "../lib/apiHooks";
import { useCreateExchange } from "../lib/apiHooks";
import { useAuthStore } from "../store/useAuthStore";
import { AppButton } from "./AppButton";
import { AvatarWithFallback } from "./AvatarWithFallback";

interface ExchangeModalProps {
  visible: boolean;
  onClose: () => void;
  targetUserId: string;
  targetSkillId: string;
}

export function ExchangeModal({ visible, onClose, targetUserId, targetSkillId }: ExchangeModalProps) {
  const myId = useAuthStore((state) => state.user?.id);
  const { data: myProfile } = useProfile(myId);
  const { data: targetProfile } = useProfile(targetUserId);
  const createExchange = useCreateExchange();
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [message, setMessage] = useState("");

  const offeredSkills = myProfile?.skills?.filter((s) => s.isOffering && s.isActive) ?? [];
  const targetSkill = targetProfile?.skills?.find((s) => s.id === targetSkillId);

  const handleSend = useCallback(async () => {
    if (!selectedSkillId) return;
    try {
      await createExchange.mutateAsync({
        toUserId: targetUserId,
        offeredSkillId: selectedSkillId,
        requestedSkillId: targetSkillId,
        message: message || undefined,
      });
      Toast.show({ type: "success", text1: "Exchange request sent!" });
      setSelectedSkillId("");
      setMessage("");
      onClose();
    } catch (error) {
      Toast.show({ type: "error", text1: "Request failed", text2: readApiError(error) });
    }
  }, [selectedSkillId, message, targetUserId, targetSkillId, createExchange, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 bg-surface">
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-8">
            <View className="mt-4 mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-ink">New Exchange</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#101828" />
              </TouchableOpacity>
            </View>

            {targetSkill && (
              <View className="mb-6 rounded-3xl bg-white p-5">
                <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-brand">They're offering</Text>
                <View className="flex-row items-center">
                  <AvatarWithFallback uri={targetProfile?.avatar} name={targetProfile?.name ?? ""} size={40} />
                  <View className="ml-3">
                    <Text className="font-semibold text-ink">{targetProfile?.name}</Text>
                    <Text className="text-sm text-muted">{targetSkill.title}</Text>
                  </View>
                </View>
                <View className="mt-3 self-start rounded-full bg-amber-50 px-3 py-1">
                  <Text className="text-xs font-bold text-amber-700">{targetSkill.coinValue} BC</Text>
                </View>
              </View>
            )}

            <Text className="mb-3 text-sm font-semibold text-ink">I'll offer in return *</Text>
            {offeredSkills.length === 0 ? (
              <View className="mb-4 items-center rounded-3xl border-2 border-dashed border-slate-300 p-6">
                <Ionicons name="alert-circle-outline" size={32} color="#98A2B3" />
                <Text className="mt-2 text-center text-sm text-muted">Add skills to your profile first to send exchange requests.</Text>
              </View>
            ) : (
              offeredSkills.map((skill) => (
                <TouchableOpacity
                  key={skill.id}
                  onPress={() => setSelectedSkillId(skill.id)}
                  className={`mb-2 rounded-2xl border-2 p-4 ${selectedSkillId === skill.id ? "border-brand bg-brand/10" : "border-slate-200 bg-white"}`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="font-semibold text-ink">{skill.title}</Text>
                        {selectedSkillId === skill.id && (
                          <Ionicons name="checkmark-circle" size={18} color="#5B4DFF" className="ml-2" />
                        )}
                      </View>
                      <Text className="text-xs text-muted">{skill.level}</Text>
                    </View>
                    <View className="rounded-full bg-amber-50 px-3 py-1">
                      <Text className="text-xs font-bold text-amber-700">{skill.coinValue} BC</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}

            <Text className="mb-2 mt-4 text-sm font-semibold text-ink">Message (optional)</Text>
            <TextInput
              multiline
              placeholder="Tell them why you'd like to exchange skills..."
              placeholderTextColor="#98A2B3"
              className="mb-6 h-24 rounded-2xl border border-slate-200 bg-white px-4 pt-4 text-base text-ink"
              value={message}
              onChangeText={setMessage}
              maxLength={500}
            />

            <AppButton
              label={createExchange.isPending ? "Sending Request..." : "Send Request"}
              onPress={handleSend}
              disabled={!selectedSkillId || createExchange.isPending}
              loading={createExchange.isPending}
            />

            {createExchange.isError && (
              <View className="mt-4 items-center rounded-2xl bg-red-50 p-4">
                <Text className="text-sm font-medium text-red-600">{readApiError(createExchange.error)}</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
