import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../src/components/PageHeader";
import { useAuthStore } from "../../src/store/useAuthStore";

const requests = [
  { id: "brand-launch", name: "Rhea Malik", skill: "Brand Identity", coins: 45, category: "Design" },
  { id: "social-kit", name: "Karan Jain", skill: "Launch Reels Pack", coins: 30, category: "Social Media" },
];

export default function FeedScreen() {
  const user = useAuthStore((state) => state.user);
  const firstName = user?.name.split(" ")[0] ?? "Founder";

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <PageHeader eyebrow="Good day" title={`Hello, ${firstName}`} />
        <View className="rounded-[28px] bg-brand p-6">
          <Text className="text-sm font-medium text-indigo-100">AVAILABLE BALANCE</Text>
          <View className="mt-3 flex-row items-center">
            <Ionicons name="sparkles" size={24} color="#FFCF71" />
            <Text className="ml-2 text-4xl font-bold text-white">{user?.bizCoins ?? 100}</Text>
            <Text className="ml-2 mt-2 text-base text-indigo-100">BizCoins</Text>
          </View>
          <Text className="mt-5 text-sm leading-5 text-indigo-100">
            Complete exchanges to grow your venture without spending cash.
          </Text>
        </View>

        <View className="mb-4 mt-8 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-ink">Recommended swaps</Text>
          <Link href="/(tabs)/marketplace" className="text-sm font-semibold text-brand">See all</Link>
        </View>
        {requests.map((item) => (
          <Link key={item.id} href={{ pathname: "/exchange/[id]", params: { id: item.id } }} asChild>
            <TouchableOpacity activeOpacity={0.86} className="mb-3 rounded-3xl bg-white p-5">
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <Text className="text-xs font-semibold uppercase tracking-wider text-brand">{item.category}</Text>
                  <Text className="mt-2 text-lg font-semibold text-ink">{item.skill}</Text>
                  <Text className="mt-1 text-sm text-muted">Offered by {item.name}</Text>
                </View>
                <View className="rounded-full bg-indigo-50 px-3 py-2">
                  <Text className="text-sm font-bold text-brand">{item.coins} BC</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
