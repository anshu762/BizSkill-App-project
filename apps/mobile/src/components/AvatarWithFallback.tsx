import { Text, View, Image } from "react-native";

interface AvatarWithFallbackProps {
  uri?: string | null;
  name: string;
  size?: number;
  className?: string;
}

export function AvatarWithFallback({ uri, name, size = 24, className }: AvatarWithFallbackProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size * 0.35 }}
        className={className}
      />
    );
  }

  return (
    <View
      style={{ width: size, height: size, borderRadius: size * 0.35 }}
      className={`items-center justify-center bg-brand ${className ?? ""}`}
    >
      <Text style={{ fontSize: size * 0.4 }} className="font-bold text-white">
        {initials}
      </Text>
    </View>
  );
}
