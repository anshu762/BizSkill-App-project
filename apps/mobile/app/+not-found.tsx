import { Link } from "expo-router";
import { Text, View } from "react-native";
import { AppButton } from "../src/components/AppButton";

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-8">
      <Text className="text-5xl font-bold text-brand">404</Text>
      <Text className="mt-4 text-center text-xl font-semibold text-ink">This page is not in the network.</Text>
      <Text className="mt-2 text-center text-muted">Head back and discover another skill exchange.</Text>
      <Link href="/" asChild>
        <AppButton label="Back to BizSkills" className="mt-8 w-full" />
      </Link>
    </View>
  );
}

