import type { ApiResponse, SkillCategory as SkillCategoryEnum, SkillLevel } from "@bizskills/types";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "../../src/lib/toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppButton } from "../../src/components/ui/AppButton";
import { AppText } from "../../src/components/ui/AppText";
import { FormField } from "../../src/components/FormField";
import { SelectableChip } from "../../src/components/SelectableChip";
import { api, readApiError } from "../../src/lib/axios";
import { useAuthStore } from "../../src/store/useAuthStore";

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

const stages = [
  { value: "IDEA" as const, label: "Idea" },
  { value: "BUILDING" as const, label: "Building" },
  { value: "LAUNCHED" as const, label: "Launched" },
];

const levels = [
  { value: "BEGINNER" as const, label: "Beginner" },
  { value: "INTERMEDIATE" as const, label: "Intermediate" },
  { value: "EXPERT" as const, label: "Expert" },
];

const skillSchema = z.object({
  title: z.string().trim().min(1, "Required"),
  category: z.string().min(1, "Required"),
  description: z.string().trim().max(500).optional(),
  level: z.string().min(1, "Required"),
  coinValue: z.number().min(0).max(200),
});

const onboardingSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  age: z.string().optional(),
  location: z.string().trim().min(1, "Enter your location"),
  bio: z.string().trim().max(160, "Max 160 characters"),
  businessName: z.string().trim().min(1, "Enter business name"),
  industry: z.string().min(1, "Select an industry"),
  stage: z.string().min(1, "Select a stage"),
  description: z.string().trim().min(1, "Describe your business"),
  website: z.string().optional(),
  instagramHandle: z.string().optional(),
});

type Values = z.infer<typeof onboardingSchema>;

const stepLabels = ["Personal", "Business", "Offer", "Need", "Preview"];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [offeredSkills, setOfferedSkills] = useState<Array<{ title: string; category: string; description?: string; level: string; coinValue: number }>>([]);
  const [neededSkills, setNeededSkills] = useState<Array<{ title: string; category: string; description?: string; level: string; coinValue: number }>>([]);
  const [showSkillForm, setShowSkillForm] = useState<"offered" | "needed" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateUser = useAuthStore((state) => state.updateUser);

  const { control, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "", age: "", location: "", bio: "", businessName: "",
      industry: "", stage: "", description: "", website: "", instagramHandle: "",
    },
  });

  const [skillForm, setSkillForm] = useState({ title: "", category: "", description: "", level: "", coinValue: 10 });

  const canAddSkill = skillForm.title && skillForm.category && skillForm.level;

  const addSkillToList = () => {
    if (!canAddSkill) return;
    const skill = { ...skillForm, coinValue: Math.round(skillForm.coinValue / 10) * 10 };
    if (showSkillForm === "offered") {
      setOfferedSkills((p) => [...p, skill]);
    } else {
      setNeededSkills((p) => [...p, skill]);
    }
    setSkillForm({ title: "", category: "", description: "", level: "", coinValue: 10 });
    setShowSkillForm(null);
  };

  const removeSkill = (idx: number, type: "offered" | "needed") => {
    if (type === "offered") setOfferedSkills((p) => p.filter((_, i) => i !== idx));
    else setNeededSkills((p) => p.filter((_, i) => i !== idx));
  };

  const next = async () => {
    const fields = [
      ["name", "age", "location", "bio"] as const,
      ["businessName", "industry", "stage", "description", "website", "instagramHandle"] as const,
    ];
    if (step < 2 && await trigger(fields[step] as any)) setStep(step + 1);
  };

  const submit = async (values: Values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await api.post<ApiResponse<{ id: string; hasOnboarded: boolean }>>("/profile/onboarding", {
        name: values.name,
        age: values.age ? parseInt(values.age) : undefined,
        location: values.location,
        bio: values.bio || undefined,
        businessName: values.businessName,
        industry: values.industry,
        description: values.description,
        stage: values.stage,
        website: values.website || undefined,
        instagramHandle: values.instagramHandle || undefined,
        offeredSkills: offeredSkills.map((s) => ({ ...s, coinValue: Math.round(s.coinValue / 10) * 10 })),
        neededSkills: neededSkills.map((s) => ({ ...s, coinValue: Math.round(s.coinValue / 10) * 10 })),
      });
      await updateUser({ ...useAuthStore.getState().user!, hasOnboarded: true } as any);
      Toast.show({ type: "success", text1: "Profile ready", text2: "Welcome to BizSkills." });
      router.replace("/(tabs)");
    } catch (error) {
      Toast.show({ type: "error", text1: "Could not finish onboarding", text2: readApiError(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={{ marginBottom: 32 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
        {stepLabels.map((label, i) => (
          <View key={label} style={{ flex: 1, alignItems: 'center' }}>
            <AppText style={{ fontSize: 10, fontFamily: i <= step ? 'Outfit_700Bold' : 'Outfit_600SemiBold', color: i <= step ? '#5B4DFF' : '#94A3B8' }}>{label}</AppText>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {stepLabels.map((_, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? '#5B4DFF' : '#E2E8F0', opacity: i === step ? 1 : i < step ? 0.5 : 1 }} />
        ))}
      </View>
    </View>
  );

  const renderSkillCards = (skills: typeof offeredSkills, type: "offered" | "needed") => (
    <View>
      {skills.map((skill, i) => (
        <View key={i} style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 20, backgroundColor: '#FFFFFF', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }}>
          <View style={{ flex: 1 }}>
            <AppText variant="h3">{skill.title}</AppText>
            <AppText style={{ marginTop: 4, fontSize: 12, color: '#64748B', fontFamily: 'Outfit_500Medium' }}>{skill.category} · {skill.level} · {Math.round(skill.coinValue / 10) * 10} BC</AppText>
          </View>
          <TouchableOpacity onPress={() => removeSkill(i, type)} style={{ marginLeft: 16, height: 36, width: 36, borderRadius: 18, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="trash" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => setShowSkillForm(type)}
        style={{ marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', paddingVertical: 20 }}
      >
        <Ionicons name="add" size={24} color="#5B4DFF" />
        <AppText style={{ marginLeft: 8, fontSize: 16, fontFamily: 'Outfit_600SemiBold', color: '#5B4DFF' }}>Add Skill</AppText>
      </TouchableOpacity>
    </View>
  );

  const renderSkillForm = () => {
    if (!showSkillForm) return null;
    const maxSkills = showSkillForm === "offered" ? offeredSkills.length : neededSkills.length;
    if (maxSkills >= 5) {
      return <Text className="mb-4 text-center text-sm text-muted">Maximum 5 skills added.</Text>;
    }
    return (
      <View style={{ marginBottom: 24, borderRadius: 24, backgroundColor: '#FFFFFF', padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 4 }}>
        <AppText variant="h3" style={{ marginBottom: 20 }}>Add Skill</AppText>
        <FormField label="Title" placeholder="e.g. Logo Design" value={skillForm.title} onChangeText={(t) => setSkillForm((p) => ({ ...p, title: t }))} />
        <AppText variant="label" style={{ marginBottom: 12 }}>Category</AppText>
        <View style={{ marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
          {categories.map((c) => (
            <SelectableChip key={c.value} label={c.label} selected={skillForm.category === c.value} onPress={() => setSkillForm((p) => ({ ...p, category: c.value }))} />
          ))}
        </View>
        <AppText variant="label" style={{ marginBottom: 12 }}>Level</AppText>
        <View style={{ marginBottom: 20, flexDirection: 'row', flexWrap: 'wrap' }}>
          {levels.map((l) => (
            <SelectableChip key={l.value} label={l.label} selected={skillForm.level === l.value} onPress={() => setSkillForm((p) => ({ ...p, level: l.value }))} chipStyle="pill" />
          ))}
        </View>
        <AppText variant="label" style={{ marginBottom: 8 }}>BizCoin Value: {Math.round(skillForm.coinValue / 10) * 10} BC</AppText>
        <View style={{ marginBottom: 24, height: 32, justifyContent: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText style={{ marginRight: 8, fontSize: 12, color: '#94A3B8' }}>10</AppText>
            <View style={{ flex: 1, borderRadius: 999, backgroundColor: '#F1F5F9', height: 8 }}>
              <View style={{ height: '100%', borderRadius: 999, backgroundColor: '#5B4DFF', width: `${(skillForm.coinValue / 200) * 100}%` }} />
            </View>
            <AppText style={{ marginLeft: 8, fontSize: 12, color: '#94A3B8' }}>200</AppText>
          </View>
          <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            {[10, 50, 100, 150, 200].map((v) => (
              <TouchableOpacity key={v} onPress={() => setSkillForm((p) => ({ ...p, coinValue: v }))} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: Math.round(skillForm.coinValue / 10) * 10 === v ? 'rgba(91, 77, 255, 0.1)' : 'transparent' }}>
                <AppText style={{ fontSize: 10, fontFamily: 'Outfit_700Bold', color: Math.round(skillForm.coinValue / 10) * 10 === v ? '#5B4DFF' : '#94A3B8' }}>{v}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <AppButton label="Cancel" variant="secondary" onPress={() => setShowSkillForm(null)} style={{ marginRight: 12, flex: 1 }} />
          <AppButton label="Add" onPress={addSkillToList} style={{ flex: 1 }} disabled={!canAddSkill} />
        </View>
      </View>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text className="mb-2 text-2xl font-bold text-ink">About you</Text>
            <Text className="mb-6 text-sm text-muted">Tell the community who you are.</Text>
            <Controller control={control} name="name" render={({ field, fieldState }) => (
              <FormField label="Full name" placeholder="Ananya Sharma" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="age" render={({ field, fieldState }) => (
              <FormField label="Age (optional)" placeholder="21" keyboardType="number-pad" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="location" render={({ field, fieldState }) => (
              <FormField label="Location" placeholder="Delhi, India" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="bio" render={({ field, fieldState }) => (
              <View className="mb-4">
                <View className="flex-row justify-between">
                  <Text className="mb-2 text-sm font-medium text-ink">Bio</Text>
                  <Text className="text-xs text-muted">{(field.value ?? "").length}/160</Text>
                </View>
                <TextInput multiline placeholder="Founder building something cool..." placeholderTextColor="#98A2B3" maxLength={160} className="h-24 rounded-2xl border border-slate-200 bg-white px-4 pt-4 text-base text-ink" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} />
                {fieldState.error && <Text className="mt-1 text-xs text-red-500">{fieldState.error.message}</Text>}
              </View>
            )} />
            <AppButton label="Next" onPress={() => void next()} />
          </>
        );

      case 1:
        return (
          <>
            <Text className="mb-2 text-2xl font-bold text-ink">Your business</Text>
            <Text className="mb-6 text-sm text-muted">Help others understand what you're working on.</Text>
            <Controller control={control} name="businessName" render={({ field, fieldState }) => (
              <FormField label="Business name" placeholder="Campus Cart" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Text className="mb-2 text-sm font-medium text-ink">Industry</Text>
            <View className="mb-4 flex-row flex-wrap">
              {categories.map((c) => (
                <SelectableChip
                  key={c.value}
                  label={c.label}
                  selected={watch("industry") === c.value}
                  onPress={() => setValue("industry", c.value)}
                  chipStyle="pill"
                />
              ))}
            </View>
            {errors.industry && <Text className="-mt-3 mb-3 text-xs text-red-500">{errors.industry.message}</Text>}
            <Text className="mb-2 text-sm font-medium text-ink">Stage</Text>
            <View className="mb-4 flex-row">
              {stages.map((s) => (
                <SelectableChip
                  key={s.value}
                  label={s.label}
                  selected={watch("stage") === s.value}
                  onPress={() => setValue("stage", s.value)}
                  chipStyle="large"
                />
              ))}
            </View>
            <Controller control={control} name="description" render={({ field, fieldState }) => (
              <FormField label="Description" placeholder="What does your business do?" multiline className="h-24 pt-4" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="website" render={({ field, fieldState }) => (
              <FormField label="Website (optional)" placeholder="https://campuscart.com" keyboardType="url" autoCapitalize="none" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="instagramHandle" render={({ field, fieldState }) => {
              const val = field.value ?? "";
              return (
                <FormField label="Instagram (optional)" placeholder="@campuscart" autoCapitalize="none" value={val.startsWith("@") ? val : `@${val}`} onChangeText={(t) => field.onChange(t.startsWith("@") ? t : `@${t}`)} onBlur={field.onBlur} error={fieldState.error?.message} />
              );
            }} />
            <View className="flex-row">
              <AppButton label="Back" variant="secondary" onPress={() => setStep(0)} className="mr-2 flex-1" />
              <AppButton label="Next" onPress={() => void next()} className="flex-1" />
            </View>
          </>
        );

      case 2:
        return (
          <>
            <Text className="mb-2 text-2xl font-bold text-ink">Skills you offer</Text>
            <Text className="mb-6 text-sm text-muted">What can you help others with? (Up to 5)</Text>
            {renderSkillCards(offeredSkills, "offered")}
            {renderSkillForm()}
            <View className="flex-row">
              <AppButton label="Back" variant="secondary" onPress={() => setStep(1)} className="mr-2 flex-1" />
              <AppButton label="Next" onPress={() => setStep(3)} className="flex-1" />
            </View>
          </>
        );

      case 3:
        return (
          <>
            <Text className="mb-2 text-2xl font-bold text-ink">Skills you need</Text>
            <Text className="mb-6 text-sm text-muted">What do you need help with? (Up to 5)</Text>
            {renderSkillCards(neededSkills, "needed")}
            {renderSkillForm()}
            <View className="flex-row">
              <AppButton label="Back" variant="secondary" onPress={() => setStep(2)} className="mr-2 flex-1" />
              <AppButton label="Next" onPress={() => setStep(4)} className="flex-1" />
            </View>
          </>
        );

      case 4:
        return (
          <>
            <AppText variant="h1" style={{ marginBottom: 8 }}>Preview</AppText>
            <AppText variant="body" style={{ color: '#64748B', marginBottom: 32 }}>Here's your profile. Looks good?</AppText>
            <View style={{ borderRadius: 32, backgroundColor: '#FFFFFF', padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 }}>
              <View style={{ alignItems: 'center' }}>
                <View style={{ height: 96, width: 96, alignItems: 'center', justifyContent: 'center', borderRadius: 32, backgroundColor: '#5B4DFF', shadowColor: '#5B4DFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}>
                  <AppText style={{ fontSize: 40, fontFamily: 'Outfit_700Bold', color: '#FFFFFF' }}>{watch("name")[0] ?? "B"}</AppText>
                </View>
                <AppText variant="h2" style={{ marginTop: 24 }}>{watch("name")}</AppText>
                <AppText style={{ marginTop: 4, fontSize: 14, color: '#64748B', fontFamily: 'Outfit_500Medium' }}>{watch("location")}</AppText>
                <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
                  <StageBadgePreview stage={watch("stage")} />
                  <View style={{ marginLeft: 8, borderRadius: 999, backgroundColor: 'rgba(91, 77, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6 }}>
                    <AppText style={{ fontSize: 12, fontFamily: 'Outfit_600SemiBold', color: '#5B4DFF' }}>{categories.find((c) => c.value === watch("industry"))?.label}</AppText>
                  </View>
                </View>
              </View>
              {watch("bio") ? <AppText style={{ marginTop: 24, fontSize: 14, lineHeight: 22, color: '#64748B', textAlign: 'center' }}>{watch("bio")}</AppText> : null}
              
              <View style={{ marginTop: 32, height: 1, backgroundColor: '#F1F5F9' }} />
              
              <AppText variant="h3" style={{ marginTop: 24 }}>{watch("businessName")}</AppText>
              <AppText style={{ marginTop: 4, fontSize: 14, lineHeight: 22, color: '#64748B' }}>{watch("description")}</AppText>
              
              {offeredSkills.length > 0 && (
                <>
                  <AppText variant="label" style={{ marginTop: 24, marginBottom: 12 }}>Offers ({offeredSkills.length})</AppText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {offeredSkills.map((s, i) => (
                      <View key={i} style={{ marginRight: 8, marginBottom: 8, borderRadius: 999, backgroundColor: 'rgba(91, 77, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6 }}>
                        <AppText style={{ fontSize: 12, fontFamily: 'Outfit_600SemiBold', color: '#5B4DFF' }}>{s.title}</AppText>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {neededSkills.length > 0 && (
                <>
                  <AppText variant="label" style={{ marginTop: 24, marginBottom: 12 }}>Needs ({neededSkills.length})</AppText>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {neededSkills.map((s, i) => (
                      <View key={i} style={{ marginRight: 8, marginBottom: 8, borderRadius: 999, backgroundColor: 'rgba(217, 119, 6, 0.1)', paddingHorizontal: 12, paddingVertical: 6 }}>
                        <AppText style={{ fontSize: 12, fontFamily: 'Outfit_600SemiBold', color: '#D97706' }}>{s.title}</AppText>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
            <View style={{ marginTop: 32, flexDirection: 'row' }}>
              <AppButton label="Back" variant="secondary" onPress={() => setStep(3)} style={{ marginRight: 12, flex: 1 }} disabled={isSubmitting} />
              <AppButton label="Looks Good" onPress={handleSubmit(submit)} loading={isSubmitting} style={{ flex: 1 }} />
            </View>
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-surface">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-8">
          {renderStepIndicator()}
          {renderStep()}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function StageBadgePreview({ stage }: { stage: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    IDEA: { label: "Idea", bg: "bg-gray-100", text: "text-gray-700" },
    BUILDING: { label: "Building", bg: "bg-blue-50", text: "text-blue-700" },
    LAUNCHED: { label: "Launched", bg: "bg-green-50", text: "text-green-700" },
  };
  const c = config[stage] ?? config.IDEA;
  return (
    <View className={`rounded-full ${c.bg} px-3 py-1.5`}>
      <Text className={`text-xs font-semibold ${c.text}`}>{c.label}</Text>
    </View>
  );
}
