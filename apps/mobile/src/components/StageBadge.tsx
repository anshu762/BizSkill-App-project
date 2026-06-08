import { View } from "react-native";
import { AppText } from "./ui/AppText";
import type { BusinessStage } from "@bizskills/types";

const stageConfig: Record<BusinessStage, { label: string; bg: string; text: string }> = {
  IDEA: { label: "Idea", bg: "#F1F5F9", text: "#475569" },
  BUILDING: { label: "Building", bg: "#EFF6FF", text: "#2563EB" },
  LAUNCHED: { label: "Launched", bg: "#ECFDF5", text: "#059669" },
};

interface StageBadgeProps {
  stage: BusinessStage;
}

export function StageBadge({ stage }: StageBadgeProps) {
  const config = stageConfig[stage] || stageConfig.IDEA;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 999, backgroundColor: config.bg, paddingHorizontal: 12, paddingVertical: 4 }}>
      <AppText style={{ fontSize: 12, fontFamily: 'Outfit_600SemiBold', color: config.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>{config.label}</AppText>
    </View>
  );
}
