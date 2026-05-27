import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/AppButton";

export default function PublicProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mt-3 h-12 w-12 items-center justify-center rounded-2xl bg-white">
          <Ionicons name="arrow-back" size={21} color="#101828" />
        </TouchableOpacity>
        <View className="mt-8 items-center rounded-[30px] bg-white px-6 py-8">
          <View className="h-24 w-24 items-center justify-center rounded-[30px] bg-brand">
            <Text className="text-4xl font-bold text-white">R</Text>
          </View>
          <Text className="mt-5 text-2xl font-bold text-ink">Rhea Malik</Text>
          <Text className="mt-2 text-sm text-muted">Brand designer - Delhi</Text>
          <View className="mt-6 flex-row">
            <View className="mr-3 rounded-2xl bg-surface px-6 py-3">
              <Text className="text-center text-xl font-bold text-ink">4.9</Text>
              <Text className="text-xs text-muted">Rating</Text>
            </View>
            <View className="rounded-2xl bg-surface px-6 py-3">
              <Text className="text-center text-xl font-bold text-ink">26</Text>
              <Text className="text-xs text-muted">Exchanges</Text>
            </View>
          </View>
        </View>
        <Text className="mb-3 mt-7 text-lg font-bold text-ink">Offered skills</Text>
        {["Brand Identity", "Social Templates", "Pitch Visuals"].map((skill) => (
          <View key={skill} className="mb-2 flex-row items-center justify-between rounded-2xl bg-white p-4">
            <Text className="font-medium text-ink">{skill}</Text>
            <Text className="font-semibold text-brand">From 30 BC</Text>
          </View>
        ))}
        <AppButton label="Message Rhea" className="mt-7" />
      </ScrollView>
    </SafeAreaView>
  );
}

