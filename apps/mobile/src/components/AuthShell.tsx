import { type PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AuthShellProps extends PropsWithChildren {
  title: string;
  subtitle: string;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-surface">
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow px-6 pb-8">
          <View className="mt-8 flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand">
              <Text className="text-xl font-bold text-white">B</Text>
            </View>
            <Text className="ml-3 text-xl font-bold text-ink">BizSkills</Text>
          </View>
          <View className="mt-14">
            <Text className="text-3xl font-bold tracking-tight text-ink">{title}</Text>
            <Text className="mt-3 text-base leading-6 text-muted">{subtitle}</Text>
          </View>
          <View className="mt-9">{children}</View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

