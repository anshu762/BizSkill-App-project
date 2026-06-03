import React, { useCallback, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Modal, ScrollView, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/ui/AppButton";
import { AppText } from "../../src/components/ui/AppText";
import { AppCard } from "../../src/components/ui/AppCard";
import { Avatar } from "../../src/components/ui/Avatar";
import { SelectableChip } from "../../src/components/SelectableChip";
import { SkeletonTeamCard } from "../../src/components/ui/ShimmerLoader";
import { EmptyTeams } from "../../src/components/ui/EmptyState";
import { useCreateTeam, useMyTeams, useTeams } from "../../src/lib/apiHooks";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { Colors } from "../../src/constants/theme";

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

const stageColors: Record<string, { bg: string; text: string }> = {
  FORMING: { bg: 'rgba(217, 119, 6, 0.1)', text: '#D97706' },
  ACTIVE: { bg: 'rgba(5, 150, 105, 0.1)', text: '#059669' },
  COMPLETED: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280' },
};

const categoryLabels: Record<string, string> = {
  SCHOOL_STARTUP: "Startup",
  COMPETITION: "Competition",
  BUSINESS_FAIR: "Biz Fair",
  PERSONAL_PROJECT: "Personal",
};

export default function TeamsScreen() {
  const router = useRouter();
  const theme = useThemeColors();
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

  const tabIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    discover: "compass-outline",
    my: "people-outline",
    applications: "documents-outline",
  };

  const TabButton = ({ label, value }: { label: string; value: typeof tab }) => (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => setTab(value)}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingVertical: 10,
        backgroundColor: tab === value ? theme.isDark ? '#3C3489' : '#FFFFFF' : 'transparent',
        shadowColor: tab === value ? '#000' : 'transparent',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: tab === value ? 0.05 : 0,
        shadowRadius: 4,
        elevation: tab === value ? 2 : 0,
      }}
    >
      <AppText variant="label" style={{ color: tab === value ? (theme.isDark ? '#FFFFFF' : Colors.brand) : theme.textSecondary }}>{label}</AppText>
    </TouchableOpacity>
  );

  const renderTeamCard = ({ item }: any) => (
    <TouchableOpacity onPress={() => router.push(`/team/${item.id}`)} activeOpacity={0.8} style={{ marginBottom: 16 }}>
      <AppCard style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ height: 56, width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.brandTint }}>
            <AppText style={{ fontSize: 24, fontFamily: 'Outfit_700Bold', color: Colors.brand }}>{item.name[0]}</AppText>
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <AppText variant="h3">{item.name}</AppText>
            {item.owner && (
              <AppText variant="caption" style={{ color: theme.textTertiary, marginTop: 2 }}>by {item.owner.name}</AppText>
            )}
          </View>
        </View>
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ borderRadius: 999, backgroundColor: Colors.brandTint, paddingHorizontal: 12, paddingVertical: 4 }}>
            <AppText style={{ fontSize: 12, fontFamily: 'Outfit_500Medium', color: Colors.brand }}>{categoryLabels[item.category] || item.category}</AppText>
          </View>
          <View style={{ marginLeft: 8, borderRadius: 999, backgroundColor: stageColors[item.stage]?.bg || theme.elevated, paddingHorizontal: 12, paddingVertical: 4 }}>
            <AppText style={{ fontSize: 12, fontFamily: 'Outfit_500Medium', textTransform: 'capitalize', color: stageColors[item.stage]?.text || theme.textSecondary }}>{item.stage?.toLowerCase()}</AppText>
          </View>
        </View>
        {!!item.description && (
          <AppText numberOfLines={2} style={{ marginTop: 12, fontSize: 14, lineHeight: 20, color: theme.textSecondary }}>{item.description}</AppText>
        )}
        <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.members?.slice(0, 4).map((m: any, i: number) => (
              <View key={m.id} style={{ marginLeft: i > 0 ? -8 : 0, borderWidth: 2, borderColor: theme.bg, borderRadius: 999 }}>
                <Avatar uri={m.user?.avatar} name={m.user?.name?.[0] ?? "?"} size={28} />
              </View>
            ))}
            <AppText style={{ marginLeft: 8, fontSize: 12, fontFamily: 'Outfit_500Medium', color: theme.textTertiary }}>
              {item._count?.members ?? 0} member{(item._count?.members ?? 0) !== 1 ? "s" : ""}
            </AppText>
          </View>
          <AppText style={{ fontSize: 12, fontFamily: 'Outfit_600SemiBold', color: Colors.brand }}>
            {item.openRolesCount ?? item._count?.roles ?? 0} open role{(item.openRolesCount ?? item._count?.roles ?? 0) !== 1 ? "s" : ""}
          </AppText>
        </View>
      </AppCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
        <AppText variant="caption" style={{ color: Colors.brand, textTransform: 'uppercase', letterSpacing: 2 }}>Collaborate</AppText>
        <AppText variant="h1" style={{ marginTop: 4, marginBottom: 20 }}>Teams</AppText>

        <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: theme.elevated, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: theme.border }}>
          <TabButton label="Discover" value="discover" />
          <TabButton label="My Teams" value="my" />
          <TabButton label="Applications" value="applications" />
        </View>

        {tab === "discover" && (
          <>
            <View style={{ marginBottom: 16, height: 56, flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: theme.elevated, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border }}>
              <Ionicons name="search-outline" size={20} color={theme.textTertiary} />
              <TextInput
                placeholder="Search teams..."
                placeholderTextColor={theme.textTertiary}
                style={{ marginLeft: 12, flex: 1, fontSize: 16, color: theme.textPrimary, fontFamily: 'Outfit_500Medium' }}
                value={search}
                onChangeText={handleSearch}
              />
            </View>
            <View style={{ marginBottom: 4 }}>
              <AppText variant="label" style={{ marginBottom: 10, color: theme.textSecondary, textTransform: 'uppercase' }}>Category</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
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
            <View style={{ marginBottom: 16 }}>
              <AppText variant="label" style={{ marginBottom: 10, color: theme.textSecondary, textTransform: 'uppercase' }}>Status</AppText>
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
              <View style={{ paddingBottom: 80 }}>
                <SkeletonTeamCard />
                <SkeletonTeamCard />
                <SkeletonTeamCard />
              </View>
            ) : (
            <FlatList
              data={allTeams}
              keyExtractor={(item: any) => item.id}
              renderItem={renderTeamCard}
              onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ paddingVertical: 16 }} color={Colors.brand} /> : null}
              contentContainerStyle={{ paddingBottom: 100 }}
              ListEmptyComponent={() => <EmptyTeams onAction={() => setCreateOpen(true)} />}
            />
            )}
          </>
        )}

        {tab === "my" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {myTeamsData?.owned?.length > 0 && (
              <>
                <AppText variant="h3" style={{ marginBottom: 12 }}>Teams I Lead</AppText>
                {myTeamsData.owned.map((team: any) => (
                  <TouchableOpacity
                    key={team.id}
                    onPress={() => router.push(`/team/${team.id}`)}
                    style={{ marginBottom: 12 }}
                  >
                    <AppCard>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.brandTint }}>
                          <AppText style={{ fontSize: 20, fontFamily: 'Outfit_700Bold', color: Colors.brand }}>{team.name[0]}</AppText>
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold', color: theme.textPrimary }}>{team.name}</AppText>
                          <AppText variant="caption" style={{ color: theme.textTertiary, marginTop: 2 }}>{team._count?.members ?? 0} members · {team.openRolesCount ?? 0} open roles</AppText>
                        </View>
                      </View>
                      <View style={{ marginTop: 12, flexDirection: 'row' }}>
                        <AppButton title="Applications" variant="secondary" style={{ marginRight: 8, flex: 1 }} onPress={() => router.push(`/team/${team.id}?tab=apps`)} />
                        <AppButton title="Edit" variant="secondary" style={{ flex: 1 }} onPress={() => router.push(`/team/${team.id}`)} />
                      </View>
                    </AppCard>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {myTeamsData?.member?.length > 0 && (
              <View style={{ marginTop: 16 }}>
                <AppText variant="h3" style={{ marginBottom: 12 }}>Teams I'm In</AppText>
                {myTeamsData.member.map((team: any) => (
                  <TouchableOpacity
                    key={team.id}
                    onPress={() => router.push(`/team/${team.id}`)}
                    style={{ marginBottom: 12 }}
                  >
                    <AppCard>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ height: 48, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.brandTint }}>
                          <AppText style={{ fontSize: 20, fontFamily: 'Outfit_700Bold', color: Colors.brand }}>{team.name[0]}</AppText>
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold', color: theme.textPrimary }}>{team.name}</AppText>
                          <AppText variant="caption" style={{ color: theme.textTertiary, marginTop: 2 }}>by {team.owner?.name}</AppText>
                        </View>
                        <AppText style={{ fontSize: 12, fontFamily: 'Outfit_500Medium', color: theme.textTertiary }}>{team._count?.members ?? 0} members</AppText>
                      </View>
                    </AppCard>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {(!myTeamsData?.owned?.length && !myTeamsData?.member?.length && !myLoading) && (
              <EmptyTeams onAction={() => setCreateOpen(true)} />
            )}
          </ScrollView>
        )}

        {tab === "applications" && (
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
            {myTeamsData?.applications?.length > 0 ? (
              myTeamsData.applications.map((app: any) => (
                <AppCard key={app.id} style={{ marginBottom: 12 }}>
                  <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold', color: theme.textPrimary }}>{app.teamRole?.title}</AppText>
                  <AppText variant="caption" style={{ color: theme.textTertiary, marginTop: 2 }}>for {app.teamRole?.team?.name}</AppText>
                  <View style={{ marginTop: 8, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: app.status === "PENDING" ? 'rgba(217, 119, 6, 0.1)' : app.status === "ACCEPTED" ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)' }}>
                    <AppText style={{ fontSize: 12, fontFamily: 'Outfit_500Medium', color: app.status === "PENDING" ? '#D97706' : app.status === "ACCEPTED" ? '#059669' : '#DC2626' }}>
                      {app.status}
                    </AppText>
                  </View>
                </AppCard>
              ))
            ) : (
              <View style={{ marginTop: 64, alignItems: 'center', paddingHorizontal: 16 }}>
                <View style={{ height: 80, width: 80, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: Colors.brandTint }}>
                  <Ionicons name="documents-outline" size={36} color={Colors.brand} />
                </View>
                <AppText variant="h2" style={{ marginTop: 20 }}>No applications yet</AppText>
                <AppText variant="body" style={{ marginTop: 8, textAlign: 'center', color: theme.textSecondary }}>Apply to open team roles to see your applications here.</AppText>
              </View>
            )}
          </ScrollView>
        )}

        {/* Global Floating Action Button for Create Team */}
        {tab !== "applications" && (
          <TouchableOpacity
            onPress={() => setCreateOpen(true)}
            style={{ position: 'absolute', bottom: 24, right: 24, height: 56, width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: Colors.brand, shadowColor: Colors.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={createOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setCreateOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
              <View style={{ marginTop: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText variant="h2">Create Team</AppText>
                <TouchableOpacity onPress={() => setCreateOpen(false)}>
                  <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
              <AppText variant="label" style={{ marginBottom: 8, color: theme.textPrimary }}>Team Name</AppText>
              <TextInput
                placeholder="e.g. Launch Lab"
                placeholderTextColor={theme.textTertiary}
                style={{ marginBottom: 16, height: 56, borderRadius: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.elevated, paddingHorizontal: 16, fontSize: 16, color: theme.textPrimary }}
                value={createName}
                onChangeText={setCreateName}
              />
              <AppText variant="label" style={{ marginBottom: 8, color: theme.textPrimary }}>Description (optional)</AppText>
              <TextInput
                placeholder="What's your team about?"
                placeholderTextColor={theme.textTertiary}
                multiline
                style={{ marginBottom: 16, minHeight: 100, borderRadius: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.elevated, paddingHorizontal: 16, paddingTop: 16, fontSize: 16, color: theme.textPrimary }}
                value={createDesc}
                onChangeText={setCreateDesc}
              />
              <AppText variant="label" style={{ marginBottom: 12, color: theme.textPrimary }}>Category</AppText>
              <View style={{ marginBottom: 24, flexDirection: 'row', flexWrap: 'wrap' }}>
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
              <AppButton title="Create Team" onPress={handleCreate} disabled={!createName.trim()} />
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
