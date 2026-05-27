import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
}

export function PageHeader({ eyebrow, title }: PageHeaderProps) {
  return (
    <View className="mb-7 mt-3 flex-row items-center justify-between">
      <View>
        {eyebrow ? <Text className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand">{eyebrow}</Text> : null}
        <Text className="text-3xl font-bold tracking-tight text-ink">{title}</Text>
      </View>
      <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-2xl bg-white">
        <Ionicons name="notifications-outline" size={22} color="#101828" />
      </TouchableOpacity>
    </View>
  );
}

