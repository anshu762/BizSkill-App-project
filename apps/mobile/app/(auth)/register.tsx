import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";
import Toast from "../../src/lib/toast";
import { z } from "zod";
import { AppButton } from "../../src/components/ui/AppButton";
import { AppText } from "../../src/components/ui/AppText";
import { AuthShell } from "../../src/components/AuthShell";
import { FormField } from "../../src/components/FormField";
import { readApiError } from "../../src/lib/axios";
import { useAuthStore } from "../../src/store/useAuthStore";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { control, handleSubmit } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const submit = async (values: RegisterValues) => {
    try {
      await register(values.name, values.email, values.password);
    } catch (error) {
      Toast.show({ type: "error", text1: "Account creation failed", text2: readApiError(error) });
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Start with 100 BizCoins and turn your skills into momentum.">
      <Controller control={control} name="name" render={({ field, fieldState }) => (
        <FormField label="Full name" placeholder="Ananya Sharma" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="email" render={({ field, fieldState }) => (
        <FormField label="Email address" placeholder="you@campus.edu" keyboardType="email-address" autoCapitalize="none" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="password" render={({ field, fieldState }) => (
        <FormField label="Password" placeholder="Minimum 8 characters" secureTextEntry value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
      )} />
      <Controller control={control} name="confirmPassword" render={({ field, fieldState }) => (
        <FormField label="Confirm password" placeholder="Repeat password" secureTextEntry value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
      )} />
      <View style={{ marginTop: 32 }}>
        <AppButton label="Create Account" loading={isLoading} onPress={handleSubmit(submit)} size="lg" />
        <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={{ marginTop: 32, alignItems: 'center' }}>
          <AppText variant="body" style={{ color: '#64748B' }}>
            Already registered? <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold', color: '#5B4DFF' }}>Sign in</AppText>
          </AppText>
        </TouchableOpacity>
      </View>
    </AuthShell>
  );
}

