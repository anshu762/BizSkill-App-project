import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../../src/components/AppButton";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { BizCoinBadge } from "../../src/components/BizCoinBadge";
import { ExchangeModal } from "../../src/components/ExchangeModal";
import { PageHeader } from "../../src/components/PageHeader";
import { useDiscover, useMarketplace } from "../../src/lib/apiHooks";

const categories = [
  { value: "", label: "All" },
  { value: "GRAPHIC_DESIGN", label: "Design" },
  { value: "SOCIAL_MEDIA", label: "Social" },
  { value: "PHOTOGRAPHY", label: "Photo" },
  { value: "WEBSITE", label: "Website" },
  { value: "MARKETING", label: "Marketing" },
  { value: "BRANDING", label: "Branding" },
  { value: "FINANCE", label: "Finance" },
  { value: "CONTENT", label: "Content" },
  { value: "OTHER", label: "Other" },
] as const;

const levels = ["BEGINNER", "INTERMEDIATE", "EXPERT"] as const;
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "coins_asc", label: "Coins: Low to High" },
  { value: "coins_desc", label: "Coins: High to Low" },
] as const;

export default function MarketplaceScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("newest");
  const [minCoins, setMinCoins] = useState("");
  const [maxCoins, setMaxCoins] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [exchangeTarget, setExchangeTarget] = useState<{ userId: string; skillId: string } | null>(null);

  const filters = useMemo(() => {
    const f: Record<string, any> = { sort };
    if (debouncedSearch) f.search = debouncedSearch;
    if (category) f.category = category;
    if (level) f.level = level;
    if (minCoins) f.minCoins = minCoins;
    if (maxCoins) f.maxCoins = maxCoins;
    return f;
  }, [debouncedSearch, category, level, sort, minCoins, maxCoins]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useMarketplace(filters);
  const { data: discoverData } = useDiscover({ minScore: "1", limit: "5" });

  const allSkills = useMemo(() => data?.pages.flatMap((p) => p.data ?? []) ?? [], [data]);
  const discoverUsers = useMemo(() => discoverData?.pages?.flatMap((p: any) => p.data ?? []) ?? [], [discoverData]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(text), 400);
  }, []);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-6">
          <PageHeader eyebrow="Marketplace" title="Find skills" />
          <View className="mb-4 flex-row items-center">
            <View className="flex-1 h-14 flex-row items-center rounded-2xl bg-white px-4">
              <Ionicons name="search-outline" size={20} color="#98A2B3" />
              <TextInput
                placeholder="Search skills or people"
                placeholderTextColor="#98A2B3"
                className="ml-3 flex-1 text-base text-ink bg-white"
                value={search}
                onChangeText={handleSearch}
              />
            </View>
            <TouchableOpacity onPress={() => setFilterOpen(true)} className="ml-3 h-14 w-14 items-center justify-center rounded-2xl bg-white">
              <Ionicons name="options-outline" size={22} color="#5B4DFF" />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View className="px-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <View key={i} className="mb-4 rounded-3xl bg-white p-5">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 rounded-full bg-gray-200" />
                  <View className="ml-3 flex-1">
                    <View className="mb-2 h-4 w-32 rounded bg-gray-200" />
                    <View className="h-3 w-20 rounded bg-gray-200" />
                  </View>
                </View>
                <View className="mt-3 h-6 w-24 rounded-full bg-gray-200" />
                <View className="mt-3 mb-3 h-5 w-48 rounded bg-gray-200" />
                <View className="h-14 w-full rounded-2xl bg-gray-200" />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={allSkills}
            keyExtractor={(item) => item.id}
            contentContainerClassName="px-6 pb-4"
            ListHeaderComponent={discoverUsers.length > 0 ? () => (
              <View className="mb-6">
                <Text className="mb-3 text-lg font-bold text-ink">People who match your skills</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {discoverUsers.map((user: any) => (
                    <TouchableOpacity
                      key={user.id}
                      onPress={() => router.push(`/profile/${user.id}`)}
                      className="mr-3 items-center rounded-3xl bg-white p-4"
                      style={{ width: 140 }}
                    >
                      <View className="relative">
                        <AvatarWithFallback uri={user.avatar} name={user.name?.[0] ?? "?"} size={52} />
                        <View className="absolute -top-1 -right-1 rounded-full bg-green-500 px-1.5 py-0.5">
                          <Text className="text-xs font-bold text-white">{user.matchScore}</Text>
                        </View>
                      </View>
                      <Text numberOfLines={1} className="mt-2 text-sm font-semibold text-ink">{user.name}</Text>
                      <Text numberOfLines={1} className="text-xs text-muted">{user.businessProfile?.businessName ?? "Founder"}</Text>
                      <View className="mt-2 rounded-full bg-green-50 px-3 py-0.5">
                        <Text className="text-xs font-medium text-green-700">{user.matchScore * 10}% match</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : undefined}
            onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator className="py-4" color="#5B4DFF" /> : null}
            renderItem={({ item }) => (
              <View className="mb-4 rounded-3xl bg-white p-5">
                <TouchableOpacity onPress={() => router.push(`/profile/${item.userId}`)} className="flex-row items-center">
                  <AvatarWithFallback uri={item.user?.avatar} name={item.user?.name ?? "?"} size={40} />
                  <View className="ml-3 flex-1">
                    <Text className="font-semibold text-ink">{item.user?.name}</Text>
                    <Text className="text-xs text-muted">{item.user?.businessProfile?.businessName ?? "Founder"}</Text>
                  </View>
                  <BizCoinBadge amount={item.coinValue} />
                </TouchableOpacity>
                <View className="mt-3 flex-row items-center">
                  <View className="rounded-full bg-indigo-50 px-3 py-1">
                    <Text className="text-xs font-medium text-brand">{item.category}</Text>
                  </View>
                  <View className="ml-2 rounded-full bg-gray-100 px-3 py-1">
                    <Text className="text-xs font-medium capitalize text-gray-600">{item.level.toLowerCase()}</Text>
                  </View>
                </View>
                <Text className="mt-3 text-lg font-semibold text-ink">{item.title}</Text>
                <AppButton
                  label="Request"
                  onPress={() => setExchangeTarget({ userId: item.userId, skillId: item.id })}
                  className="mt-3"
                />
              </View>
            )}
          />
        )}

      <Modal visible={filterOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFilterOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <SafeAreaView className="flex-1 bg-surface">
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="px-6 pb-8">
              <View className="mt-4 mb-6 flex-row items-center justify-between">
                <Text className="text-xl font-bold text-ink">Filters</Text>
                <TouchableOpacity onPress={() => setFilterOpen(false)}>
                  <Ionicons name="close" size={24} color="#101828" />
                </TouchableOpacity>
              </View>

              <Text className="mb-3 text-sm font-semibold text-ink">Category</Text>
              <View className="mb-6 flex-row flex-wrap">
                {categories.map((c) => (
                  <TouchableOpacity key={c.value} onPress={() => setCategory(c.value)} className={`mb-2 mr-2 rounded-full px-4 py-3 ${category === c.value ? "bg-brand" : "bg-white"}`}>
                    <Text className={`text-sm font-medium ${category === c.value ? "text-white" : "text-muted"}`}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="mb-3 text-sm font-semibold text-ink">Level</Text>
              <View className="mb-6 flex-row flex-wrap">
                {levels.map((l) => (
                  <TouchableOpacity key={l} onPress={() => setLevel(level === l ? "" : l)} className={`mb-2 mr-2 rounded-full px-5 py-3 ${level === l ? "bg-brand" : "bg-white"}`}>
                    <Text className={`text-sm font-medium capitalize ${level === l ? "text-white" : "text-muted"}`}>{l.toLowerCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="mb-3 text-sm font-semibold text-ink">BizCoin Range</Text>
              <View className="mb-6 flex-row">
                <TextInput placeholder="Min" placeholderTextColor="#98A2B3" keyboardType="number-pad" className="mr-2 flex-1 h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-ink" value={minCoins} onChangeText={setMinCoins} />
                <TextInput placeholder="Max" placeholderTextColor="#98A2B3" keyboardType="number-pad" className="flex-1 h-14 rounded-2xl border border-slate-200 bg-white px-4 text-base text-ink" value={maxCoins} onChangeText={setMaxCoins} />
              </View>

              <Text className="mb-3 text-sm font-semibold text-ink">Sort By</Text>
              <View className="mb-8 flex-row flex-wrap">
                {sortOptions.map((s) => (
                  <TouchableOpacity key={s.value} onPress={() => setSort(s.value)} className={`mb-2 mr-2 rounded-full px-5 py-3 ${sort === s.value ? "bg-brand" : "bg-white"}`}>
                    <Text className={`text-sm font-medium ${sort === s.value ? "text-white" : "text-muted"}`}>{s.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row">
                <AppButton label="Reset" variant="secondary" onPress={() => { setCategory(""); setLevel(""); setMinCoins(""); setMaxCoins(""); setSort("newest"); }} className="mr-3 flex-1" />
                <AppButton label="Apply" onPress={() => setFilterOpen(false)} className="flex-1" />
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {exchangeTarget && (
        <ExchangeModal
          visible={!!exchangeTarget}
          onClose={() => setExchangeTarget(null)}
          targetUserId={exchangeTarget.userId}
          targetSkillId={exchangeTarget.skillId}
        />
      )}
    </SafeAreaView>
  </KeyboardAvoidingView>
  );
}
