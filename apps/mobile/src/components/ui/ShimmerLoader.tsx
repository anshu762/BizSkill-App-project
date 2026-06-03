import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Radius } from '../../constants/theme';

interface ShimmerLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function ShimmerLoader({
  width = '100%',
  height = 20,
  borderRadius = Radius.md,
  style,
}: ShimmerLoaderProps) {
  const theme = useThemeColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(progress.value, [0, 1], [-400, 400]),
        },
      ],
    };
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: theme.isDark ? '#231F35' : '#F0EFF5',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle as any]}>
        <LinearGradient
          colors={
            theme.isDark
              ? ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']
              : ['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export const SkeletonProfileCard = () => (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
      <ShimmerLoader width={52} height={52} borderRadius={26} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <ShimmerLoader width="60%" height={20} style={{ marginBottom: 8 }} />
        <ShimmerLoader width="40%" height={16} />
      </View>
    </View>
    <ShimmerLoader width="100%" height={14} style={{ marginBottom: 6 }} />
    <ShimmerLoader width="80%" height={14} />
  </View>
);

export const SkeletonPostCard = () => (
  <View style={[styles.card, { padding: 0 }]}>
    <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
      <ShimmerLoader width={32} height={32} borderRadius={16} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <ShimmerLoader width="50%" height={16} />
      </View>
    </View>
    <ShimmerLoader width="100%" height={200} borderRadius={0} />
    <View style={{ padding: 16 }}>
      <ShimmerLoader width="90%" height={14} style={{ marginBottom: 6 }} />
      <ShimmerLoader width="60%" height={14} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <ShimmerLoader width={40} height={20} />
        <ShimmerLoader width={40} height={20} />
      </View>
    </View>
  </View>
);

export const SkeletonSkillChip = () => (
  <ShimmerLoader width={100} height={32} borderRadius={16} />
);

export const SkeletonTeamCard = () => (
  <View style={styles.card}>
    <ShimmerLoader width="70%" height={20} style={{ marginBottom: 12 }} />
    <ShimmerLoader width="100%" height={14} style={{ marginBottom: 6 }} />
    <ShimmerLoader width="90%" height={14} style={{ marginBottom: 16 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', gap: -8 }}>
        <ShimmerLoader width={28} height={28} borderRadius={14} />
        <ShimmerLoader width={28} height={28} borderRadius={14} />
      </View>
      <ShimmerLoader width={80} height={28} borderRadius={14} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(15,14,26,0.08)',
  },
});
