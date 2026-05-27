import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../src/components/PageHeader";

const skills = [
  { id: "product-photo", title: "Product Photography", owner: "Meera Shah", rating: "4.9", coins: 35, tag: "Photography" },
  { id: "pitch-deck", title: "Pitch Deck Polish", owner: "Dev Arora", rating: "4.8", coins: 55, tag: "Pitch Deck" },
  { id: "landing-page", title: "Landing Page UI", owner: "Sara Khan", rating: "5.0", coins: 60, tag: "Website" },
];

export default function MarketplaceScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <PageHeader eyebrow="Marketplace" title="Find skills" />
        <View className="mb-6 h-14 flex-row items-center rounded-2xl bg-white px-4">
          <Ionicons name="search-outline" size={20} color="#98A2B3" />
          <TextInput placeholder="Search skills or creators" placeholderTextColor="#98A2B3" className="ml-3 flex-1 text-base text-ink" />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-7">
          {["All", "Design", "Marketing", "Photo", "Content"].map((filter, index) => (
            <View key={filter} className={`mr-2 rounded-full px-5 py-3 ${index === 0 ? "bg-brand" : "bg-white"}`}>
              <Text className={`text-sm font-semibold ${index === 0 ? "text-white" : "text-muted"}`}>{filter}</Text>
            </View>
          ))}
        </ScrollView>
        {skills.map((skill) => (
          <Link key={skill.id} href={{ pathname: "/exchange/[id]", params: { id: skill.id } }} asChild>
            <TouchableOpacity activeOpacity={0.86} className="mb-4 rounded-3xl bg-white p-5">
              <View className="flex-row justify-between">
                <Text className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold text-brand">{skill.tag}</Text>
                <Text className="text-base font-bold text-brand">{skill.coins} BC</Text>
              </View>
              <Text className="mt-5 text-xl font-semibold text-ink">{skill.title}</Text>
              <View className="mt-3 flex-row items-center">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <Text className="font-bold text-brand">{skill.owner[0]}</Text>
                </View>
                <Text className="ml-2 text-sm text-muted">{skill.owner}</Text>
                <Ionicons name="star" size={13} color="#FFB547" style={{ marginLeft: 12 }} />
                <Text className="ml-1 text-sm font-medium text-ink">{skill.rating}</Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

