import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

export function useThemeColors() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    isDark,
    bg: isDark ? Colors.darkBg : Colors.surface,
    card: isDark ? Colors.darkCard : Colors.surface,
    elevated: isDark ? Colors.darkElevated : Colors.surfaceSecondary,
    border: isDark ? Colors.darkBorder : Colors.border,
    textPrimary: isDark ? '#F5F4FF' : Colors.inkPrimary,
    textSecondary: isDark ? '#9896A4' : Colors.inkSecondary,
    textTertiary: isDark ? '#4A4860' : Colors.inkTertiary,
  };
}
