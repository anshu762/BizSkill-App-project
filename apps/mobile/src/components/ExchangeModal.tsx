import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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

  const handleSend = async () => {
    if (!selectedSkillId) return;
    try {
      await createExchange.mutateAsync({
        toUserId: targetUserId,
        offeredSkillId: selectedSkillId,
        requestedSkillId: targetSkillId,
        message: message || undefined,
      });
      Toast.show({ type: "success", text1: "Exchange request sent!" });
      onClose();
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed", text2: readApiError(error) });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-surface">
        <ScrollView contentContainerClassName="px-6 pb-8">
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

          <Text className="mb-3 text-sm font-semibold text-ink">I'll offer in return</Text>
          {offeredSkills.length === 0 ? (
            <Text className="mb-4 text-sm text-muted">You haven't added any skills to offer yet.</Text>
          ) : (
            offeredSkills.map((skill) => (
              <TouchableOpacity
                key={skill.id}
                onPress={() => setSelectedSkillId(skill.id)}
                className={`mb-2 rounded-2xl border p-4 ${selectedSkillId === skill.id ? "border-brand bg-brand/5" : "border-slate-200 bg-white"}`}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="font-semibold text-ink">{skill.title}</Text>
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
          />

          <AppButton
            label="Send Request"
            onPress={handleSend}
            disabled={!selectedSkillId}
            loading={createExchange.isPending}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
