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
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.brand} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 16 }}>
          <AppText variant="caption" style={{ color: Colors.brand, textTransform: 'uppercase', letterSpacing: 2 }}>Inbox</AppText>
          <AppText variant="h1" style={{ marginTop: 4, marginBottom: 24 }}>Messages</AppText>
          
          {conversations?.length > 0 ? (
            <FlatList
              data={conversations}
              keyExtractor={(item: any) => item.user.id}
              contentContainerStyle={{ paddingBottom: 100 }}
              renderItem={({ item }: any) => (
                <TouchableOpacity
                  onPress={() => router.push(`/messages/${item.user.id}` as any)}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: item.unreadCount > 0 ? '#EEF2FF' : 'transparent',
                    borderRadius: 20,
                    marginBottom: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Avatar uri={item.user?.avatar} name={item.user?.name ?? "U"} size={54} />
                    <View style={{ marginLeft: 16, flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                        <AppText style={{ fontFamily: 'Outfit_700Bold', color: theme.textPrimary, fontSize: 16, letterSpacing: -0.3 }}>
                          {item.user.name}
                        </AppText>
                        <AppText style={{ color: item.unreadCount > 0 ? Colors.brand : '#94A3B8', fontFamily: item.unreadCount > 0 ? 'Outfit_700Bold' : 'Outfit_500Medium', fontSize: 12 }}>
                          {item.lastMessage ? timeAgo(item.lastMessage.createdAt) : ""}
                        </AppText>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <AppText numberOfLines={1} style={{ flex: 1, fontSize: 14, color: item.unreadCount > 0 ? '#334155' : '#64748B', fontFamily: item.unreadCount > 0 ? 'Outfit_600SemiBold' : 'Outfit_400Regular' }}>
                          {item.lastMessage?.content ?? "No messages yet"}
                        </AppText>
                        {item.unreadCount > 0 && (
                          <View style={{ marginLeft: 12, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: Colors.brand, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
                            <AppText style={{ color: '#FFF', fontSize: 11, fontFamily: 'Outfit_700Bold' }}>{item.unreadCount > 99 ? '99+' : item.unreadCount}</AppText>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
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
