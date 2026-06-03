import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Fonts, Colors } from '../../constants/theme';

type Variant = 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'caption' | 'label';
type ColorType = 'primary' | 'secondary' | 'tertiary' | 'brand' | 'bizcoin';

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: ColorType;
  children: React.ReactNode;
}

export function AppText({ variant = 'body', color = 'primary', style, children, ...props }: AppTextProps) {
  const theme = useThemeColors();

  const getTextColor = () => {
    switch (color) {
      case 'primary': return theme.textPrimary;
      case 'secondary': return theme.textSecondary;
      case 'tertiary': return theme.textTertiary;
      case 'brand': return Colors.brand;
      case 'bizcoin': return Colors.bizcoin;
      default: return theme.textPrimary;
    }
  };

  return (
    <Text
      style={[
        styles[variant],
        { color: getTextColor() },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontFamily: Fonts.semibold,
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.semibold,
  },
  body: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  label: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
