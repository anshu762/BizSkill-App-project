import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View, Text } from "react-native";
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
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#5B4DFF",
        tabBarInactiveTintColor: "#98A2B3",
        tabBarStyle: { height: 78, paddingTop: 10, paddingBottom: 18, borderTopColor: "#EAECF0" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
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

