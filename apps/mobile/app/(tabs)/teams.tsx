import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/AppButton";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { SelectableChip } from "../../src/components/SelectableChip";
import { PageHeader } from "../../src/components/PageHeader";
import { useCreateTeam, useMyTeams, useTeams } from "../../src/lib/apiHooks";
import { TeamCardSkeleton } from "../../src/components/Skeletons";

const categories = [
  { value: "ALL", label: "All" },
  { value: "SCHOOL_STARTUP", label: "Startup" },
  { value: "COMPETITION", label: "Competition" },
  { value: "BUSINESS_FAIR", label: "Biz Fair" },
  { value: "PERSONAL_PROJECT", label: "Personal" },
];

const stages = [
  { value: "ALL", label: "All" },
  { value: "FORMING", label: "Forming" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
];

const stageColors: Record<string, string> = {
  FORMING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-gray-100 text-gray-600",
};

const categoryLabels: Record<string, string> = {
  SCHOOL_STARTUP: "Startup",
  COMPETITION: "Competition",
  BUSINESS_FAIR: "Biz Fair",
  PERSONAL_PROJECT: "Personal",
};

export default function TeamsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"discover" | "my" | "applications">("discover");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [stage, setStage] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createCat, setCreateCat] = useState("PERSONAL_PROJECT");

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (debouncedSearch) f.search = debouncedSearch;
    if (category !== "ALL") f.category = category;
    if (stage !== "ALL") f.stage = stage;
    return f;
  }, [debouncedSearch, category, stage]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useTeams(filters);
  const { data: myTeamsData, isLoading: myLoading } = useMyTeams();
  const createTeam = useCreateTeam();

  const allTeams = useMemo(() => data?.pages.flatMap((p: any) => p.data ?? []) ?? [], [data]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 400);
  }, []);

  const handleCreate = async () => {
    if (!createName.trim()) return;
    await createTeam.mutateAsync({ name: createName, description: createDesc, category: createCat });
    setCreateOpen(false);
    setCreateName("");
    setCreateDesc("");
  };

  const tabIcons: Record<string, string> = {
    discover: "compass-outline",
    my: "people-outline",
    applications: "documents-outline",
  };

  const TabButton = ({ label, value }: { label: string; value: typeof tab }) => (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => setTab(value)}
      className={`mr-3 flex-1 flex-row items-center justify-center rounded-2xl py-3 border ${
        tab === value ? "bg-brand border-brand" : "bg-white border-slate-200"
      }`}
      style={tab === value ? { backgroundColor: "#5B4DFF", borderColor: "#5B4DFF" } : undefined}
    >
      <Ionicons
        name={tabIcons[value] as any}
        size={16}
        color={tab === value ? "#FFFFFF" : "#667085"}
      />
      <Text className={`ml-1.5 text-sm font-semibold ${tab === value ? "text-white" : "text-muted"}`} style={tab === value ? { color: "#FFFFFF" } : undefined}>{label}</Text>
    </TouchableOpacity>
  );

  const renderTeamCard = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => router.push(`/team/${item.id}`)}
      activeOpacity={0.86}
      className="mb-4 rounded-3xl bg-white p-5"
    >
      <View className="flex-row items-center">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
          <Text className="text-xl font-bold text-brand">{item.name[0]}</Text>
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-lg font-semibold text-ink">{item.name}</Text>
          {item.owner && (
            <View className="mt-1 flex-row items-center">
              <Text className="text-xs text-muted">by {item.owner.name}</Text>
            </View>
          )}
        </View>
      </View>
      <View className="mt-4 flex-row items-center">
        <View className="rounded-full bg-indigo-50 px-3 py-1">
          <Text className="text-xs font-medium text-brand">{categoryLabels[item.category] || item.category}</Text>
        </View>
        <View className={`ml-2 rounded-full px-3 py-1 ${stageColors[item.stage] || "bg-gray-100"}`}>
          <Text className="text-xs font-medium capitalize">{item.stage?.toLowerCase()}</Text>
        </View>
      </View>
      {item.description && (
        <Text numberOfLines={2} className="mt-3 text-sm leading-5 text-muted">{item.description}</Text>
      )}
      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {item.members?.slice(0, 4).map((m: any, i: number) => (
            <View key={m.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
              <AvatarWithFallback uri={m.user?.avatar} name={m.user?.name?.[0] ?? "?"} size={26} />
            </View>
          ))}
          <Text className="ml-2 text-xs font-medium text-muted">
            {item._count?.members ?? 0} member{(item._count?.members ?? 0) !== 1 ? "s" : ""}
          </Text>
        </View>
        <Text className="text-xs font-semibold text-brand">
          {item.openRolesCount ?? item._count?.roles ?? 0} open role{(item.openRolesCount ?? item._count?.roles ?? 0) !== 1 ? "s" : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-6">
        <PageHeader eyebrow="Collaborate" title="Teams" />
        <View className="mb-5 flex-row">
          <TabButton label="Discover" value="discover" />
          <TabButton label="My Teams" value="my" />
          <TabButton label="Applications" value="applications" />
        </View>

        {tab === "discover" && (
          <>
            <View className="mb-4 h-14 flex-row items-center rounded-2xl bg-white px-4">
              <Ionicons name="search-outline" size={20} color="#98A2B3" />
              <TextInput
                placeholder="Search teams..."
                placeholderTextColor="#98A2B3"
                className="ml-3 flex-1 text-base text-ink bg-white"
                value={search}
                onChangeText={handleSearch}
              />
            </View>
            <View className="mb-1">
              <Text className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map((c) => (
                  <SelectableChip
                    key={c.value}
                    label={c.label}
                    selected={category === c.value}
                    onPress={() => setCategory(c.value)}
                  />
                ))}
              </ScrollView>
            </View>
            <View className="mb-4 mt-4">
              <Text className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted">Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {stages.map((s) => (
                  <SelectableChip
                    key={s.value}
                    label={s.label}
                    selected={stage === s.value}
                    onPress={() => setStage(s.value)}
                  />
                ))}
              </ScrollView>
            </View>
            {isLoading ? (
              <View className="pb-20">
                <TeamCardSkeleton />
                <TeamCardSkeleton />
                <TeamCardSkeleton />
              </View>
            ) : (
            <FlatList
              data={allTeams}
              keyExtractor={(item: any) => item.id}
              renderItem={renderTeamCard}
              onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-4" color="#5B4DFF" /> : null}
              contentContainerClassName="pb-20"
            />
            )}
            <TouchableOpacity
              onPress={() => setCreateOpen(true)}
              className="absolute bottom-6 right-0 h-14 w-14 items-center justify-center rounded-full bg-brand"
            >
              <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>
          </>
        )}

        {tab === "my" && (
          <ScrollView contentContainerClassName="pb-8">
            {myTeamsData?.owned?.length > 0 && (
              <>
                <Text className="mb-3 text-sm font-semibold text-ink">Teams I Lead</Text>
                {myTeamsData.owned.map((team: any) => (
                  <TouchableOpacity
                    key={team.id}
                    onPress={() => router.push(`/team/${team.id}`)}
                    className="mb-3 rounded-3xl bg-white p-5"
                  >
                    <View className="flex-row items-center">
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                        <Text className="text-lg font-bold text-brand">{team.name[0]}</Text>
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="font-semibold text-ink">{team.name}</Text>
                        <Text className="text-xs text-muted">{team._count?.members ?? 0} members · {team.openRolesCount ?? 0} open roles</Text>
                      </View>
                    </View>
                    <View className="mt-3 flex-row">
                      <AppButton label="View Applications" variant="outline" className="mr-2 flex-1" onPress={() => router.push(`/team/${team.id}?tab=apps`)} />
                      <AppButton label="Edit" variant="outline" className="flex-1" onPress={() => router.push(`/team/${team.id}`)} />
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {myTeamsData?.member?.length > 0 && (
              <View className="mt-4">
                <Text className="mb-3 text-sm font-semibold text-ink">Teams I'm In</Text>
                {myTeamsData.member.map((team: any) => (
                  <TouchableOpacity
                    key={team.id}
                    onPress={() => router.push(`/team/${team.id}`)}
                    className="mb-3 rounded-3xl bg-white p-5"
                  >
                    <View className="flex-row items-center">
                      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                        <Text className="text-lg font-bold text-brand">{team.name[0]}</Text>
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="font-semibold text-ink">{team.name}</Text>
                        <Text className="text-xs text-muted">by {team.owner?.name}</Text>
                      </View>
                      <Text className="text-xs font-medium text-muted">{team._count?.members ?? 0} members</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {(!myTeamsData?.owned?.length && !myTeamsData?.member?.length) && (
              <View className="mt-16 items-center px-4">
                <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-indigo-50">
                  <Ionicons name="people-outline" size={36} color="#5B4DFF" />
                </View>
                <Text className="mt-5 text-xl font-bold text-ink">No teams yet</Text>
                <Text className="mt-2 text-center text-sm leading-5 text-muted">Start or join a team to collaborate with other founders on projects, competitions, and business ideas.</Text>
              </View>
            )}

            <AppButton label="Create a Team" onPress={() => setCreateOpen(true)} className="mt-6" />
          </ScrollView>
        )}

        {tab === "applications" && (
          <ScrollView contentContainerClassName="pb-8">
            {myTeamsData?.applications?.length > 0 ? (
              myTeamsData.applications.map((app: any) => (
                <View key={app.id} className="mb-3 rounded-3xl bg-white p-5">
                  <Text className="font-semibold text-ink">{app.teamRole?.title}</Text>
                  <Text className="text-xs text-muted">for {app.teamRole?.team?.name}</Text>
                  <View className={`mt-2 self-start rounded-full px-3 py-1 ${app.status === "PENDING" ? "bg-amber-100" : app.status === "ACCEPTED" ? "bg-green-100" : "bg-red-100"}`}>
                    <Text className={`text-xs font-medium ${app.status === "PENDING" ? "text-amber-700" : app.status === "ACCEPTED" ? "text-green-700" : "text-red-600"}`}>
                      {app.status}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View className="mt-16 items-center px-4">
                <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-indigo-50">
                  <Ionicons name="documents-outline" size={36} color="#5B4DFF" />
                </View>
                <Text className="mt-5 text-xl font-bold text-ink">No applications yet</Text>
                <Text className="mt-2 text-center text-sm leading-5 text-muted">Apply to open team roles to see your applications here.</Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <Modal visible={createOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCreateOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1 bg-surface">
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-8">
              <View className="mt-4 mb-6 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-ink">Create Team</Text>
                <TouchableOpacity onPress={() => setCreateOpen(false)}>
                  <Ionicons name="close" size={24} color="#101828" />
                </TouchableOpacity>
              </View>
              <Text className="mb-2 text-sm font-semibold text-ink">Team Name</Text>
              <TextInput
                placeholder="e.g. Launch Lab"
                placeholderTextColor="#98A2B3"
                className="mb-4 h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-ink"
                value={createName}
                onChangeText={setCreateName}
              />
              <Text className="mb-2 text-sm font-semibold text-ink">Description (optional)</Text>
              <TextInput
                placeholder="What's your team about?"
                placeholderTextColor="#98A2B3"
                multiline
                className="mb-4 min-h-[100px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-ink"
                value={createDesc}
                onChangeText={setCreateDesc}
              />
              <Text className="mb-3 text-sm font-semibold text-ink">Category</Text>
              <View className="mb-6 flex-row flex-wrap">
                {categories.filter((c) => c.value !== "ALL").map((c) => (
                  <SelectableChip
                    key={c.value}
                    label={c.label}
                    selected={createCat === c.value}
                    onPress={() => setCreateCat(c.value)}
                    chipStyle="pill"
                  />
                ))}
              </View>
              <AppButton label="Create Team" onPress={handleCreate} />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
