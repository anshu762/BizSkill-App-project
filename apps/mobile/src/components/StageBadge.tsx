import { Text, View } from "react-native";
import type { BusinessStage } from "@bizskills/types";

const stageConfig: Record<BusinessStage, { label: string; bg: string; text: string }> = {
  IDEA: { label: "Idea", bg: "bg-gray-100", text: "text-gray-700" },
  BUILDING: { label: "Building", bg: "bg-blue-50", text: "text-blue-700" },
  LAUNCHED: { label: "Launched", bg: "bg-green-50", text: "text-green-700" },
};

interface StageBadgeProps {
  stage: BusinessStage;
}

export function StageBadge({ stage }: StageBadgeProps) {
  const config = stageConfig[stage];
  return (
    <View className={`flex-row items-center rounded-full ${config.bg} px-3 py-1.5`}>
      <Text className={`text-xs font-semibold ${config.text}`}>{config.label}</Text>
    </View>
  );
}
