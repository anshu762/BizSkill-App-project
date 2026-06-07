import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Toast, { ToastConfig, ToastProps, BaseToastProps } from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

function BaseToast({ type, text1, text2, iconName, color }: { type: string, text1?: string, text2?: string, iconName: keyof typeof Ionicons.glyphMap, color: string }) {
  // Using fixed colors here to ensure contrast regardless of dark/light mode, but you can use useThemeColors if needed.
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => Toast.hide()} style={[styles.container, Shadow.md]}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={iconName} size={20} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <AppText variant="h3" style={styles.text1}>{text1}</AppText>
        {!!text2 && <AppText variant="body" style={styles.text2}>{text2}</AppText>}
      </View>
    </TouchableOpacity>
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
