import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { AppButton } from "../../src/components/AppButton";
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
      <AppButton label="Create Account" loading={isLoading} onPress={handleSubmit(submit)} className="mt-2" />
      <TouchableOpacity onPress={() => router.push("/(auth)/login")} className="mt-6">
        <Text className="text-center text-sm text-muted">
          Already registered? <Text className="font-semibold text-brand">Sign in</Text>
        </Text>
      </TouchableOpacity>
    </AuthShell>
  );
}

