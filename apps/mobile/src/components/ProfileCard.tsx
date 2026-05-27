import { Text, TouchableOpacity, View } from "react-native";
import type { Skill, User } from "@bizskills/types";
import { AvatarWithFallback } from "./AvatarWithFallback";
import { BizCoinBadge } from "./BizCoinBadge";

interface ProfileCardProps {
  user: Pick<User, "name" | "avatar" | "bizCoins"> & { businessProfile?: { businessName?: string | null; industry?: string | null } | null };
  topSkills?: Pick<Skill, "title" | "category">[];
  onPress?: () => void;
}

export function ProfileCard({ user, topSkills, onPress }: ProfileCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.86 : 1}
      onPress={onPress}
      className="rounded-3xl bg-white p-5"
    >
      <View className="flex-row items-center">
        <AvatarWithFallback uri={user.avatar} name={user.name} size={52} />
        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold text-ink">{user.name}</Text>
          <Text className="text-sm text-muted">{user.businessProfile?.businessName ?? "Founder"}</Text>
        </View>
        <BizCoinBadge amount={user.bizCoins} />
      </View>
      {topSkills && topSkills.length > 0 && (
        <View className="mt-3 flex-row flex-wrap">
          {topSkills.slice(0, 2).map((skill, i) => (
            <View key={i} className="mr-2 mt-2 rounded-full bg-indigo-50 px-3 py-1.5">
              <Text className="text-xs font-medium text-brand">{skill.title}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}
