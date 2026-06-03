import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { Colors } from '../../constants/theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: AvatarSize;
  showBorder?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 52,
  xl: 72,
};

export function Avatar({ uri, name, size = 'md', showBorder = false, style }: AvatarProps) {
  const containerSize = typeof size === 'number' ? size : (sizeMap[size as keyof typeof sizeMap] || 40);

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: containerSize,
    height: containerSize,
    borderRadius: containerSize / 2,
    overflow: 'hidden',
    ...(showBorder ? {
      borderWidth: 2,
      borderColor: '#FFFFFF',
    } : {}),
  };

  if (uri) {
    return (
      <View style={[containerStyle, style]}>
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <LinearGradient
        colors={[Colors.brand, Colors.brandLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <AppText
          style={{
            color: '#FFFFFF',
            fontSize: containerSize * 0.38,
            fontFamily: 'Outfit_600SemiBold', // Force font to bypass variants if needed
          }}
        >
          {name ? getInitials(name) : '?'}
        </AppText>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
