/**
 * GlobalToast — Modal-based toast overlay.
 *
 * WHY MODAL:
 * react-native-screens (used by Expo Router) can freeze the JS Animated timer
 * for components inside the navigation tree, causing toasts to get "stuck".
 * A React Native `Modal` renders in a separate native window layer, completely
 * outside the navigation tree, so timers always fire as expected on Android/iOS.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore } from '../../stores/useToastStore';
import { Toast } from '../../lib/toast';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { AppText } from './AppText';

const ICON_MAP = {
  success: { name: 'checkmark-circle' as const, color: Colors.success },
  error:   { name: 'alert-circle' as const,     color: Colors.danger },
  info:    { name: 'information-circle' as const, color: Colors.brand },
};

export function GlobalToast() {
  const { visible, type, text1, text2 } = useToastStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(opacity,     { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY,  { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(opacity,     { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY,  { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, opacity, translateY]);

  const icon = ICON_MAP[type] ?? ICON_MAP.info;

  // Keep modal always mounted so animations work; only show content when visible
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"       // We handle animation ourselves via Animated
      statusBarTranslucent       // Render above status bar on Android
      onRequestClose={() => Toast.hide()}
    >
      {/* Full-screen invisible hit area to dismiss on tap */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => Toast.hide()}
      >
        <Animated.View
          style={[
            styles.wrapper,
            { opacity, transform: [{ translateY }] },
          ]}
          // Prevent the invisible area tap from bubbling to toast body
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.container, Shadow.md]}
            onPress={() => Toast.hide()}
          >
            <View style={[styles.iconBox, { backgroundColor: icon.color }]}>
              <Ionicons name={icon.name} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.textBox}>
              <AppText variant="h3" style={styles.text1} numberOfLines={2}>{text1}</AppText>
              {!!text2 && (
                <AppText variant="body" style={styles.text2} numberOfLines={2}>{text2}</AppText>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: 'transparent',
  },
  wrapper: {
    width: '90%',
    maxWidth: 480,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(15, 14, 26, 0.08)',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBox: {
    flex: 1,
  },
  text1: {
    color: '#0F0E1A',
    fontSize: 15,
  },
  text2: {
    color: '#6F6D78',
    marginTop: 2,
    fontSize: 13,
  },
});
