import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { BizCoinBadge } from "../../src/components/BizCoinBadge";
import { StageBadge } from "../../src/components/StageBadge";
import { SkillChip } from "../../src/components/SkillChip";
import { AppButton } from "../../src/components/AppButton";
import { FormField } from "../../src/components/FormField";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useProfile, useUpdateProfile } from "../../src/lib/apiHooks";
import { readApiError } from "../../src/lib/axios";
import type { SkillCategory, SkillLevel } from "@bizskills/types";

const editSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  bio: z.string().trim().max(240).optional(),
  location: z.string().trim().max(80).optional(),
  businessName: z.string().trim().min(1, "Required"),
  description: z.string().trim().max(500).optional(),
});

type EditValues = z.infer<typeof editSchema>;

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const myId = user?.id;
  const { data: profile, isLoading } = useProfile(myId);
  const updateMutation = useUpdateProfile();
  const [editOpen, setEditOpen] = useState(false);

  const { control, handleSubmit } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    values: {
      name: profile?.name ?? "",
      bio: profile?.bio ?? "",
      location: profile?.location ?? "",
      businessName: profile?.businessProfile?.businessName ?? "",
      description: profile?.businessProfile?.description ?? "",
    },
  });

  const onSubmit = async (values: EditValues) => {
    try {
      await updateMutation.mutateAsync(values as any);
      Toast.show({ type: "success", text1: "Profile updated" });
      setEditOpen(false);
    } catch (error) {
      Toast.show({ type: "error", text1: "Update failed", text2: readApiError(error) });
    }
  };

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
  const neededSkills = p?.skills?.filter((s) => !s.isOffering) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <View className="mt-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => setEditOpen(true)} className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
            <Ionicons name="settings-outline" size={22} color="#101828" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => void logout()} className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <View className="mt-2 items-center">
          <AvatarWithFallback uri={p?.avatar} name={p?.name ?? "B"} size={96} />
          <Text className="mt-4 text-2xl font-bold text-ink">{p?.name}</Text>
          {bp && (
            <Text className="mt-1 text-sm text-muted">{bp.businessName}</Text>
          )}
          <View className="mt-3 flex-row items-center">
            {bp && <StageBadge stage={bp.stage as any} />}
            {bp && (
              <View className="ml-2 rounded-full bg-indigo-50 px-3 py-1.5">
                <Text className="text-xs font-medium text-brand">{bp.industry}</Text>
              </View>
            )}
            {p?.location && (
              <View className="ml-2 flex-row items-center">
                <Ionicons name="location-outline" size={14} color="#667085" />
                <Text className="ml-1 text-xs text-muted">{p.location}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="my-6 flex-row justify-between rounded-3xl bg-white p-5">
          <View className="items-center" style={{ width: "25%" }}>
            <Text className="text-xl font-bold text-ink">{p?.exchangeCount ?? 0}</Text>
            <Text className="mt-1 text-xs text-muted">Exchanges</Text>
          </View>
          <View className="items-center" style={{ width: "25%" }}>
            <Text className="text-xl font-bold text-ink">{(p?.avgRating ?? 0) > 0 ? p?.avgRating : "-"}</Text>
            <Text className="mt-1 text-xs text-muted">Rating</Text>
          </View>
          <View className="items-center" style={{ width: "25%" }}>
            <Text className="text-xl font-bold text-ink">{p?.bizCoins}</Text>
            <Text className="mt-1 text-xs text-muted">BizCoins</Text>
          </View>
          <View className="items-center" style={{ width: "25%" }}>
            <Text className="text-xl font-bold text-ink">{p?.followerCount ?? 0}</Text>
            <Text className="mt-1 text-xs text-muted">Followers</Text>
          </View>
        </View>

        {p?.bio && (
          <View className="mb-6 rounded-3xl bg-white p-5">
            <Text className="text-sm font-semibold uppercase tracking-wider text-brand">About</Text>
            <Text className="mt-3 text-sm leading-6 text-muted">{p.bio}</Text>
          </View>
        )}

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-ink">Skills I Offer</Text>
          <Text className="text-xs text-muted">{offeredSkills.length}</Text>
        </View>
        {offeredSkills.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {offeredSkills.map((skill) => (
              <SkillChip key={skill.id} title={skill.title} category={skill.category as SkillCategory} level={skill.level as SkillLevel} coinValue={skill.coinValue} />
            ))}
          </ScrollView>
        ) : (
          <Text className="mb-6 text-sm text-muted">No skills added yet.</Text>
        )}

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-ink">Skills I Need</Text>
          <Text className="text-xs text-muted">{neededSkills.length}</Text>
        </View>
        {neededSkills.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {neededSkills.map((skill) => (
              <SkillChip key={skill.id} title={skill.title} category={skill.category as SkillCategory} level={skill.level as SkillLevel} coinValue={skill.coinValue} />
            ))}
          </ScrollView>
        ) : (
          <Text className="mb-6 text-sm text-muted">No skills needed yet.</Text>
        )}

        <AppButton label="Edit Profile" onPress={() => setEditOpen(true)} className="mb-4" />

        <TouchableOpacity onPress={() => router.push("/exchanges" as any)} className="mb-3 flex-row items-center rounded-3xl bg-white p-5">
          <Ionicons name="swap-horizontal-outline" size={22} color="#5B4DFF" />
          <View className="ml-4 flex-1">
            <Text className="font-semibold text-ink">My Exchanges</Text>
            <Text className="text-xs text-muted">View incoming, outgoing, and completed swaps</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/wallet" as any)} className="mb-6 flex-row items-center rounded-3xl bg-white p-5">
          <Ionicons name="wallet-outline" size={22} color="#F59E0B" />
          <View className="ml-4 flex-1">
            <Text className="font-semibold text-ink">Wallet</Text>
            <Text className="text-xs text-muted">View balance and transaction history</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-surface">
          <ScrollView contentContainerClassName="px-6 pb-8">
            <View className="mt-4 mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-ink">Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditOpen(false)}>
                <Ionicons name="close" size={24} color="#101828" />
              </TouchableOpacity>
            </View>

            <Text className="mb-1 text-sm font-bold text-ink">Personal</Text>
            <Controller control={control} name="name" render={({ field, fieldState }) => (
              <FormField label="Name" placeholder="Your name" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="bio" render={({ field, fieldState }) => (
              <FormField label="Bio" placeholder="Tell your story" multiline className="h-24 pt-4" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="location" render={({ field, fieldState }) => (
              <FormField label="Location" placeholder="City, Country" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />

            <Text className="mb-1 mt-4 text-sm font-bold text-ink">Business</Text>
            <Controller control={control} name="businessName" render={({ field, fieldState }) => (
              <FormField label="Business name" placeholder="Your venture" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="description" render={({ field, fieldState }) => (
              <FormField label="Description" placeholder="What you do" multiline className="h-24 pt-4" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />

            <AppButton label="Save" loading={updateMutation.isPending} onPress={handleSubmit(onSubmit)} className="mt-6" />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
