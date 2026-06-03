import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUnreadMessageCount } from "../../src/lib/apiHooks";

const icons = {
  index: "home-outline",
  marketplace: "compass-outline",
  teams: "people-outline",
  messages: "chatbubble-ellipses-outline",
  profile: "person-outline",
} as const;

function MessagesIcon({ color, size }: { color: string; size: number }) {
  const { data: unread } = useUnreadMessageCount();
  return (
    <View>
      <Ionicons name={icons.messages} size={size} color={color} />
      {(unread ?? 0) > 0 && (
        <View className="absolute -right-2 -top-1 h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5">
          <Text className="text-xs font-bold text-white">{unread}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === "ios" ? 8 : 4);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#5B4DFF",
        tabBarInactiveTintColor: "#98A2B3",
        tabBarStyle: {
          height: 60 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          borderTopColor: "#EAECF0",
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 4, minHeight: 48 },
        tabBarIcon: ({ color, size }) =>
          route.name === "messages" ? (
            <MessagesIcon color={color} size={size} />
          ) : (
            <Ionicons name={icons[route.name as keyof typeof icons]} size={size} color={color} />
          ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="marketplace" options={{ title: "Explore" }} />
      <Tabs.Screen name="teams" options={{ title: "Teams" }} />
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

