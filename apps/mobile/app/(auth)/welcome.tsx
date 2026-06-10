import React from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BizSkillsLogo } from "../../src/components/brand/BizSkillsLogo";
import { AppButton } from "../../src/components/ui/AppButton";
import { AppText } from "../../src/components/ui/AppText";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { Colors } from "../../src/constants/theme";

const benefits = [
  { icon: "swap-horizontal-outline" as const, label: "Skill swaps" },
  { icon: "wallet-outline" as const, label: "BizCoins" },
  { icon: "people-outline" as const, label: "Teams" },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useThemeColors();

  return (
    <SafeAreaView className="flex-1 px-6" style={{ backgroundColor: theme.bg }}>
      <View style={{ marginTop: 24, flexDirection: 'row', alignItems: 'center' }}>
        <BizSkillsLogo size="lg" variant={theme.isDark ? 'white' : 'color'} />
      </View>

      <View style={{ marginTop: 48, padding: 32, borderRadius: 32, backgroundColor: Colors.inkPrimary, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12 }}>
        <View style={{ marginBottom: 32, height: 56, width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <Ionicons name="sparkles" size={28} color="#FFB547" />
        </View>
        <AppText variant="h1" style={{ color: '#FFFFFF', fontSize: 36, lineHeight: 44, fontFamily: 'Outfit_700Bold' }}>
          Trade skills.{"\n"}Build businesses.{"\n"}Grow together.
        </AppText>
        <AppText variant="body" style={{ color: '#94A3B8', marginTop: 20, fontSize: 16, lineHeight: 24 }}>
          Exchange design, marketing and creative talent using BizCoins instead of cash.
        </AppText>
      </View>

      <View style={{ marginTop: 32, flexDirection: 'row', justifyContent: 'space-between' }}>
        {benefits.map((benefit) => (
          <View key={benefit.label} style={{ width: '31%', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 12, borderRadius: 24, backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Ionicons name={benefit.icon} size={28} color={Colors.brand} />
            <AppText variant="label" style={{ color: theme.textSecondary, marginTop: 12, textAlign: 'center', fontSize: 12, fontFamily: 'Outfit_600SemiBold' }}>
              {benefit.label}
            </AppText>
          </View>
        ))}
      </View>

      <View className="mt-auto pb-12 pt-8">
        <AppButton title="Create Account" size="lg" onPress={() => router.push("/(auth)/register")} />
        <AppButton
          title="Sign In"
          variant="secondary"
          size="lg"
          style={{ marginTop: 12 }}
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </SafeAreaView>
  );
}
