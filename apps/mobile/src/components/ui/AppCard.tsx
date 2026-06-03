import React from 'react';
import { View, Pressable, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Radius, Shadow } from '../../constants/theme';

interface AppCardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AppCard({ children, style, elevated = false, onPress, ...props }: AppCardProps) {
  const theme = useThemeColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const baseStyle: ViewStyle = {
    backgroundColor: elevated ? theme.elevated : theme.card,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: theme.border,
    ...(elevated ? Shadow.sm : {}),
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={() => {
          scale.value = withSpring(0.99, { damping: 15, stiffness: 300 });
          opacity.value = withTiming(0.85, { duration: 80 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 10, stiffness: 200 });
          opacity.value = withTiming(1, { duration: 150 });
        }}
        onPress={onPress}
        style={[baseStyle, animatedStyle, style as any]}
        {...(props as any)}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[baseStyle, style as any]} {...props}>
      {children}
    </View>
  );
}
