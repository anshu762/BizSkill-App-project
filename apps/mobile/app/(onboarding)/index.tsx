import type { ApiResponse, SkillCategory as SkillCategoryEnum, SkillLevel } from "@bizskills/types";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppButton } from "../../src/components/AppButton";
import { FormField } from "../../src/components/FormField";
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
  const [submitting, setSubmitting] = useState(false);
  const [offeredSkills, setOfferedSkills] = useState<Array<{ title: string; category: string; description?: string; level: string; coinValue: number }>>([]);
  const [neededSkills, setNeededSkills] = useState<Array<{ title: string; category: string; description?: string; level: string; coinValue: number }>>([]);
  const [showSkillForm, setShowSkillForm] = useState<"offered" | "needed" | null>(null);
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
    setSubmitting(true);
    try {
      const response = await api.post<ApiResponse<{ id: string; hasOnboarded: boolean }>>("/profile/onboarding", {
        name: values.name,
        age: values.age ? parseInt(values.age) : undefined,
        location: values.location,
        bio: values.bio,
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
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View className="mb-6">
      <View className="flex-row items-center justify-between">
        {stepLabels.map((label, i) => (
          <View key={label} className="items-center" style={{ width: "20%" }}>
            <View className={`h-8 w-8 items-center justify-center rounded-full ${i <= step ? "bg-brand" : "bg-slate-200"}`}>
              <Text className={`text-xs font-bold ${i <= step ? "text-white" : "text-slate-500"}`}>{i + 1}</Text>
            </View>
            <Text className={`mt-1 text-[10px] ${i <= step ? "font-semibold text-brand" : "text-muted"}`}>{label}</Text>
          </View>
        ))}
      </View>
      <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <View className={`h-full rounded-full bg-brand`} style={{ width: `${((step + 1) / 5) * 100}%` }} />
      </View>
    </View>
  );

  const renderSkillCards = (skills: typeof offeredSkills, type: "offered" | "needed") => (
    <View>
      {skills.map((skill, i) => (
        <View key={i} className="mb-2 flex-row items-center justify-between rounded-2xl bg-white p-4">
          <View className="flex-1">
            <Text className="font-semibold text-ink">{skill.title}</Text>
            <Text className="text-xs text-muted">{skill.category} · {skill.level} · {Math.round(skill.coinValue / 10) * 10} BC</Text>
          </View>
          <TouchableOpacity onPress={() => removeSkill(i, type)} className="ml-2 rounded-full bg-red-50 p-2">
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => setShowSkillForm(type)}
        className="mb-4 flex-row items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 py-4"
      >
        <Ionicons name="add-circle-outline" size={20} color="#5B4DFF" />
        <Text className="ml-2 font-semibold text-brand">Add Skill</Text>
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
      <View className="mb-4 rounded-2xl border border-brand/20 bg-white p-4">
        <Text className="mb-3 text-base font-bold text-ink">Add Skill</Text>
        <FormField label="Title" placeholder="e.g. Logo Design" value={skillForm.title} onChangeText={(t) => setSkillForm((p) => ({ ...p, title: t }))} />
        <Text className="mb-2 text-sm font-medium text-ink">Category</Text>
        <View className="mb-4 flex-row flex-wrap">
          {categories.map((c) => (
            <TouchableOpacity key={c.value} onPress={() => setSkillForm((p) => ({ ...p, category: c.value }))} className={`mb-2 mr-2 rounded-full px-4 py-2 ${skillForm.category === c.value ? "bg-brand" : "bg-surface"}`}>
              <Text className={`text-xs font-medium ${skillForm.category === c.value ? "text-white" : "text-muted"}`}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="mb-2 text-sm font-medium text-ink">Level</Text>
        <View className="mb-4 flex-row">
          {levels.map((l) => (
            <TouchableOpacity key={l.value} onPress={() => setSkillForm((p) => ({ ...p, level: l.value }))} className={`mr-2 rounded-full px-5 py-2 ${skillForm.level === l.value ? "bg-brand" : "bg-surface"}`}>
              <Text className={`text-xs font-medium ${skillForm.level === l.value ? "text-white" : "text-muted"}`}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="mb-1 text-sm font-medium text-ink">BizCoin Value: {Math.round(skillForm.coinValue / 10) * 10} BC</Text>
        <View className="mb-4 h-8 justify-center">
          <View className="flex-row items-center">
            <Text className="mr-2 text-xs text-muted">10</Text>
            <View className="flex-1 rounded-full bg-surface">
              <View className="mx-1 my-1.5 h-1 rounded-full bg-brand" style={{ width: `${(skillForm.coinValue / 200) * 100}%` }} />
            </View>
            <Text className="ml-2 text-xs text-muted">200</Text>
          </View>
          <View className="mt-1 flex-row justify-between px-1">
            {[10, 50, 100, 150, 200].map((v) => (
              <TouchableOpacity key={v} onPress={() => setSkillForm((p) => ({ ...p, coinValue: v }))} className={`rounded px-2 py-0.5 ${Math.round(skillForm.coinValue / 10) * 10 === v ? "bg-brand/10" : ""}`}>
                <Text className={`text-[10px] ${Math.round(skillForm.coinValue / 10) * 10 === v ? "font-bold text-brand" : "text-muted"}`}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="flex-row">
          <AppButton label="Cancel" variant="outline" onPress={() => setShowSkillForm(null)} className="mr-2 flex-1" />
          <AppButton label="Add" onPress={addSkillToList} className="flex-1" disabled={!canAddSkill} />
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
                <TouchableOpacity key={c.value} onPress={() => setValue("industry", c.value)} className={`mb-2 mr-2 rounded-full px-4 py-3 ${watch("industry") === c.value ? "bg-brand" : "bg-white"}`}>
                  <Text className={`text-sm font-medium ${watch("industry") === c.value ? "text-white" : "text-muted"}`}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.industry && <Text className="-mt-3 mb-3 text-xs text-red-500">{errors.industry.message}</Text>}
            <Text className="mb-2 text-sm font-medium text-ink">Stage</Text>
            <View className="mb-4 flex-row">
              {stages.map((s) => (
                <TouchableOpacity key={s.value} onPress={() => setValue("stage", s.value)} className={`mr-2 flex-1 items-center rounded-2xl py-4 ${watch("stage") === s.value ? "bg-brand" : "bg-white"}`}>
                  <Text className={`text-sm font-semibold ${watch("stage") === s.value ? "text-white" : "text-ink"}`}>{s.label}</Text>
                </TouchableOpacity>
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
              <AppButton label="Back" variant="outline" onPress={() => setStep(0)} className="mr-2 flex-1" />
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
              <AppButton label="Back" variant="outline" onPress={() => setStep(1)} className="mr-2 flex-1" />
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
              <AppButton label="Back" variant="outline" onPress={() => setStep(2)} className="mr-2 flex-1" />
              <AppButton label="Next" onPress={() => setStep(4)} className="flex-1" />
            </View>
          </>
        );

      case 4:
        return (
          <>
            <Text className="mb-2 text-2xl font-bold text-ink">Preview</Text>
            <Text className="mb-6 text-sm text-muted">Here's your profile. Looks good?</Text>
            <View className="rounded-3xl bg-white p-6">
              <View className="items-center">
                <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-brand">
                  <Text className="text-3xl font-bold text-white">{watch("name")[0] ?? "B"}</Text>
                </View>
                <Text className="mt-4 text-xl font-bold text-ink">{watch("name")}</Text>
                <Text className="text-sm text-muted">{watch("location")}</Text>
                <View className="mt-3 flex-row items-center">
                  <StageBadgePreview stage={watch("stage")} />
                  <View className="ml-2 rounded-full bg-indigo-50 px-3 py-1.5">
                    <Text className="text-xs font-medium text-brand">{categories.find((c) => c.value === watch("industry"))?.label}</Text>
                  </View>
                </View>
              </View>
              {watch("bio") ? <Text className="mt-4 text-sm leading-6 text-muted">{watch("bio")}</Text> : null}
              <Text className="mt-5 text-sm font-bold text-ink">{watch("businessName")}</Text>
              <Text className="mt-1 text-sm text-muted">{watch("description")}</Text>
              {offeredSkills.length > 0 && (
                <>
                  <Text className="mt-5 mb-2 text-sm font-bold text-ink">Offers ({offeredSkills.length})</Text>
                  <View className="flex-row flex-wrap">
                    {offeredSkills.map((s, i) => (
                      <View key={i} className="mr-2 mb-2 rounded-full bg-indigo-50 px-3 py-1.5">
                        <Text className="text-xs font-medium text-brand">{s.title}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
              {neededSkills.length > 0 && (
                <>
                  <Text className="mt-3 mb-2 text-sm font-bold text-ink">Needs ({neededSkills.length})</Text>
                  <View className="flex-row flex-wrap">
                    {neededSkills.map((s, i) => (
                      <View key={i} className="mr-2 mb-2 rounded-full bg-amber-50 px-3 py-1.5">
                        <Text className="text-xs font-medium text-amber-700">{s.title}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
            <View className="mt-3 flex-row">
              <AppButton label="Back" variant="outline" onPress={() => setStep(3)} className="mr-2 flex-1" />
              <AppButton label="Looks good! Launch Profile" loading={submitting} onPress={handleSubmit(submit)} className="flex-1" />
            </View>
          </>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-8">
          {renderStepIndicator()}
          {renderStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
