import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/AppButton";

export default function ExchangeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const title = id === "pitch-deck" ? "Pitch Deck Polish" : "Brand Identity Sprint";

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mt-3 h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <Ionicons name="arrow-back" size={21} color="#101828" />
        </TouchableOpacity>
        <View className="mt-8 rounded-[30px] bg-white p-6">
          <View className="flex-row justify-between">
            <Text className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-brand">DESIGN</Text>
            <Text className="text-lg font-bold text-brand">45 BC</Text>
          </View>
          <Text className="mt-7 text-3xl font-bold tracking-tight text-ink">{title}</Text>
          <Text className="mt-4 text-sm leading-6 text-muted">
            Get a refined visual direction, logo explorations and a concise brand guide for your next launch.
          </Text>
          <Link href={{ pathname: "/profile/[userId]", params: { userId: "rhea" } }} asChild>
            <TouchableOpacity className="mt-7 flex-row items-center rounded-2xl bg-surface p-4">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-brand">
                <Text className="text-lg font-bold text-white">R</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-ink">Rhea Malik</Text>
                <Text className="mt-1 text-xs text-muted">Graphic designer - 4.9 rating</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
            </TouchableOpacity>
          </Link>
        </View>
        <Text className="mb-3 mt-8 text-lg font-bold text-ink">Deliverables</Text>
        {["Discovery conversation", "Two visual directions", "Final brand starter kit"].map((line) => (
          <View key={line} className="mb-2 flex-row items-center rounded-2xl bg-white p-4">
            <Ionicons name="checkmark-circle" size={20} color="#11B9AD" />
            <Text className="ml-3 text-sm font-medium text-ink">{line}</Text>
          </View>
        ))}
        <AppButton label="Request Exchange - 45 BC" className="mt-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

