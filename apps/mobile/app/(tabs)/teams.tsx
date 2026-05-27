import { Link } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../src/components/PageHeader";

const teams = [
  { id: "launch-lab", name: "Launch Lab", focus: "D2C growth crew", members: 12 },
  { id: "creator-circle", name: "Creator Circle", focus: "Branding and content", members: 8 },
  { id: "campus-founders", name: "Campus Founders", focus: "MVP builders", members: 24 },
];

export default function TeamsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <PageHeader eyebrow="Collaborate" title="Teams" />
        <View className="mb-7 rounded-[28px] bg-ink p-6">
          <Text className="text-xl font-semibold text-white">Build faster together</Text>
          <Text className="mt-2 leading-5 text-slate-300">Form a balanced team of founders, designers and marketers.</Text>
          <TouchableOpacity className="mt-5 self-start rounded-full bg-white px-5 py-3">
            <Text className="font-semibold text-ink">Create a team</Text>
          </TouchableOpacity>
        </View>
        {teams.map((team) => (
          <Link key={team.id} href={{ pathname: "/team/[teamId]", params: { teamId: team.id } }} asChild>
            <TouchableOpacity activeOpacity={0.86} className="mb-3 flex-row items-center rounded-3xl bg-white p-5">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Text className="text-xl font-bold text-brand">{team.name[0]}</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-semibold text-ink">{team.name}</Text>
                <Text className="mt-1 text-sm text-muted">{team.focus}</Text>
              </View>
              <Text className="text-xs font-semibold text-brand">{team.members} members</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

