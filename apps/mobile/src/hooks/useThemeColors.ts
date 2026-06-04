import { Colors } from '../constants/theme';

// App is light-mode only. We force isDark = false so the APK never
// follows the Android system dark theme and always looks as designed.
export function useThemeColors() {
  const isDark = false;
  return {
    isDark,
    bg: Colors.surface,
    card: Colors.surface,
    elevated: Colors.surfaceSecondary,
    border: Colors.border,
    textPrimary: Colors.inkPrimary,
    textSecondary: Colors.inkSecondary,
    textTertiary: Colors.inkTertiary,
  };
}
