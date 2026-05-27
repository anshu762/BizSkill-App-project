import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/AppButton";

export default function TeamDetailScreen() {
  const router = useRouter();
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const name = teamId === "creator-circle" ? "Creator Circle" : "Launch Lab";

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mt-3 h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <Ionicons name="arrow-back" size={21} color="#101828" />
        </TouchableOpacity>
        <View className="mt-8 rounded-[30px] bg-ink p-7">
          <Text className="text-xs font-semibold uppercase tracking-widest text-indigo-200">Team</Text>
          <Text className="mt-4 text-3xl font-bold text-white">{name}</Text>
          <Text className="mt-3 leading-6 text-slate-300">A focused group trading talent to ship standout student ventures.</Text>
          <View className="mt-7 flex-row">
            <Text className="mr-5 text-sm font-medium text-white">12 members</Text>
            <Text className="text-sm font-medium text-white">8 active projects</Text>
          </View>
        </View>
        <Text className="mb-4 mt-8 text-lg font-bold text-ink">Open needs</Text>
        {["Content strategist", "Product photographer", "Growth marketer"].map((role) => (
          <View key={role} className="mb-3 flex-row items-center justify-between rounded-2xl bg-white p-5">
            <Text className="font-semibold text-ink">{role}</Text>
            <Ionicons name="arrow-forward-circle-outline" size={23} color="#5B4DFF" />
          </View>
        ))}
        <AppButton label="Request to Join" className="mt-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

