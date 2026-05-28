import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { StageBadge } from "../../src/components/StageBadge";
import { SkillChip } from "../../src/components/SkillChip";
import { AppButton } from "../../src/components/AppButton";
import { useProfile, useFollow, useFollowStats } from "../../src/lib/apiHooks";
import { useAuthStore } from "../../src/store/useAuthStore";
import type { SkillCategory, SkillLevel } from "@bizskills/types";

export default function PublicProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const myId = useAuthStore((state) => state.user?.id);
  const { data: profile, isLoading } = useProfile(userId);
  const { data: followStats } = useFollowStats(userId);
  const followMutation = useFollow();
  const isMe = myId === userId;

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
              onPress={() => followMutation.mutate({ targetUserId: userId!, action: followStats?.isFollowedByMe ? "unfollow" : "follow" })}
              className={`mt-4 rounded-full px-8 py-3 ${followStats?.isFollowedByMe ? "border border-brand/20 bg-white" : "bg-brand"}`}
            >
              <Text className={`text-sm font-semibold ${followStats?.isFollowedByMe ? "text-brand" : "text-white"}`}>
                {followStats?.isFollowedByMe ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="my-6 flex-row justify-between rounded-3xl bg-white p-5">
          <View className="items-center" style={{ width: "33%" }}>
            <Text className="text-xl font-bold text-ink">{followStats?.followerCount ?? 0}</Text>
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
          <AppButton label={`Request Exchange with ${p.name.split(" ")[0]}`} onPress={() => router.push(`/profile/${userId}` as any)} />
        </View>
      )}
    </SafeAreaView>
  );
}
