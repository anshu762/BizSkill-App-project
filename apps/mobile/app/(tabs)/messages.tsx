import React from "react";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { AppText } from "../../src/components/ui/AppText";
import { AppCard } from "../../src/components/ui/AppCard";
import { Avatar } from "../../src/components/ui/Avatar";
import { EmptyMessages } from "../../src/components/ui/EmptyState";
import { ErrorBoundary } from "../../src/components/ErrorBoundary";
import { useConversations } from "../../src/lib/apiHooks";
import { useThemeColors } from "../../src/hooks/useThemeColors";
import { Colors } from "../../src/constants/theme";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function MessagesScreen() {
  const router = useRouter();
  const theme = useThemeColors();
  const { data: conversations, isLoading } = useConversations();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.brand} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          <AppText variant="caption" style={{ color: Colors.brand, textTransform: 'uppercase', tracking: 2 }}>Inbox</AppText>
          <AppText variant="h1" style={{ marginTop: 4, marginBottom: 24 }}>Messages</AppText>
          
          {conversations?.length > 0 ? (
            <FlatList
              data={conversations}
              keyExtractor={(item: any) => item.user.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => router.push(`/messages/${item.user.id}` as any)}
                  activeOpacity={0.8}
                  style={{ marginBottom: 12 }}
                >
                  <AppCard style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                    <Avatar uri={item.user?.avatar} name={item.user?.name?.[0] ?? "?"} size={52} />
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <AppText variant="body" style={{ fontFamily: 'Outfit_600SemiBold', color: theme.textPrimary }}>{item.user.name}</AppText>
                        <AppText variant="caption" style={{ color: theme.textTertiary }}>{item.lastMessage ? timeAgo(item.lastMessage.createdAt) : ""}</AppText>
                      </View>
                      <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
                        <AppText numberOfLines={1} style={{ flex: 1, fontSize: 14, color: item.unreadCount > 0 ? theme.textPrimary : theme.textSecondary, fontFamily: item.unreadCount > 0 ? 'Outfit_600SemiBold' : 'Outfit_400Regular' }}>
                          {item.lastMessage?.content ?? "No messages yet"}
                        </AppText>
                        {item.unreadCount > 0 && (
                          <View style={{ marginLeft: 8, height: 24, minWidth: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.danger, paddingHorizontal: 8 }}>
                            <AppText style={{ fontSize: 12, fontFamily: 'Outfit_700Bold', color: '#FFFFFF' }}>{item.unreadCount}</AppText>
                          </View>
                        )}
                      </View>
                    </View>
                  </AppCard>
                </TouchableOpacity>
              )}
            />
          ) : (
            <EmptyMessages />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
