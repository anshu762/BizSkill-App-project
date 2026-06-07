import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export const MAX_CONTENT_WIDTH = 768;

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const theme = useThemeColors();

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webWrapper, { backgroundColor: theme.elevated }]}>
        <View style={[styles.webContainer, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          {children}
        </View>
      </View>
    );
  }

  return <View style={{ flex: 1, backgroundColor: theme.bg }}>{children}</View>;
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  webContainer: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    flex: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
    // Using relative position so absolute positioned elements inside are constrained
    position: 'relative',
  },
});
