import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { AppText } from './AppText';

export type BadgeType = 'stage' | 'skill-level' | 'post-type' | 'status';

interface BadgeProps {
  label: string;
  type: BadgeType;
  value?: string;
}

export function Badge({ label, type, value }: BadgeProps) {
  const getBadgeStyle = (): { bg: string; text: string } => {
    if (type === 'stage') {
      switch (value) {
        case 'IDEA': return { bg: '#F3F4F6', text: '#374151' };
        case 'BUILDING': return { bg: '#E6F1FB', text: '#0C447C' };
        case 'LAUNCHED': return { bg: '#EAF3DE', text: '#27500A' };
      }
    }
    if (type === 'skill-level') {
      switch (value) {
        case 'BEGINNER': return { bg: '#F0EFF5', text: '#4A4860' };
        case 'INTERMEDIATE': return { bg: '#EEEDFE', text: '#3C3489' };
        case 'EXPERT': return { bg: '#5B4DFF', text: '#FFFFFF' };
      }
    }
    if (type === 'post-type') {
      switch (value) {
        case 'UPDATE': return { bg: '#F0EFF5', text: '#4A4860' };
        case 'LAUNCH': return { bg: '#EEEDFE', text: '#3C3489' };
        case 'MILESTONE': return { bg: '#FEF9EC', text: '#92600A' };
        case 'PRODUCT_DROP': return { bg: '#EAF3DE', text: '#27500A' };
        case 'COLLAB_REQUEST': return { bg: '#E6F1FB', text: '#0C447C' };
      }
    }
    // Fallback
    return { bg: '#F0EFF5', text: '#4A4860' };
  };

  const style = getBadgeStyle();

  return (
    <View style={[styles.container, { backgroundColor: style.bg }]}>
      <AppText style={{ color: style.text, fontSize: 12, fontFamily: 'Outfit_500Medium' }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});
