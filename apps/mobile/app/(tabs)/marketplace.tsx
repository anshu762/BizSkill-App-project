import React, { useCallback, useMemo, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { AppText } from "../../src/components/ui/AppText";
import { AppCard } from "../../src/components/ui/AppCard";
import { AppButton } from "../../src/components/ui/AppButton";
import { Avatar } from "../../src/components/ui/Avatar";
import { BizCoinBadge } from "../../src/components/ui/BizCoinBadge";
import { SkillChip as BaseSkillChip } from "../../src/components/ui/SkillChip";
import { ShimmerLoader } from "../../src/components/ui/ShimmerLoader";
import { EmptyMarketplace } from "../../src/components/ui/EmptyState";
import { ExchangeModal } from "../../src/components/ExchangeModal";
import { useDiscover, useMarketplace } from "../../src/lib/apiHooks";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { Colors } from "../../src/constants/theme";

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
  const theme = useThemeColors();
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
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
          <AppText variant="caption" style={{ color: Colors.brand, textTransform: 'uppercase', tracking: 2 }}>Marketplace</AppText>
          <AppText variant="h1" style={{ marginTop: 4 }}>Find skills</AppText>
          
          <View style={{ marginTop: 24, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: theme.elevated, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.border }}>
              <Ionicons name="search-outline" size={20} color={theme.textTertiary} />
              <TextInput
                placeholder="Search skills or people"
                placeholderTextColor={theme.textTertiary}
                style={{ marginLeft: 12, flex: 1, fontSize: 16, color: theme.textPrimary, fontFamily: 'Outfit_500Medium' }}
                value={search}
                onChangeText={handleSearch}
              />
            </View>
            <TouchableOpacity onPress={() => setFilterOpen(true)} style={{ marginLeft: 12, height: 56, width: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border }}>
              <Ionicons name="options-outline" size={24} color={Colors.brand} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={{ paddingHorizontal: 24 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <AppCard key={i} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ShimmerLoader width={40} height={40} borderRadius={20} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <ShimmerLoader width="50%" height={16} style={{ marginBottom: 8 }} />
                    <ShimmerLoader width="30%" height={12} />
                  </View>
                  <ShimmerLoader width={70} height={28} borderRadius={14} />
                </View>
                <ShimmerLoader width="40%" height={24} borderRadius={12} style={{ marginTop: 16 }} />
                <ShimmerLoader width="80%" height={20} style={{ marginTop: 12, marginBottom: 16 }} />
                <ShimmerLoader width="100%" height={48} borderRadius={12} />
              </AppCard>
            ))}
          </View>
        ) : (
          <FlatList
            data={allSkills}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            ListHeaderComponent={discoverUsers.length > 0 ? () => (
              <View style={{ marginBottom: 24 }}>
                <AppText variant="h3" style={{ marginBottom: 16 }}>People who match your skills</AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {discoverUsers.map((user: any) => (
                    <TouchableOpacity
                      key={user.id}
                      onPress={() => router.push(`/profile/${user.id}`)}
                      activeOpacity={0.8}
                      style={{ marginRight: 12, width: 140 }}
                    >
                      <AppCard style={{ alignItems: 'center', padding: 16 }}>
                        <View style={{ position: 'relative' }}>
                          <Avatar uri={user.avatar} name={user.name?.[0] ?? "?"} size={52} />
                          <View style={{ position: 'absolute', top: -4, right: -4, borderRadius: 10, backgroundColor: Colors.success, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 2, borderColor: theme.elevated }}>
                            <AppText style={{ fontSize: 10, fontFamily: 'Outfit_700Bold', color: '#FFFFFF' }}>{user.matchScore}</AppText>
                          </View>
                        </View>
                        <AppText numberOfLines={1} style={{ marginTop: 12, fontSize: 14, fontFamily: 'Outfit_600SemiBold', color: theme.textPrimary }}>{user.name}</AppText>
                        <AppText numberOfLines={1} variant="caption" style={{ color: theme.textTertiary, marginTop: 2 }}>{user.businessProfile?.businessName ?? "Founder"}</AppText>
                        <View style={{ marginTop: 12, borderRadius: 12, backgroundColor: Colors.successTint, paddingHorizontal: 12, paddingVertical: 4 }}>
                          <AppText style={{ fontSize: 12, fontFamily: 'Outfit_500Medium', color: Colors.success }}>{user.matchScore * 10}% match</AppText>
                        </View>
                      </AppCard>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : undefined}
            ListEmptyComponent={() => <EmptyMarketplace onAction={() => { setCategory(""); setLevel(""); setSearch(""); setDebouncedSearch(""); }} />}
            onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ paddingVertical: 16 }} color={Colors.brand} /> : null}
            renderItem={({ item }) => (
              <AppCard style={{ marginBottom: 16 }}>
                <TouchableOpacity onPress={() => router.push(`/profile/${item.userId}`)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Avatar uri={item.user?.avatar} name={item.user?.name ?? "?"} size={40} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold', color: theme.textPrimary }}>{item.user?.name}</AppText>
                    <AppText variant="caption" style={{ color: theme.textTertiary }}>{item.user?.businessProfile?.businessName ?? "Founder"}</AppText>
                  </View>
                  <BizCoinBadge amount={item.coinValue} />
                </TouchableOpacity>
                <View style={{ marginTop: 16 }}>
                  <BaseSkillChip category={item.category} label={item.title} level={item.level} showLevel />
                </View>
                <AppButton
                  title="Request Exchange"
                  variant="primary"
                  onPress={() => setExchangeTarget({ userId: item.userId, skillId: item.id })}
                  style={{ marginTop: 20 }}
                />
              </AppCard>
            )}
          />
        )}

      <Modal visible={filterOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setFilterOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}>
              <View style={{ marginTop: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <AppText variant="h2">Filters</AppText>
                <TouchableOpacity onPress={() => setFilterOpen(false)}>
                  <Ionicons name="close" size={24} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <AppText variant="label" style={{ marginBottom: 12, color: theme.textPrimary }}>Category</AppText>
              <View style={{ marginBottom: 24, flexDirection: 'row', flexWrap: 'wrap' }}>
                {categories.map((c) => (
                  <TouchableOpacity key={c.value} onPress={() => setCategory(c.value)} style={{ marginBottom: 8, marginRight: 8, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: category === c.value ? Colors.brand : theme.elevated, borderWidth: 1, borderColor: category === c.value ? Colors.brand : theme.border }}>
                    <AppText style={{ fontSize: 14, fontFamily: 'Outfit_500Medium', color: category === c.value ? '#FFFFFF' : theme.textSecondary }}>{c.label}</AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <AppText variant="label" style={{ marginBottom: 12, color: theme.textPrimary }}>Level</AppText>
              <View style={{ marginBottom: 24, flexDirection: 'row', flexWrap: 'wrap' }}>
                {levels.map((l) => (
                  <TouchableOpacity key={l} onPress={() => setLevel(level === l ? "" : l)} style={{ marginBottom: 8, marginRight: 8, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: level === l ? Colors.brand : theme.elevated, borderWidth: 1, borderColor: level === l ? Colors.brand : theme.border }}>
                    <AppText style={{ fontSize: 14, fontFamily: 'Outfit_500Medium', textTransform: 'capitalize', color: level === l ? '#FFFFFF' : theme.textSecondary }}>{l.toLowerCase()}</AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <AppText variant="label" style={{ marginBottom: 12, color: theme.textPrimary }}>BizCoin Range</AppText>
              <View style={{ marginBottom: 24, flexDirection: 'row' }}>
                <TextInput placeholder="Min" placeholderTextColor={theme.textTertiary} keyboardType="number-pad" style={{ marginRight: 8, flex: 1, height: 56, borderRadius: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.elevated, paddingHorizontal: 16, fontSize: 16, color: theme.textPrimary }} value={minCoins} onChangeText={setMinCoins} />
                <TextInput placeholder="Max" placeholderTextColor={theme.textTertiary} keyboardType="number-pad" style={{ flex: 1, height: 56, borderRadius: 16, borderWidth: 1, borderColor: theme.border, backgroundColor: theme.elevated, paddingHorizontal: 16, fontSize: 16, color: theme.textPrimary }} value={maxCoins} onChangeText={setMaxCoins} />
              </View>

              <AppText variant="label" style={{ marginBottom: 12, color: theme.textPrimary }}>Sort By</AppText>
              <View style={{ marginBottom: 32, flexDirection: 'row', flexWrap: 'wrap' }}>
                {sortOptions.map((s) => (
                  <TouchableOpacity key={s.value} onPress={() => setSort(s.value)} style={{ marginBottom: 8, marginRight: 8, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: sort === s.value ? Colors.brand : theme.elevated, borderWidth: 1, borderColor: sort === s.value ? Colors.brand : theme.border }}>
                    <AppText style={{ fontSize: 14, fontFamily: 'Outfit_500Medium', color: sort === s.value ? '#FFFFFF' : theme.textSecondary }}>{s.label}</AppText>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: 'row' }}>
                <AppButton title="Reset" variant="secondary" onPress={() => { setCategory(""); setLevel(""); setMinCoins(""); setMaxCoins(""); setSort("newest"); }} style={{ marginRight: 12, flex: 1 }} />
                <AppButton title="Apply" onPress={() => setFilterOpen(false)} style={{ flex: 1 }} />
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
