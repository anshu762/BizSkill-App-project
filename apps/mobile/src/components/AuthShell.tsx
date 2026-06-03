import { type PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "./ui/AppText";
import { Colors } from "../constants/theme";
import { useThemeColors } from "../hooks/useThemeColors";

interface AuthShellProps extends PropsWithChildren {
  title: string;
  subtitle: string;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const theme = useThemeColors();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow px-6 pb-8">
          <View className="mt-8 flex-row items-center">
            <View className="h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: Colors.brand }}>
              <AppText variant="h2" style={{ color: '#FFFFFF' }}>B</AppText>
            </View>
            <AppText variant="h2" className="ml-3">BizSkills</AppText>
          </View>
          <View className="mt-14">
            <AppText variant="h1">{title}</AppText>
            <AppText variant="body" style={{ color: theme.textSecondary, marginTop: 12 }}>{subtitle}</AppText>
          </View>
          <View className="mt-9">{children}</View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
