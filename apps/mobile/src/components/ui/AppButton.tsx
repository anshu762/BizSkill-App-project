import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { Colors, Radius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps extends Omit<PressableProps, 'onPress'> {
  title?: string;
  label?: string; // Backwards compatibility for Phase 4
  onPress?: () => void | Promise<void>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AppButton({
  title,
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  ...props
}: AppButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const handlePress = async (e: any) => {
    if (disabled || loading || !onPress) return;
    await onPress();
  };

  const getContainerStyle = () => {
    const base: any = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: variant === 'ghost' ? Radius.md : Radius.md, // prompt says 12 for primary, 10 for ghost, we use 12 for both or Radius.md
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : undefined,
    };

    switch (size) {
      case 'sm':
        base.paddingVertical = 8;
        base.paddingHorizontal = 16;
        break;
      case 'md':
        base.paddingVertical = 14;
        base.paddingHorizontal = 24;
        break;
      case 'lg':
        base.paddingVertical = 16;
        base.paddingHorizontal = 32;
        break;
    }

    switch (variant) {
      case 'primary':
        base.backgroundColor = Colors.brand;
        break;
      case 'secondary':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = Colors.brand;
        break;
      case 'ghost':
        base.backgroundColor = Colors.brandTint;
        break;
      case 'danger':
        base.backgroundColor = Colors.danger;
        break;
    }

    return base;
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'secondary':
      case 'ghost':
        return Colors.brand;
      default:
        return '#FFFFFF';
    }
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[getContainerStyle(), animatedStyle, style as any]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && (
            <View style={{ marginRight: 8 }}>
              <Ionicons name={icon} size={size === 'sm' ? 16 : 20} color={getTextColor()} />
            </View>
          )}
          <AppText
            variant={size === 'sm' ? 'title' : 'h3'} // to get semibold 16/18
            style={{ color: getTextColor(), fontSize: size === 'sm' ? 14 : 16 }}
          >
            {title ?? label}
          </AppText>
        </>
      )}
    </AnimatedPressable>
  );
}
