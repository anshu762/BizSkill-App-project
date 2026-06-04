import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Animated,
  Easing,
  View,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { BizSkillsIcon, BizSkillsWordmark } from './brand/BizSkillsLogo';
import { Colors } from '../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');

interface Props {
  onAnimationComplete: () => void;
}

export function AnimatedSplash({ onAnimationComplete }: Props) {
  const iconScale   = useRef(new Animated.Value(0.7)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;

  const textTranslateX = useRef(new Animated.Value(40)).current;
  const textOpacity    = useRef(new Animated.Value(0)).current;

  const taglineOpacity    = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(15)).current;

  const coinPulse = useRef(new Animated.Value(1)).current;

  const containerOpacity = useRef(new Animated.Value(1)).current;
  const containerScale   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});

    // Reset values for hot-reload (Fast Refresh)
    iconScale.setValue(0.5);
    iconOpacity.setValue(0);
    textTranslateX.setValue(40);
    textOpacity.setValue(0);
    taglineOpacity.setValue(0);
    taglineTranslateY.setValue(15);
    coinPulse.setValue(1);
    containerOpacity.setValue(1);
    containerScale.setValue(1);

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(coinPulse, {
          toValue: 1.25,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(coinPulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const main = Animated.sequence([
      // Stage 1 — Icon pops in (spring feel via overshoot)
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(100), // Tiny pause for dramatic effect

      // Stage 2 — Wordmark slides in from right
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
      ]),

      Animated.delay(150), // Another tiny pause

      // Stage 3 — Tagline fades up
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(taglineTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1500),
      Animated.parallel([
        Animated.timing(containerOpacity, {
          toValue: 0,
          duration: 340,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(containerScale, {
          toValue: 0.96,
          duration: 340,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]);

    pulseLoop.start();
    main.start(() => {
      pulseLoop.stop();
      onAnimationComplete();
    });

    return () => {
      pulseLoop.stop();
      main.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
          transform: [{ scale: containerScale }],
        },
      ]}
      pointerEvents="none"
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />
      <View style={styles.lockup}>
        <View style={styles.logoRow}>
          <Animated.View
            style={{
              opacity: iconOpacity,
              transform: [{ scale: iconScale }],
            }}
          >
            <BizSkillsIcon size="lg" variant="color" />
          </Animated.View>
          <Animated.View
            style={[
              styles.wordmarkWrap,
              {
                opacity: textOpacity,
                transform: [{ translateX: textTranslateX }],
              },
            ]}
          >
            <BizSkillsWordmark size="lg" variant="color" />
          </Animated.View>
        </View>
        <Animated.Text
          style={[
            styles.tagline,
            {
              opacity: taglineOpacity,
              transform: [{ translateY: taglineTranslateY }],
            },
          ]}
        >
          Trade skills. Build businesses.
        </Animated.Text>
      </View>
      <Animated.Text style={[styles.version, { opacity: taglineOpacity }]}>
        v1.0.0
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  lockup: {
    alignItems: 'center',
    gap: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  wordmarkWrap: {
    overflow: 'visible',
  },
  tagline: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    color: Colors.inkTertiary,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontFamily: 'Outfit_400Regular',
    fontSize: 12,
    color: Colors.inkDisabled,
    letterSpacing: 0.5,
  },
});
