import { Text, View } from "react-native";

interface BizCoinBadgeProps {
  amount: number;
  size?: "sm" | "md";
}

export function BizCoinBadge({ amount, size = "md" }: BizCoinBadgeProps) {
  const isSmall = size === "sm";
  return (
    <View className={`flex-row items-center rounded-full bg-amber-50 ${isSmall ? "px-2 py-1" : "px-3 py-2"}`}>
      <Text className={`font-bold text-amber-700 ${isSmall ? "text-xs" : "text-sm"}`}>
        {amount} BC
      </Text>
    </View>
  );
}
