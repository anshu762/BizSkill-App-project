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
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
          <View style={{ marginTop: 40, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.brand, shadowColor: Colors.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}>
              <AppText variant="h2" style={{ color: '#FFFFFF', fontFamily: 'Outfit_700Bold' }}>B</AppText>
            </View>
            <AppText variant="h1" style={{ marginLeft: 16, fontSize: 24 }}>BizSkills</AppText>
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
