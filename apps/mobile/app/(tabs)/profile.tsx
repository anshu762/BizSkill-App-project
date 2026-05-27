import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/AppButton";
import { useAuthStore } from "../../src/store/useAuthStore";

const metrics = [
  { value: "12", label: "Swaps" },
  { value: "4.9", label: "Rating" },
  { value: "3", label: "Teams" },
];

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <View className="mt-4 items-end">
          <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
            <Ionicons name="settings-outline" size={22} color="#101828" />
          </TouchableOpacity>
        </View>
        <View className="-mt-3 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-[32px] bg-brand">
            <Text className="text-4xl font-bold text-white">{user?.name[0] ?? "B"}</Text>
          </View>
          <Text className="mt-5 text-2xl font-bold text-ink">{user?.name ?? "BizSkills Member"}</Text>
          <Text className="mt-1 text-sm text-muted">{user?.businessProfile?.businessName ?? "Student entrepreneur"}</Text>
        </View>
        <View className="my-8 flex-row justify-between rounded-3xl bg-white p-5">
          {metrics.map((metric) => (
            <View key={metric.label} className="w-1/3 items-center">
              <Text className="text-2xl font-bold text-ink">{metric.value}</Text>
              <Text className="mt-1 text-xs font-medium text-muted">{metric.label}</Text>
            </View>
          ))}
        </View>
        <View className="rounded-3xl bg-white p-5">
          <Text className="text-sm font-semibold uppercase tracking-wider text-brand">About</Text>
          <Text className="mt-3 text-sm leading-6 text-muted">{user?.bio ?? "Build your profile to connect with founders."}</Text>
          <Text className="mt-5 text-sm font-semibold text-ink">{user?.location ?? "Location not added"}</Text>
        </View>
        <AppButton variant="outline" label="Sign Out" className="mt-8" onPress={() => void logout()} />
      </ScrollView>
    </SafeAreaView>
  );
}

