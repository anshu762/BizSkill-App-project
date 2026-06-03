import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { useWallet } from "../src/lib/apiHooks";
import { useAuthStore } from "../src/store/useAuthStore";

const typeConfig: Record<string, { icon: string; color: string }> = {
  EXCHANGE_REWARD: { icon: "swap-horizontal-outline", color: "#059669" },
  COIN_DEDUCT: { icon: "arrow-down-outline", color: "#DC2626" },
  BONUS: { icon: "gift-outline", color: "#5B4DFF" },
};

export default function WalletScreen() {
  const user = useAuthStore((state) => state.user);
  const { data: wallet, isLoading } = useWallet();

  const transactions = wallet?.transactions ?? [];

  return (
    <ErrorBoundary>
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-6">
          <Text className="mb-6 mt-4 text-2xl font-bold text-ink">Wallet</Text>
          <View className="mb-6 items-center rounded-[28px] bg-brand p-8">
            <Text className="text-sm font-medium text-indigo-100">YOUR BALANCE</Text>
            <View className="mt-3 flex-row items-center">
              <Text className="text-5xl font-bold text-white">{wallet?.balance ?? user?.bizCoins ?? 0}</Text>
              <Text className="ml-2 mt-2 text-lg text-indigo-100">BC</Text>
            </View>
            <View className="mt-6 w-full rounded-2xl bg-indigo-500/30 p-4">
              <Text className="text-center text-sm leading-5 text-indigo-100">
                Complete exchanges to earn! Each completed swap gives both parties +10 BizCoins.
              </Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <View className="px-6">
            <View className="mb-4 h-6 w-44 rounded bg-gray-200" />
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} className="mb-3 flex-row items-center rounded-3xl bg-white p-4">
                <View className="h-10 w-10 rounded-full bg-gray-200" />
                <View className="ml-4 flex-1">
                  <View className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                  <View className="h-3 w-1/4 rounded bg-gray-200" />
                </View>
                <View className="h-5 w-16 rounded bg-gray-200" />
              </View>
            ))}
          </View>
        ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-8"
          ListHeaderComponent={<Text className="mb-4 text-lg font-bold text-ink">Transaction History</Text>}
          ListEmptyComponent={
            <View className="mt-16 items-center px-4">
              <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-amber-50">
                <Ionicons name="wallet-outline" size={36} color="#F59E0B" />
              </View>
              <Text className="mt-5 text-xl font-bold text-ink">No transactions yet</Text>
              <Text className="mt-2 text-center text-sm leading-5 text-muted">Complete an exchange to earn BizCoins. Each completed swap gives both parties +10 BC.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const config = typeConfig[item.type] ?? { icon: "ellipse-outline", color: "#98A2B3" };
            const isCredit = item.toUserId === user?.id;
            return (
              <View className="mb-3 flex-row items-center rounded-3xl bg-white p-4">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
                  <Ionicons name={config.icon as any} size={18} color={config.color} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="font-semibold text-ink">{item.description}</Text>
                  <Text className="text-xs text-muted">{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text className={`text-base font-bold ${isCredit ? "text-green-600" : "text-red-500"}`}>
                  {isCredit ? "+" : "-"}{item.amount} BC
                </Text>
              </View>
            );
          }}
        />
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}
