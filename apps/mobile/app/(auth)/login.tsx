import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";
import { showToast } from "../../src/components/ui/AppToast";
import { z } from "zod";
import { AppButton } from "../../src/components/ui/AppButton";
import { AppText } from "../../src/components/ui/AppText";
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
      showToast({ type: "error", text1: "Sign in failed", text2: readApiError(error) });
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
      <View style={{ marginTop: 32 }}>
        <AppButton label="Sign In" loading={isLoading} onPress={handleSubmit(submit)} size="lg" />
        <TouchableOpacity onPress={() => router.push("/(auth)/register")} style={{ marginTop: 32, alignItems: 'center' }}>
          <AppText variant="body" style={{ color: '#64748B' }}>
            New to BizSkills? <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold', color: '#5B4DFF' }}>Create an account</AppText>
          </AppText>
        </TouchableOpacity>
      </View>
    </AuthShell>
  );
}

