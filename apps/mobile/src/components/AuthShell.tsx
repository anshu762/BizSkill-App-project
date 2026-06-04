import { type PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "./ui/AppText";
import { BizSkillsLogo } from "./brand/BizSkillsLogo";
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
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <View style={{ marginTop: 40, flexDirection: 'row', alignItems: 'center' }}>
            <BizSkillsLogo size="lg" variant={theme.isDark ? 'white' : 'color'} />
          </View>
          <View style={{ marginTop: 48, marginBottom: 32 }}>
            <AppText variant="h1" style={{ fontSize: 32, lineHeight: 40 }}>{title}</AppText>
            <AppText variant="body" style={{ color: theme.textSecondary, marginTop: 12, fontSize: 16, lineHeight: 24 }}>{subtitle}</AppText>
          </View>
          <View>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
