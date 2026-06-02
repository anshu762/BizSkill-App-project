import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
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
import { useProfile, useUpdateProfile, useUpdateSkill, useDeleteSkill } from "../../src/lib/apiHooks";
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

const categories = [
  { value: "GRAPHIC_DESIGN", label: "Graphic Design" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "WEBSITE", label: "Website" },
  { value: "MARKETING", label: "Marketing" },
  { value: "BRANDING", label: "Branding" },
  { value: "FINANCE", label: "Finance" },
  { value: "PITCH_DECK", label: "Pitch Deck" },
  { value: "CONTENT", label: "Content" },
  { value: "OTHER", label: "Other" },
] as const;

const levels = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "EXPERT", label: "Expert" },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const myId = user?.id;
  const { data: profile, isLoading } = useProfile(myId);
  const updateMutation = useUpdateProfile();
  const updateSkillMutation = useUpdateSkill();
  const deleteSkillMutation = useDeleteSkill();
  const [editOpen, setEditOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<any>(null);
  const [editSkillTitle, setEditSkillTitle] = useState("");
  const [editSkillCategory, setEditSkillCategory] = useState("");
  const [editSkillLevel, setEditSkillLevel] = useState("");
  const [editSkillCoins, setEditSkillCoins] = useState(10);

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

  const handleEditSkill = (skill: any) => {
    setEditSkill(skill);
    setEditSkillTitle(skill.title);
    setEditSkillCategory(skill.category);
    setEditSkillLevel(skill.level);
    setEditSkillCoins(skill.coinValue);
  };

  const handleSaveSkill = async () => {
    if (!editSkillTitle.trim()) { Alert.alert("Error", "Title is required"); return; }
    if (!editSkillCategory) { Alert.alert("Error", "Category is required"); return; }
    if (!editSkillLevel) { Alert.alert("Error", "Level is required"); return; }
    try {
      await updateSkillMutation.mutateAsync({
        skillId: editSkill.id,
        title: editSkillTitle.trim(),
        category: editSkillCategory,
        level: editSkillLevel,
        coinValue: Math.round(editSkillCoins / 10) * 10,
      });
      Toast.show({ type: "success", text1: "Skill updated" });
      setEditSkill(null);
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to update skill", text2: readApiError(error) });
    }
  };

  const handleDeleteSkill = (skillId: string, skillTitle: string) => {
    Alert.alert("Delete Skill", `Remove "${skillTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          await deleteSkillMutation.mutateAsync(skillId);
          Toast.show({ type: "success", text1: "Skill deleted" });
        } catch (error) {
          Toast.show({ type: "error", text1: "Failed to delete skill", text2: readApiError(error) });
        }
      }},
    ]);
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {offeredSkills.map((skill) => (
              <TouchableOpacity key={skill.id} onPress={() => handleEditSkill(skill)} onLongPress={() => handleDeleteSkill(skill.id, skill.title)}>
                <SkillChip title={skill.title} category={skill.category as SkillCategory} level={skill.level as SkillLevel} coinValue={skill.coinValue} />
              </TouchableOpacity>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            {neededSkills.map((skill) => (
              <TouchableOpacity key={skill.id} onPress={() => handleEditSkill(skill)} onLongPress={() => handleDeleteSkill(skill.id, skill.title)}>
                <SkillChip title={skill.title} category={skill.category as SkillCategory} level={skill.level as SkillLevel} coinValue={skill.coinValue} />
              </TouchableOpacity>
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

      <Modal visible={!!editSkill} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditSkill(null)}>
        <SafeAreaView className="flex-1 bg-surface">
          <ScrollView contentContainerClassName="px-6 pb-8">
            <View className="mt-4 mb-6 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-ink">Edit Skill</Text>
              <TouchableOpacity onPress={() => setEditSkill(null)}>
                <Ionicons name="close" size={24} color="#101828" />
              </TouchableOpacity>
            </View>
            <Text className="mb-2 text-sm font-medium text-ink">Title</Text>
            <TextInput
              placeholder="e.g. Logo Design"
              placeholderTextColor="#98A2B3"
              className="mb-4 h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-ink"
              value={editSkillTitle}
              onChangeText={setEditSkillTitle}
            />
            <Text className="mb-2 text-sm font-medium text-ink">Category</Text>
            <View className="mb-4 flex-row flex-wrap">
              {categories.map((c) => (
                <TouchableOpacity key={c.value} onPress={() => setEditSkillCategory(c.value)} className={`mb-2 mr-2 rounded-full px-4 py-2 border ${editSkillCategory === c.value ? "bg-brand border-brand" : "bg-white border-slate-200"}`}>
                  <Text className={`text-xs font-medium ${editSkillCategory === c.value ? "text-white" : "text-ink"}`}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="mb-2 text-sm font-medium text-ink">Level</Text>
            <View className="mb-4 flex-row">
              {levels.map((l) => (
                <TouchableOpacity key={l.value} onPress={() => setEditSkillLevel(l.value)} className={`mr-2 rounded-full px-5 py-2 border ${editSkillLevel === l.value ? "bg-brand border-brand" : "bg-white border-slate-200"}`}>
                  <Text className={`text-xs font-medium ${editSkillLevel === l.value ? "text-white" : "text-ink"}`}>{l.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text className="mb-1 text-sm font-medium text-ink">BizCoin Value: {Math.round(editSkillCoins / 10) * 10} BC</Text>
            <View className="mb-4 flex-row flex-wrap">
              {[10, 20, 30, 50, 100, 150, 200].map((v) => (
                <TouchableOpacity key={v} onPress={() => setEditSkillCoins(v)} className={`mb-2 mr-2 rounded px-3 py-1.5 border ${Math.round(editSkillCoins / 10) * 10 === v ? "bg-brand/10 border-brand" : "bg-white border-slate-200"}`}>
                  <Text className={`text-xs font-medium ${Math.round(editSkillCoins / 10) * 10 === v ? "text-brand" : "text-muted"}`}>{v} BC</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row">
              <AppButton label="Cancel" variant="outline" onPress={() => setEditSkill(null)} className="mr-2 flex-1" />
              <AppButton label="Save" onPress={handleSaveSkill} loading={updateSkillMutation.isPending} className="flex-1" />
            </View>
            <TouchableOpacity onPress={() => handleDeleteSkill(editSkill?.id, editSkill?.title)} className="mt-6 items-center">
              <Text className="text-sm font-medium text-red-500">Delete Skill</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
