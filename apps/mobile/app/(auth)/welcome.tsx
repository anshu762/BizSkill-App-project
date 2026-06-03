import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/AppButton";

const benefits = [
  { icon: "swap-horizontal-outline" as const, label: "Skill swaps" },
  { icon: "wallet-outline" as const, label: "BizCoins" },
  { icon: "people-outline" as const, label: "Teams" },
];

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface px-6">
      <View className="mt-4 flex-row items-center">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand">
          <Text className="text-2xl font-bold text-white">B</Text>
        </View>
        <Text className="ml-3 text-xl font-bold text-ink">BizSkills</Text>
      </View>

      <View className="mt-14 rounded-[32px] bg-ink p-7">
        <View className="mb-8 h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
          <Ionicons name="sparkles-outline" size={26} color="#FFB547" />
        </View>
        <Text className="text-4xl font-bold leading-[46px] tracking-tight text-white">
          Trade skills.{"\n"}Build businesses.{"\n"}Grow together.
        </Text>
        <Text className="mt-5 text-base leading-6 text-slate-300">
          Exchange design, marketing and creative talent using BizCoins instead of cash.
        </Text>
      </View>

      <View className="mt-5 flex-row justify-between">
        {benefits.map((benefit) => (
          <View key={benefit.label} className="w-[31%] items-center rounded-2xl bg-white py-4">
            <Ionicons name={benefit.icon} size={21} color="#5B4DFF" />
            <Text className="mt-2 text-xs font-medium text-muted">{benefit.label}</Text>
          </View>
        ))}
      </View>

      <View className="mt-auto pb-5 pt-8">
        <AppButton label="Create Account" onPress={() => router.push("/(auth)/register")} />
        <AppButton
          label="Sign In"
          variant="secondary"
          className="mt-3"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </SafeAreaView>
  );
}

