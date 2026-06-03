import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { BizSkillsLogo } from './brand/BizSkillsLogo';
import { Colors } from '../constants/theme';

interface Props {
  onAnimationComplete: () => void;
}

export function AnimatedSplash({ onAnimationComplete }: Props) {
  const logoScale = React.useRef(new Animated.Value(0.8)).current;
  const logoOpacity = React.useRef(new Animated.Value(0)).current;
  const containerTranslateY = React.useRef(new Animated.Value(0)).current;
  const containerOpacity = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Hide the native splash screen immediately, as we're drawing our own over it
    SplashScreen.hideAsync().catch(() => {});

    // Animate logo in
    Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 150, useNativeDriver: true })
    ]).start();

    // Animate out after 1.5s
    const outDelay = 1500;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(containerTranslateY, { toValue: -20, duration: 300, useNativeDriver: true }),
        Animated.timing(containerOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => {
        onAnimationComplete();
      });
    }, outDelay);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity, transform: [{ translateY: containerTranslateY }] }]}>
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
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
