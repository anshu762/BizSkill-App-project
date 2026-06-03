import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';
import { BizSkillsLogo } from './brand/BizSkillsLogo';
import { Colors } from '../constants/theme';

interface Props {
  onAnimationComplete: () => void;
}

export function AnimatedSplash({ onAnimationComplete }: Props) {
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Hide the native splash screen immediately, as we're drawing our own over it
    SplashScreen.hideAsync().catch(() => {});

    // Animate logo in
    logoOpacity.value = withTiming(1, { duration: 400 });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 150 });

    // Animate out after 1.5s
    const outDelay = 1500;
    containerTranslateY.value = withDelay(
      outDelay,
      withTiming(-20, { duration: 300 })
    );
    containerOpacity.value = withDelay(
      outDelay,
      withTiming(0, { duration: 300 }, () => {
        runOnJS(onAnimationComplete)();
      })
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Animated.View style={logoStyle}>
        <BizSkillsLogo size="lg" variant="white" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it covers everything
  },
});
