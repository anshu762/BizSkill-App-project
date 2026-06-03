import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const theme = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {/* Subtle background circles */}
        <View style={[styles.circle, { width: 96, height: 96, opacity: 0.02 }]} />
        <View style={[styles.circle, { width: 72, height: 72, opacity: 0.04 }]} />
        <View style={[styles.circle, { width: 48, height: 48, opacity: 0.06 }]} />
        <Ionicons name={icon} size={56} color={theme.isDark ? '#4A4860' : '#C8C7D0'} style={styles.icon} />
      </View>

      <AppText variant="h3" style={[styles.title, { color: theme.textPrimary }]}>
        {title}
      </AppText>
      
      <AppText variant="body" style={[styles.subtitle, { color: theme.textTertiary }]}>
        {subtitle}
      </AppText>

      {actionLabel && onAction && (
        <View style={styles.actionContainer}>
          <AppButton variant="ghost" title={actionLabel} onPress={onAction} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 100,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.brand,
  },
  icon: {
    zIndex: 10,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 260,
  },
  actionContainer: {
    marginTop: 24,
  },
});

// Preset exports
export const EmptyMarketplace = (props: { onAction?: () => void }) => (
  <EmptyState
    icon="search-outline"
    title="No skills found"
    subtitle="Try adjusting your filters or search terms"
    actionLabel="Clear Filters"
    {...props}
  />
);

export const EmptyFeed = (props: { onAction?: () => void }) => (
  <EmptyState
    icon="newspaper-outline"
    title="Your feed is empty"
    subtitle="Follow other entrepreneurs or post your first update"
    actionLabel="Create Post"
    {...props}
  />
);

export const EmptyExchanges = (props: { onAction?: () => void }) => (
  <EmptyState
    icon="swap-horizontal-outline"
    title="No exchanges yet"
    subtitle="Browse the marketplace to find skills you need"
    actionLabel="Go to Marketplace"
    {...props}
  />
);

export const EmptyMessages = () => (
  <EmptyState
    icon="chatbubbles-outline"
    title="No conversations"
    subtitle="Message a fellow entrepreneur to get started"
  />
);

export const EmptyTeams = (props: { onAction?: () => void }) => (
  <EmptyState
    icon="people-outline"
    title="No teams found"
    subtitle="Create your own team or adjust your search"
    actionLabel="Create Team"
    {...props}
  />
);
