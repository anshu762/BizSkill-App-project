import React from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/ui/AppButton";
import { AppText } from "../../src/components/ui/AppText";
import { AppCard } from "../../src/components/ui/AppCard";
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
    <SafeAreaView className="flex-1 px-6" style={{ backgroundColor: theme.background }}>
      <View className="mt-4 flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: Colors.brand }}>
          <AppText variant="h2" style={{ color: '#FFFFFF' }}>B</AppText>
        </View>
        <AppText variant="h1" className="ml-3">BizSkills</AppText>
      </View>

      <AppCard elevated style={{ marginTop: 56, padding: 28, backgroundColor: theme.isDark ? '#231F35' : Colors.ink }}>
        <View className="mb-8 h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Ionicons name="sparkles-outline" size={26} color="#FFB547" />
        </View>
        <AppText variant="h1" style={{ color: '#FFFFFF', fontSize: 36, lineHeight: 46 }}>
          Trade skills.{"\n"}Build businesses.{"\n"}Grow together.
        </AppText>
        <AppText variant="body" style={{ color: '#E2E8F0', marginTop: 20, fontSize: 16 }}>
          Exchange design, marketing and creative talent using BizCoins instead of cash.
        </AppText>
      </AppCard>

      <View className="mt-5 flex-row justify-between">
        {benefits.map((benefit) => (
          <AppCard key={benefit.label} style={{ width: '31%', alignItems: 'center', paddingVertical: 16 }}>
            <Ionicons name={benefit.icon} size={24} color={Colors.brand} />
            <AppText variant="label" style={{ color: theme.textSecondary, marginTop: 12 }}>
              {benefit.label}
            </AppText>
          </AppCard>
        ))}
      </View>

      <View className="mt-auto pb-5 pt-8">
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
