import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SkillCategory, SkillLevel } from "@bizskills/types";
import { BizCoinBadge } from "./BizCoinBadge";

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  GRAPHIC_DESIGN: "color-palette-outline",
  SOCIAL_MEDIA: "globe-outline",
  PHOTOGRAPHY: "camera-outline",
  WEBSITE: "code-slash-outline",
  MARKETING: "megaphone-outline",
  BRANDING: "diamond-outline",
  FINANCE: "trending-up-outline",
  PITCH_DECK: "document-text-outline",
  CONTENT: "create-outline",
  OTHER: "apps-outline",
};

const levelColors: Record<SkillLevel, string> = {
  BEGINNER: "bg-emerald-50 text-emerald-700",
  INTERMEDIATE: "bg-amber-50 text-amber-700",
  EXPERT: "bg-brand/10 text-brand",
};

interface SkillChipProps {
  title: string;
  category: SkillCategory;
  level: SkillLevel;
  coinValue: number;
}

export function SkillChip({ title, category, level, coinValue }: SkillChipProps) {
  return (
    <View className="mr-3 w-44 rounded-2xl border border-slate-100 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="rounded-full bg-indigo-50 p-2">
          <Ionicons name={categoryIcons[category] ?? "apps-outline"} size={18} color="#5B4DFF" />
        </View>
        <BizCoinBadge amount={coinValue} size="sm" />
      </View>
      <Text className="mt-3 text-base font-semibold text-ink" numberOfLines={1}>{title}</Text>
      <View className={`mt-2 self-start rounded-full px-2.5 py-0.5 ${levelColors[level].split(' ')[0]}`}>
        <Text className={`text-[10px] font-bold uppercase tracking-wider ${levelColors[level].split(' ')[1]}`}>{level}</Text>
      </View>
    </View>
  );
}
