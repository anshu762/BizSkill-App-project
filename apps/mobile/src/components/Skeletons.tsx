import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

function Shimmer({ className }: { className?: string }) {
  const opacity = useRef(new Animated.Value(0.3));

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity.current, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={{ opacity: opacity.current }}
      className={`rounded-2xl bg-gray-200 ${className ?? ""}`}
    />
  );
}

export function PostCardSkeleton() {
  return (
    <View className="mb-4 rounded-3xl bg-white p-5">
      <View className="flex-row items-center">
        <Shimmer className="h-10 w-10 rounded-full" />
        <View className="ml-3 flex-1">
          <Shimmer className="mb-2 h-4 w-32" />
          <Shimmer className="h-3 w-20" />
        </View>
      </View>
      <Shimmer className="mb-3 mt-4 h-4 w-full" />
      <Shimmer className="mb-2 h-4 w-3/4" />
      <Shimmer className="h-40 w-full rounded-2xl" />
    </View>
  );
}

export function TeamCardSkeleton() {
  return (
    <View className="mb-4 rounded-3xl bg-white p-5">
      <View className="flex-row items-center">
        <Shimmer className="h-14 w-14 rounded-2xl" />
        <View className="ml-4 flex-1">
          <Shimmer className="mb-2 h-5 w-36" />
          <Shimmer className="h-3 w-24" />
        </View>
      </View>
      <View className="mt-4 flex-row">
        <Shimmer className="mr-2 h-6 w-16 rounded-full" />
        <Shimmer className="h-6 w-20 rounded-full" />
      </View>
      <Shimmer className="mt-3 h-4 w-full" />
    </View>
  );
}

export function ProfileCardSkeleton() {
  return (
    <View className="mb-6 items-center">
      <Shimmer className="mb-4 h-24 w-24 rounded-full" />
      <Shimmer className="mb-2 h-6 w-40" />
      <Shimmer className="mb-4 h-4 w-28" />
      <View className="w-full flex-row justify-between rounded-3xl bg-white p-5">
        {[1, 2, 3, 4].map((i) => (
          <View key={i} className="items-center">
            <Shimmer className="mb-1 h-6 w-10" />
            <Shimmer className="h-3 w-14" />
          </View>
        ))}
      </View>
    </View>
  );
}
