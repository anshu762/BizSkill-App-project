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

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { control, handleSubmit } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const submit = async (values: LoginValues) => {
    try {
      await login(values.email, values.password);
    } catch (error) {
      Toast.show({ type: "error", text1: "Sign in failed", text2: readApiError(error) });
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue exchanging skills with fellow entrepreneurs.">
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <FormField
            label="Email address"
            placeholder="you@campus.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <FormField
            label="Password"
            placeholder="Your password"
            secureTextEntry
            value={field.value}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <AppButton label="Sign In" loading={isLoading} onPress={handleSubmit(submit)} className="mt-3" />
      <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-7">
        <Text className="text-center text-sm text-muted">
          New to BizSkills? <Text className="font-semibold text-brand">Create an account</Text>
        </Text>
      </TouchableOpacity>
    </AuthShell>
  );
}

