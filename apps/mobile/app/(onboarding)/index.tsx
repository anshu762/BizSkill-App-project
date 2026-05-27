import { SkillCategory, type ApiResponse, type User } from "@bizskills/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { AppButton } from "../../src/components/AppButton";
import { FormField } from "../../src/components/FormField";
import { api, readApiError } from "../../src/lib/axios";
import { useAuthStore } from "../../src/store/useAuthStore";
import { useState } from "react";

const stages = ["IDEA", "BUILDING", "LAUNCHED"] as const;
const categories = [
  SkillCategory.GRAPHIC_DESIGN,
  SkillCategory.MARKETING,
  SkillCategory.SOCIAL_MEDIA,
  SkillCategory.WEBSITE,
  SkillCategory.CONTENT,
  SkillCategory.OTHER,
];

const schema = z.object({
  businessName: z.string().trim().min(2, "Enter a business name"),
  industry: z.nativeEnum(SkillCategory),
  description: z.string().trim().min(10, "Tell us a little more"),
  stage: z.enum(stages),
  location: z.string().trim().min(2, "Enter your location"),
  bio: z.string().trim().min(10, "Add a short bio"),
});

type Values = z.infer<typeof schema>;

const labelize = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const updateUser = useAuthStore((state) => state.updateUser);
  const { control, handleSubmit, trigger, watch, setValue } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      businessName: "",
      industry: SkillCategory.MARKETING,
      description: "",
      stage: "IDEA",
      location: "",
      bio: "",
    },
  });

  const next = async () => {
    if (await trigger(["businessName", "industry", "description"])) setStep(1);
  };

  const submit = async (values: Values) => {
    setSubmitting(true);
    try {
      const response = await api.put<ApiResponse<User>>("/users/onboarding", values);
      if (!response.data.data) throw new Error("Missing user");
      await updateUser(response.data.data);
      Toast.show({ type: "success", text1: "Profile ready", text2: "Welcome to BizSkills." });
    } catch (error) {
      Toast.show({ type: "error", text1: "Could not finish onboarding", text2: readApiError(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-8">
        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-ink">Set up your profile</Text>
          <Text className="text-sm font-semibold text-brand">{step + 1} / 2</Text>
        </View>
        <View className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <View className={`h-full rounded-full bg-brand ${step === 0 ? "w-1/2" : "w-full"}`} />
        </View>

        <Text className="mt-10 text-3xl font-bold tracking-tight text-ink">
          {step === 0 ? "What are you building?" : "Introduce your founder side."}
        </Text>
        <Text className="mb-8 mt-3 text-base leading-6 text-muted">
          {step === 0
            ? "This helps match you with creators who can accelerate your idea."
            : "A strong profile earns trust before the first skill exchange."}
        </Text>

        {step === 0 ? (
          <>
            <Controller control={control} name="businessName" render={({ field, fieldState }) => (
              <FormField label="Venture or project name" placeholder="Campus Cart" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
            )} />
            <Text className="mb-3 text-sm font-medium text-ink">Industry focus</Text>
            <View className="mb-6 flex-row flex-wrap">
              {categories.map((category) => {
                const selected = watch("industry") === category;
                return (
                  <TouchableOpacity
                    key={category}
                    onPress={() => setValue("industry", category)}
                    className={`mb-2 mr-2 rounded-full px-4 py-3 ${selected ? "bg-brand" : "bg-white"}`}
                  >
                    <Text className={`text-sm font-medium ${selected ? "text-white" : "text-muted"}`}>
                      {labelize(category)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Controller control={control} name="description" render={({ field, fieldState }) => (
              <FormField label="What does it do?" placeholder="We connect students to affordable essentials..." multiline className="h-28 pt-4" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
            )} />
            <AppButton label="Continue" onPress={() => void next()} className="mt-4" />
          </>
        ) : (
          <>
            <Text className="mb-3 text-sm font-medium text-ink">Business stage</Text>
            <View className="mb-6 flex-row justify-between">
              {stages.map((stage) => {
                const selected = watch("stage") === stage;
                return (
                  <TouchableOpacity key={stage} onPress={() => setValue("stage", stage)} className={`w-[31%] rounded-2xl py-4 ${selected ? "bg-brand" : "bg-white"}`}>
                    <Text className={`text-center text-xs font-semibold ${selected ? "text-white" : "text-muted"}`}>{labelize(stage)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Controller control={control} name="location" render={({ field, fieldState }) => (
              <FormField label="Location" placeholder="Delhi, India" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
            )} />
            <Controller control={control} name="bio" render={({ field, fieldState }) => (
              <FormField label="Founder bio" placeholder="Growth-focused student founder looking for brand talent..." multiline className="h-28 pt-4" value={field.value} onBlur={field.onBlur} onChangeText={field.onChange} error={fieldState.error?.message} />
            )} />
            <View className="mt-3 flex-row">
              <AppButton label="Back" variant="outline" onPress={() => setStep(0)} className="mr-3 flex-1" />
              <AppButton label="Finish" loading={submitting} onPress={handleSubmit(submit)} className="flex-1" />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

