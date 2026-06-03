import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Colors } from '../../constants/theme';
import type { SkillCategory, SkillLevel } from '@bizskills/types';

interface SkillChipProps {
  category: SkillCategory | string;
  label: string;
  level?: SkillLevel | string;
  showLevel?: boolean;
  style?: ViewStyle;
}

const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  GRAPHIC_DESIGN: 'color-palette-outline',
  SOCIAL_MEDIA: 'share-social-outline',
  PHOTOGRAPHY: 'camera-outline',
  WEBSITE: 'globe-outline',
  MARKETING: 'megaphone-outline',
  BRANDING: 'sparkles-outline',
  FINANCE: 'bar-chart-outline',
  PITCH_DECK: 'easel-outline',
  CONTENT: 'create-outline',
  OTHER: 'ellipsis-horizontal-outline',
};

export function SkillChip({ category, label, level, showLevel = false, style }: SkillChipProps) {
  const theme = useThemeColors();
  const iconName = categoryIcons[category] || 'ellipsis-horizontal-outline';

  return (
    <View style={[styles.container, { backgroundColor: theme.elevated, borderColor: theme.border }, style]}>
      <Ionicons name={iconName} size={14} color={theme.textSecondary} style={{ marginRight: 6 }} />
      <AppText variant="caption" style={{ color: theme.textPrimary, fontFamily: 'Outfit_500Medium' }}>
        {label}
      </AppText>
      {showLevel && level && (
        <View style={styles.levelBadge}>
          <AppText style={{ fontSize: 10, color: Colors.brand, fontFamily: 'Outfit_600SemiBold' }}>
            {level.charAt(0)}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    alignSelf: 'flex-start',
  },
  levelBadge: {
    marginLeft: 6,
    backgroundColor: Colors.brandTint,
    borderRadius: 10,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
