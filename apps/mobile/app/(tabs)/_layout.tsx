import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const icons = {
  index: "home-outline",
  marketplace: "compass-outline",
  teams: "people-outline",
  messages: "chatbubble-ellipses-outline",
  profile: "person-outline",
} as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#5B4DFF",
        tabBarInactiveTintColor: "#98A2B3",
        tabBarStyle: { height: 78, paddingTop: 10, paddingBottom: 18, borderTopColor: "#EAECF0" },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarIcon: ({ color, size }) => (
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

