import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AvatarWithFallback } from "../../src/components/AvatarWithFallback";
import { useMarkMessagesRead, useMessages, useProfile, useSendMessage } from "../../src/lib/apiHooks";
import { useAuthStore } from "../../src/store/useAuthStore";

export default function MessageThreadScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const myId = useAuthStore((s) => s.user?.id);

  const { data: messages, isLoading } = useMessages(userId);
  const { data: otherUser } = useProfile(userId);
  const sendMessage = useSendMessage();
  const markRead = useMarkMessagesRead();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (userId) markRead.mutate(userId);
  }, [userId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput("");
    await sendMessage.mutateAsync({ userId: userId!, content: text });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#5B4DFF" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white">
            <Ionicons name="arrow-back" size={20} color="#101828" />
          </TouchableOpacity>
          <AvatarWithFallback uri={otherUser?.avatar} name={otherUser?.name?.[0] ?? "?"} size={36} />
          <Text className="ml-3 text-lg font-semibold text-ink">{otherUser?.name ?? "User"}</Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages ?? []}
          keyExtractor={(item: any) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="px-4 pb-4"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item: msg }: any) => {
            const isMine = msg.senderId === myId;
            return (
              <View className={`mb-3 ${isMine ? "items-end" : "items-start"}`}>
                <View
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMine ? "bg-brand" : "bg-white"}`}
                >
                  <Text className={`text-base ${isMine ? "text-white" : "text-ink"}`}>{msg.content}</Text>
                  <Text className={`mt-1 text-xs ${isMine ? "text-indigo-200" : "text-muted"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="mt-20 items-center">
              <Text className="text-muted">No messages yet. Say hello!</Text>
            </View>
          }
        />

        <View className="flex-row items-center border-t border-slate-200 bg-white px-4 py-3">
          <TextInput
            placeholder="Type a message..."
            placeholderTextColor="#98A2B3"
            className="mr-3 flex-1 h-12 rounded-2xl bg-surface px-4 text-base text-ink"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className="h-12 w-12 items-center justify-center rounded-full bg-brand"
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
