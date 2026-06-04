import React from 'react';
import Svg, { Rect, Path, Circle, G } from 'react-native-svg';
import { View, StyleSheet, Text as RNText } from 'react-native';
import { Colors, Fonts } from '../../constants/theme';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Variant = 'color' | 'white' | 'dark';

interface LogoProps {
  size?: Size;
  variant?: Variant;
}

const ICON_BASE = 48;
const ICON_SCALES: Record<Size, number> = {
  xs: 0.5,   
  sm: 0.667, 
  md: 0.833, 
  lg: 1,     
  xl: 1.5,   
};

export function BizSkillsIcon({ size = 'md', variant = 'color' }: LogoProps) {
  const scale = ICON_SCALES[size];
  const dim = ICON_BASE * scale;

  const bgFill =
    variant === 'color' ? Colors.brand :
    variant === 'white' ? 'rgba(255,255,255,0.18)' :
    'transparent';

  const markFill =
    variant === 'white' ? '#FFFFFF' :
    variant === 'dark'  ? Colors.inkPrimary :
    '#FFFFFF';

  const coinFill = variant === 'white' ? 'rgba(255,255,255,0.7)' : Colors.bizcoin;

  const bgRx = 13 * scale;

  return (
    <Svg
      width={dim}
      height={dim}
      viewBox="0 0 48 48"
      accessibilityLabel="BizSkills icon"
    >
      <Rect
        x={0} y={0}
        width={48} height={48}
        rx={bgRx / scale}
        fill={bgFill}
        stroke={variant === 'dark' ? Colors.border : 'none'}
        strokeWidth={variant === 'dark' ? 1.5 : 0}
      />
      <Rect
        x={10} y={9}
        width={5} height={30}
        rx={2.5}
        fill={markFill}
      />
      <Path
        d="M15 13 H23 A6.5 6.5 0 0 1 23 24 H15"
        stroke={markFill}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M15 24 H25 A6.5 6.5 0 0 1 25 35 H15"
        stroke={markFill}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={37} cy={11} r={5} fill={coinFill} />
    </Svg>
  );
}

export function BizSkillsWordmark({ size = 'md', variant = 'color' }: LogoProps) {
  const scale = ICON_SCALES[size];

  const bizColor =
    variant === 'white' ? '#FFFFFF' :
    variant === 'dark'  ? Colors.inkPrimary :
    Colors.inkPrimary;

  const skillsColor =
    variant === 'white' ? 'rgba(255,255,255,0.85)' :
    variant === 'dark'  ? Colors.inkPrimary :
    Colors.brand;

  const fontSize = Math.round(22 * scale);

  return (
    <View style={styles.wordmarkRow}>
      <RNText
        style={[
          styles.wordmarkBiz,
          { fontSize, color: bizColor },
        ]}
      >
        Biz
      </RNText>
      <RNText
        style={[
          styles.wordmarkSkills,
          { fontSize, color: skillsColor },
        ]}
      >
        Skills
      </RNText>
    </View>
  );
}

export function BizSkillsLogo({ size = 'md', variant = 'color' }: LogoProps) {
  const scale = ICON_SCALES[size];
  const gap = Math.round(12 * scale);

  return (
    <View style={[styles.logoRow, { gap }]}>
      <BizSkillsIcon size={size} variant={variant} />
      <BizSkillsWordmark size={size} variant={variant} />
    </View>
  );
}

export function BizSkillsAppIcon({ sizePx = 80 }: { sizePx?: number }) {
  const scale = sizePx / ICON_BASE;
  return (
    <Svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 48 48"
      accessibilityLabel="BizSkills"
    >
      <Rect x={0} y={0} width={48} height={48} rx={13} fill={Colors.brand} />
      <Rect x={10} y={9} width={5} height={30} rx={2.5} fill="white" />
      <Path
        d="M15 13 H23 A6.5 6.5 0 0 1 23 24 H15"
        stroke="white" strokeWidth={5} strokeLinecap="round" fill="none"
      />
      <Path
        d="M15 24 H25 A6.5 6.5 0 0 1 25 35 H15"
        stroke="white" strokeWidth={5} strokeLinecap="round" fill="none"
      />
      <Circle cx={37} cy={11} r={5} fill={Colors.bizcoin} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wordmarkBiz: {
    fontFamily: Fonts.bold,
    letterSpacing: -0.5,
  },
  wordmarkSkills: {
    fontFamily: Fonts.semibold,
    letterSpacing: -0.4,
  },
});
