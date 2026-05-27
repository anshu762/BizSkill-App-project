import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "../../src/components/PageHeader";

const messages = [
  { name: "Rhea Malik", message: "I can share the first logo concepts tonight.", time: "2m", unread: true },
  { name: "Launch Lab", message: "Strategy sprint starts on Friday.", time: "1h", unread: true },
  { name: "Dev Arora", message: "Exchange marked complete. Great work!", time: "Yesterday", unread: false },
];

export default function MessagesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-8">
        <PageHeader eyebrow="Inbox" title="Messages" />
        {messages.map((message) => (
          <View key={message.name} className="mb-3 flex-row items-center rounded-3xl bg-white p-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <Text className="text-lg font-bold text-brand">{message.name[0]}</Text>
            </View>
            <View className="ml-4 flex-1">
              <View className="flex-row justify-between">
                <Text className="font-semibold text-ink">{message.name}</Text>
                <Text className="text-xs text-muted">{message.time}</Text>
              </View>
              <Text numberOfLines={1} className="mt-1 text-sm text-muted">{message.message}</Text>
            </View>
            {message.unread ? <View className="ml-3 h-2.5 w-2.5 rounded-full bg-brand" /> : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

