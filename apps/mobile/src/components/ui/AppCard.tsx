import React from 'react';
import { View, Pressable, ViewProps, StyleSheet, ViewStyle, Animated } from 'react-native';
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
  const scale = React.useRef(new Animated.Value(1)).current;
  const opacity = React.useRef(new Animated.Value(1)).current;

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
          Animated.spring(scale, { toValue: 0.99, friction: 5, tension: 150, useNativeDriver: true }).start();
          Animated.timing(opacity, { toValue: 0.85, duration: 80, useNativeDriver: true }).start();
        }}
        onPressOut={() => {
          Animated.spring(scale, { toValue: 1, friction: 5, tension: 150, useNativeDriver: true }).start();
          Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
        }}
        onPress={onPress}
        style={[baseStyle, { transform: [{ scale }], opacity }, style as any]}
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
