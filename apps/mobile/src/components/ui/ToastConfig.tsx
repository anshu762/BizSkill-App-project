import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, PanResponder, Dimensions } from 'react-native';
import Toast, { ToastConfig, ToastProps, BaseToastProps } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const SCREEN_WIDTH = Dimensions.get('window').width;

function BaseToast({ type, text1, text2, iconName, color }: { type: string, text1?: string, text2?: string, iconName: keyof typeof Ionicons.glyphMap, color: string }) {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // Capture gesture if moving horizontally
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > SCREEN_WIDTH * 0.25) {
          // Swiped far enough to dismiss
          Animated.timing(pan, {
            toValue: { x: gestureState.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            Toast.hide();
            // Reset position slightly after hide for next toasts
            setTimeout(() => pan.setValue({ x: 0, y: 0 }), 300);
          });
        } else {
          // Snap back
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        width: '100%',
        alignItems: 'center',
        transform: [{ translateX: pan.x }],
      }}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={() => Toast.hide()} style={[styles.container, Shadow.md]}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={iconName} size={20} color="#FFFFFF" />
        </View>
        <View style={styles.textContainer}>
          <AppText variant="h3" style={styles.text1}>{text1}</AppText>
          {!!text2 && <AppText variant="body" style={styles.text2}>{text2}</AppText>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export const toastConfig: ToastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast type="success" text1={props.text1} text2={props.text2} iconName="checkmark-circle" color={Colors.success} />
  ),
  error: (props: BaseToastProps) => (
    <BaseToast type="error" text1={props.text1} text2={props.text2} iconName="alert-circle" color={Colors.danger} />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast type="info" text1={props.text1} text2={props.text2} iconName="information-circle" color={Colors.brand} />
  ),
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    backgroundColor: '#FFFFFF', // Keep white for toasts for standard contrast
    borderRadius: Radius.lg,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(15, 14, 26, 0.08)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    color: '#0F0E1A',
    fontSize: 15,
  },
  text2: {
    color: '#6F6D78',
    marginTop: 2,
  },
});
