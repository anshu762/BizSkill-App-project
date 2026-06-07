import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Modal, ScrollView, TextInput, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AppText } from "../../src/components/ui/AppText";
import { AppCard } from "../../src/components/ui/AppCard";
import { Avatar } from "../../src/components/ui/Avatar";
import { AppButton } from "../../src/components/ui/AppButton";
import { StageBadge } from "../../src/components/StageBadge";
import { SkillChip } from "../../src/components/ui/SkillChip";
import { SkeletonProfile } from "../../src/components/ui/ShimmerLoader";
import { FormField } from "../../src/components/FormField";
import { SelectableChip } from "../../src/components/SelectableChip";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useProfile, useUpdateProfile, useUpdateSkill, useDeleteSkill } from "../../src/lib/apiHooks";
import { readApiError } from "../../src/lib/axios";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { Colors } from "../../src/constants/theme";
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
  const theme = useThemeColors();
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
  const [skillToDelete, setSkillToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
    setSkillToDelete({ id: skillId, title: skillTitle });
  };

  const confirmDeleteSkill = async () => {
    if (!skillToDelete) return;
    try {
      await deleteSkillMutation.mutateAsync(skillToDelete.id);
      Toast.show({ type: "success", text1: "Skill deleted" });
      setSkillToDelete(null);
      if (editSkill?.id === skillToDelete.id) setEditSkill(null);
    } catch (error) {
      Toast.show({ type: "error", text1: "Failed to delete skill", text2: readApiError(error) });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <SkeletonProfile />
      </SafeAreaView>
    );
  }

  const p = profile;
  const bp = p?.businessProfile;
  const offeredSkills = p?.skills?.filter((s: any) => s.isOffering) ?? [];
  const neededSkills = p?.skills?.filter((s: any) => !s.isOffering) ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Avatar uri={p?.avatar} name={p?.name ?? "B"} size={96} />
          <AppText variant="h1" style={{ marginTop: 16 }}>{p?.name}</AppText>
          {bp && (
            <AppText variant="body" style={{ marginTop: 4, color: theme.textSecondary }}>{bp.businessName}</AppText>
          )}
          <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
            {bp && <StageBadge stage={bp.stage as any} />}
            {bp && (
              <View style={{ marginLeft: 8, borderRadius: 999, backgroundColor: Colors.brandTint, paddingHorizontal: 12, paddingVertical: 6 }}>
                <AppText style={{ fontSize: 12, fontFamily: 'Outfit_500Medium', color: Colors.brand }}>{bp.industry}</AppText>
              </View>
            )}
            {p?.location && (
              <View style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="location-outline" size={16} color={theme.textTertiary} />
                <AppText style={{ marginLeft: 4, fontSize: 12, fontFamily: 'Outfit_400Regular', color: theme.textSecondary }}>{p.location}</AppText>
              </View>
            )}
          </View>
        </View>

        <AppCard elevated style={{ marginTop: 32, marginBottom: 24, padding: 0, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
            <View style={{ alignItems: 'center', flex: 1, borderRightWidth: 1, borderRightColor: theme.border }}>
              <AppText variant="h2">{p?.exchangeCount ?? 0}</AppText>
              <AppText variant="caption" style={{ marginTop: 4, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Exchanges</AppText>
            </View>
            <View style={{ alignItems: 'center', flex: 1, borderRightWidth: 1, borderRightColor: theme.border }}>
              <AppText variant="h2">{(p?.avgRating ?? 0) > 0 ? p?.avgRating : "-"}</AppText>
              <AppText variant="caption" style={{ marginTop: 4, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Rating</AppText>
            </View>
            <View style={{ alignItems: 'center', flex: 1, borderRightWidth: 1, borderRightColor: theme.border }}>
              <AppText variant="h2">{p?.bizCoins}</AppText>
              <AppText variant="caption" style={{ marginTop: 4, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>BizCoins</AppText>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <AppText variant="h2">{p?.followerCount ?? 0}</AppText>
              <AppText variant="caption" style={{ marginTop: 4, color: theme.textTertiary, textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>Followers</AppText>
            </View>
          </View>
        </AppCard>

        {p?.bio && (
          <View style={{ marginBottom: 24, paddingHorizontal: 4 }}>
            <AppText variant="caption" style={{ color: Colors.brand, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>About</AppText>
            <AppText style={{ fontSize: 15, lineHeight: 24, color: theme.textSecondary }}>{p.bio}</AppText>
          </View>
        )}

        <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="h3">Skills I Offer</AppText>
        </View>
        {offeredSkills.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            {offeredSkills.map((skill: any) => (
              <TouchableOpacity key={skill.id} onPress={() => handleEditSkill(skill)} onLongPress={() => handleDeleteSkill(skill.id, skill.title)} style={{ marginRight: 8 }}>
                <SkillChip label={skill.title} category={skill.category as SkillCategory} level={skill.level as SkillLevel} showLevel />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <AppText variant="body" style={{ marginBottom: 24, color: theme.textTertiary }}>No skills added yet.</AppText>
        )}

        <View style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="h3">Skills I Need</AppText>
        </View>
        {neededSkills.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
            {neededSkills.map((skill: any) => (
              <TouchableOpacity key={skill.id} onPress={() => handleEditSkill(skill)} onLongPress={() => handleDeleteSkill(skill.id, skill.title)} style={{ marginRight: 8 }}>
                <SkillChip label={skill.title} category={skill.category as SkillCategory} level={skill.level as SkillLevel} showLevel />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <AppText variant="body" style={{ marginBottom: 24, color: theme.textTertiary }}>No skills needed yet.</AppText>
        )}

        <AppButton title="Edit Profile" onPress={() => setEditOpen(true)} style={{ marginBottom: 12 }} />
        <AppButton title="Log Out" variant="secondary" onPress={() => setShowLogoutModal(true)} style={{ marginBottom: 24 }} />

        <TouchableOpacity onPress={() => router.push("/exchanges" as any)} activeOpacity={0.8} style={{ marginBottom: 12 }}>
          <AppCard style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="swap-horizontal-outline" size={24} color={Colors.brand} />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold' }}>My Exchanges</AppText>
              <AppText variant="caption" style={{ color: theme.textTertiary, marginTop: 2 }}>View incoming, outgoing, and completed swaps</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </AppCard>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/wallet" as any)} activeOpacity={0.8} style={{ marginBottom: 24 }}>
          <AppCard style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="wallet-outline" size={24} color="#F59E0B" />
            <View style={{ marginLeft: 16, flex: 1 }}>
              <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold' }}>Wallet</AppText>
              <AppText variant="caption" style={{ color: theme.textTertiary, marginTop: 2 }}>View balance and transaction history</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </AppCard>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
              <View style={{ marginTop: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText variant="h2">Edit Profile</AppText>
                <TouchableOpacity onPress={() => setEditOpen(false)}>
                  <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <AppText variant="h3" style={{ marginBottom: 16 }}>Personal</AppText>
              <Controller control={control} name="name" render={({ field, fieldState }) => (
                <FormField label="Name" placeholder="Your name" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="bio" render={({ field, fieldState }) => (
                <FormField label="Bio" placeholder="Tell your story" multiline value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="location" render={({ field, fieldState }) => (
                <FormField label="Location" placeholder="City, Country" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
              )} />

              <AppText variant="h3" style={{ marginTop: 16, marginBottom: 16 }}>Business</AppText>
              <Controller control={control} name="businessName" render={({ field, fieldState }) => (
                <FormField label="Business name" placeholder="Your venture" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
              )} />
              <Controller control={control} name="description" render={({ field, fieldState }) => (
                <FormField label="Description" placeholder="What you do" multiline value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
              )} />

              <AppButton title="Save Changes" onPress={handleSubmit(onSubmit)} style={{ marginTop: 24 }} />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Skill Modal */}
      <Modal visible={!!editSkill} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditSkill(null)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
              <View style={{ marginTop: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText variant="h2">Edit Skill</AppText>
                <TouchableOpacity onPress={() => setEditSkill(null)}>
                  <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <AppText variant="label" style={{ marginBottom: 8, color: theme.textPrimary }}>Title</AppText>
              <TextInput
                placeholder="e.g. Logo Design"
                placeholderTextColor={theme.textTertiary}
                style={{ marginBottom: 16, height: 56, borderRadius: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.elevated, paddingHorizontal: 16, fontSize: 16, color: theme.textPrimary }}
                value={editSkillTitle}
                onChangeText={setEditSkillTitle}
              />
              
              <AppText variant="label" style={{ marginBottom: 12, color: theme.textPrimary }}>Category</AppText>
              <View style={{ marginBottom: 24, flexDirection: 'row', flexWrap: 'wrap' }}>
                {categories.map((c) => (
                  <SelectableChip
                    key={c.value}
                    label={c.label}
                    selected={editSkillCategory === c.value}
                    onPress={() => setEditSkillCategory(c.value)}
                  />
                ))}
              </View>
              
              <AppText variant="label" style={{ marginBottom: 12, color: theme.textPrimary }}>Level</AppText>
              <View style={{ marginBottom: 24, flexDirection: 'row', flexWrap: 'wrap' }}>
                {levels.map((l) => (
                  <SelectableChip
                    key={l.value}
                    label={l.label}
                    selected={editSkillLevel === l.value}
                    onPress={() => setEditSkillLevel(l.value)}
                    chipStyle="pill"
                  />
                ))}
              </View>
              
              <AppText variant="label" style={{ marginBottom: 12, color: theme.textPrimary }}>BizCoin Value: {Math.round(editSkillCoins / 10) * 10} BC</AppText>
              <View style={{ marginBottom: 32, flexDirection: 'row', flexWrap: 'wrap' }}>
                {[10, 20, 30, 50, 100, 150, 200].map((v) => (
                  <SelectableChip
                    key={v}
                    label={`${v} BC`}
                    selected={Math.round(editSkillCoins / 10) * 10 === v}
                    onPress={() => setEditSkillCoins(v)}
                  />
                ))}
              </View>
              
              <View style={{ flexDirection: 'row' }}>
                <AppButton title="Cancel" variant="secondary" onPress={() => setEditSkill(null)} style={{ marginRight: 12, flex: 1 }} />
                <AppButton title="Save Changes" onPress={handleSaveSkill} style={{ flex: 1 }} />
              </View>
              
              <TouchableOpacity onPress={() => handleDeleteSkill(editSkill?.id, editSkill?.title)} style={{ marginTop: 24, alignItems: 'center' }}>
                <AppText style={{ fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: Colors.danger }}>Delete Skill</AppText>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Delete Modal */}
      <Modal visible={!!skillToDelete} transparent animationType="fade" onRequestClose={() => setSkillToDelete(null)}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 }}>
          <View style={{ width: '100%', borderRadius: 24, backgroundColor: theme.elevated, padding: 24 }}>
            <View style={{ marginBottom: 16, height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: Colors.dangerTint }}>
              <Ionicons name="trash-outline" size={24} color={Colors.danger} />
            </View>
            <AppText variant="h2" style={{ marginBottom: 8 }}>Delete Skill?</AppText>
            <AppText variant="body" style={{ color: theme.textSecondary, marginBottom: 24 }}>Are you sure you want to remove "{skillToDelete?.title}" from your profile?</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppButton title="Cancel" variant="secondary" style={{ flex: 1, marginRight: 12 }} onPress={() => setSkillToDelete(null)} />
              <AppButton title="Delete" variant="danger" style={{ flex: 1 }} onPress={confirmDeleteSkill} loading={deleteSkillMutation.isPending} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 }}>
          <View style={{ width: '100%', borderRadius: 24, backgroundColor: theme.elevated, padding: 24 }}>
            <View style={{ marginBottom: 16, height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: Colors.dangerTint }}>
              <Ionicons name="log-out-outline" size={24} color={Colors.danger} />
            </View>
            <AppText variant="h2" style={{ marginBottom: 8 }}>Log Out</AppText>
            <AppText variant="body" style={{ color: theme.textSecondary, marginBottom: 24 }}>Are you sure you want to log out of your account?</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppButton title="Cancel" variant="secondary" style={{ flex: 1, marginRight: 12 }} onPress={() => setShowLogoutModal(false)} />
              <AppButton title="Log Out" variant="danger" style={{ flex: 1 }} onPress={() => { setShowLogoutModal(false); void logout(); }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
