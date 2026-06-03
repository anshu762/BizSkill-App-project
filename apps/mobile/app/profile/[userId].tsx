import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { StageBadge } from "../../src/components/StageBadge";
import { SkillChip } from "../../src/components/SkillChip";
import { AppButton } from "../../src/components/AppButton";
import { useProfile, useFollow, useFollowStats, useCreateExchange } from "../../src/lib/apiHooks";
import { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../src/store/useAuthStore";
import type { SkillCategory, SkillLevel } from "@bizskills/types";

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const myId = useAuthStore((state) => state.user?.id);
  const { data: profile, isLoading } = useProfile(userId);
  const { data: followStats } = useFollowStats(userId);
  const { data: myProfile } = useProfile();
  const followMutation = useFollow();
  const createExchange = useCreateExchange();
  const isMe = myId === userId;

  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedOfferedSkillId, setSelectedOfferedSkillId] = useState<string>("");
  const [selectedRequestedSkillId, setSelectedRequestedSkillId] = useState<string>("");
  const [exchangeMessage, setExchangeMessage] = useState("");

  const [localFollowed, setLocalFollowed] = useState(followStats?.isFollowedByMe);
  const [localFollowerCount, setLocalFollowerCount] = useState(followStats?.followerCount ?? 0);

  useEffect(() => {
    if (followStats) {
      setLocalFollowed(followStats.isFollowedByMe);
      setLocalFollowerCount(followStats.followerCount);
    }
  }, [followStats?.isFollowedByMe, followStats?.followerCount]);

  const handleFollowToggle = () => {
    const nextFollowed = !localFollowed;
    setLocalFollowed(nextFollowed);
    setLocalFollowerCount((prev) => prev + (nextFollowed ? 1 : -1));

    followMutation.mutate({
      targetUserId: userId!,
      action: nextFollowed ? "follow" : "unfollow",
    });
  };

  const handleCreateExchange = async () => {
    if (!selectedOfferedSkillId || !selectedRequestedSkillId || createExchange.isPending) return;
    try {
      await createExchange.mutateAsync({
        toUserId: userId!,
        offeredSkillId: selectedOfferedSkillId,
        requestedSkillId: selectedRequestedSkillId,
        message: exchangeMessage.trim() || undefined,
      });
      Toast.show({ type: "success", text1: "Request Sent", text2: "Exchange request submitted successfully!" });
      setExchangeModalOpen(false);
      setSelectedOfferedSkillId("");
      setSelectedRequestedSkillId("");
      setExchangeMessage("");
    } catch (error: any) {
      Toast.show({ 
        type: "error", 
        text1: "Request Failed", 
        text2: error?.response?.data?.message || error.message || "Could not submit exchange request" 
      });
    }
  };

  const myOfferedSkills = myProfile?.skills?.filter((s) => s.isOffering) ?? [];
  const targetOfferedSkills = profile?.skills?.filter((s) => s.isOffering) ?? [];

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#5B4DFF" size="large" />
      </SafeAreaView>
    );
  }

  const p = profile;
  const bp = p?.businessProfile;
  const offeredSkills = p?.skills?.filter((s) => s.isOffering) ?? [];

  if (!p) {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg text-muted">Profile not found</Text>
          <AppButton label="Go back" variant="outline" onPress={() => router.back()} className="mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-24">
        <TouchableOpacity onPress={() => router.back()} className="mt-3 mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <Ionicons name="arrow-back" size={21} color="#101828" />
        </TouchableOpacity>

        <View className="items-center">
          <AvatarWithFallback uri={p.avatar} name={p.name} size={96} />
          <Text className="mt-4 text-2xl font-bold text-ink">{p.name}</Text>
          {bp && <Text className="mt-1 text-sm text-muted">{bp.businessName}</Text>}
          <View className="mt-3 flex-row items-center">
            {bp && <StageBadge stage={bp.stage as any} />}
            {bp && (
              <View className="ml-2 rounded-full bg-indigo-50 px-3 py-1.5">
                <Text className="text-xs font-medium text-brand">{bp.industry}</Text>
              </View>
            )}
            {p.location && (
              <View className="ml-2 flex-row items-center">
                <Ionicons name="location-outline" size={14} color="#667085" />
                <Text className="ml-1 text-xs text-muted">{p.location}</Text>
              </View>
            )}
          </View>

          {!isMe && (
            <TouchableOpacity
              onPress={handleFollowToggle}
              activeOpacity={0.88}
              className={`mt-4 rounded-full px-8 py-3 ${localFollowed ? "border border-brand/20 bg-white" : "bg-brand"}`}
              style={localFollowed ? undefined : { backgroundColor: "#5B4DFF" }}
            >
              <Text
                className={`text-sm font-semibold ${localFollowed ? "text-brand" : "text-white"}`}
                style={localFollowed ? { color: "#5B4DFF" } : { color: "#FFFFFF" }}
              >
                {localFollowed ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="my-6 flex-row justify-between rounded-3xl bg-white p-5">
          <View className="items-center" style={{ width: "33%" }}>
            <Text className="text-xl font-bold text-ink">{localFollowerCount}</Text>
            <Text className="mt-1 text-xs text-muted">Followers</Text>
          </View>
          <View className="items-center" style={{ width: "33%" }}>
            <Text className="text-xl font-bold text-ink">{followStats?.followingCount ?? 0}</Text>
            <Text className="mt-1 text-xs text-muted">Following</Text>
          </View>
          <View className="items-center" style={{ width: "33%" }}>
            <Text className="text-xl font-bold text-ink">{p.exchangeCount ?? 0}</Text>
            <Text className="mt-1 text-xs text-muted">Exchanges</Text>
          </View>
        </View>

        {p.bio && (
          <View className="mb-6 rounded-3xl bg-white p-5">
            <Text className="text-sm font-semibold uppercase tracking-wider text-brand">About</Text>
            <Text className="mt-3 text-sm leading-6 text-muted">{p.bio}</Text>
          </View>
        )}

        <Text className="mb-4 text-lg font-bold text-ink">Skills Offered</Text>
        {offeredSkills.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {offeredSkills.map((skill) => (
              <SkillChip key={skill.id} title={skill.title} category={skill.category as SkillCategory} level={skill.level as SkillLevel} coinValue={skill.coinValue} />
            ))}
          </ScrollView>
        ) : (
          <Text className="mb-6 text-sm text-muted">No skills listed yet.</Text>
        )}
      </ScrollView>

      {!isMe && (
        <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-4" style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View className="flex-row">
            <AppButton label={`Request Exchange`} className="flex-1 mr-2" onPress={() => setExchangeModalOpen(true)} />
            <TouchableOpacity onPress={() => router.push(`/messages/${userId}` as any)} className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand">
              <Ionicons name="chatbubble-ellipses" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Request Exchange Modal */}
      <Modal visible={exchangeModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setExchangeModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1 bg-surface">
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-8">
              <View className="mt-4 mb-6 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-ink">Request Skill Exchange</Text>
                <TouchableOpacity onPress={() => setExchangeModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#101828" />
                </TouchableOpacity>
              </View>

              {myOfferedSkills.length === 0 ? (
                <View className="mb-6 rounded-2xl bg-amber-50 p-4 border border-amber-100">
                  <Text className="text-sm text-amber-800">You must add at least one offered skill to your profile before you can request an exchange.</Text>
                </View>
              ) : targetOfferedSkills.length === 0 ? (
                <View className="mb-6 rounded-2xl bg-amber-50 p-4 border border-amber-100">
                  <Text className="text-sm text-amber-800">This user is not currently offering any skills to trade.</Text>
                </View>
              ) : (
                <>
                  <Text className="mb-2 text-sm font-semibold text-ink">Choose a skill you will offer *</Text>
                  <View className="mb-5 flex-row flex-wrap">
                    {myOfferedSkills.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        activeOpacity={0.88}
                        onPress={() => setSelectedOfferedSkillId(s.id)}
                        className={`mb-2 mr-2 rounded-2xl px-4 py-3 border ${selectedOfferedSkillId === s.id ? "bg-brand border-brand" : "bg-white border-slate-200"}`}
                        style={selectedOfferedSkillId === s.id ? { backgroundColor: "#5B4DFF", borderColor: "#5B4DFF" } : undefined}
                      >
                        <Text
                          className={`text-sm font-semibold ${selectedOfferedSkillId === s.id ? "text-white" : "text-ink"}`}
                          style={selectedOfferedSkillId === s.id ? { color: "#FFFFFF" } : undefined}
                        >{s.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="mb-2 text-sm font-semibold text-ink">Choose a skill you want to request *</Text>
                  <View className="mb-5 flex-row flex-wrap">
                    {targetOfferedSkills.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        activeOpacity={0.88}
                        onPress={() => setSelectedRequestedSkillId(s.id)}
                        className={`mb-2 mr-2 rounded-2xl px-4 py-3 border ${selectedRequestedSkillId === s.id ? "bg-brand border-brand" : "bg-white border-slate-200"}`}
                        style={selectedRequestedSkillId === s.id ? { backgroundColor: "#5B4DFF", borderColor: "#5B4DFF" } : undefined}
                      >
                        <Text
                          className={`text-sm font-semibold ${selectedRequestedSkillId === s.id ? "text-white" : "text-ink"}`}
                          style={selectedRequestedSkillId === s.id ? { color: "#FFFFFF" } : undefined}
                        >{s.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="mb-2 text-sm font-semibold text-ink">Message (optional)</Text>
                  <TextInput
                    placeholder="Explain why you want to exchange skills..."
                    placeholderTextColor="#98A2B3"
                    multiline
                    className="mb-6 min-h-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink"
                    value={exchangeMessage}
                    onChangeText={setExchangeMessage}
                    maxLength={500}
                  />

                  <AppButton 
                    label="Send Exchange Request" 
                    onPress={handleCreateExchange} 
                    loading={createExchange.isPending} 
                    disabled={!selectedOfferedSkillId || !selectedRequestedSkillId || createExchange.isPending} 
                  />
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
