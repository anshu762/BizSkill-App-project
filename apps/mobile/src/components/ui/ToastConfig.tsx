/**
 * ToastConfig — uses react-native-toast-message's built-in BaseToast
 * so the library's internal auto-hide timer and animation work 100%
 * correctly on both web and native (Android/iOS).
 *
 * IMPORTANT: Never wrap the library's own component inside a custom
 * React component tree — that breaks the internal lifecycle hooks that
 * drive the auto-hide timer on native.
 */
import { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { Colors, Radius, Shadow } from '../../constants/theme';

const baseStyle = {
  borderRadius: Radius.lg,
  height: 'auto' as const,
  paddingVertical: 12,
  minHeight: 60,
  ...Shadow.md,
} as const;

const text1Style = {
  fontSize: 15,
  fontFamily: 'Outfit_600SemiBold',
  color: '#0F0E1A',
};

const text2Style = {
  fontSize: 13,
  fontFamily: 'Outfit_400Regular',
  color: '#6F6D78',
};

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ ...baseStyle, borderLeftColor: Colors.success }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={text1Style}
      text2Style={text2Style}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ ...baseStyle, borderLeftColor: Colors.danger }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={text1Style}
      text2Style={text2Style}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{ ...baseStyle, borderLeftColor: Colors.brand }}
      contentContainerStyle={{ paddingHorizontal: 16 }}
      text1Style={text1Style}
      text2Style={text2Style}
    />
  ),
};
