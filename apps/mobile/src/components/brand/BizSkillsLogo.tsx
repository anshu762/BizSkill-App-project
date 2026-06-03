import Svg, { Text, Rect } from 'react-native-svg';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'color' | 'white' | 'dark';
}

export function BizSkillsLogo({ size = 'md', variant = 'color' }: Props) {
  const scales = { sm: 0.6, md: 1, lg: 1.4 };
  const scale = scales[size];

  const iconColor = variant === 'white' ? '#FFFFFF' : '#5B4DFF';
  const textColor = variant === 'white' ? '#FFFFFF' : variant === 'dark' ? '#0F0E1A' : '#0F0E1A';

  return (
    <Svg width={180 * scale} height={40 * scale} viewBox="0 0 180 40">
      {/* Icon mark: rounded square */}
      <Rect x="0" y="4" width="32" height="32" rx="9" fill={iconColor} />
      {/* B mark inside */}
      <Text x="16" y="25" textAnchor="middle" fontSize="18" fontFamily="Outfit_700Bold" fill="#FFFFFF">B</Text>
      {/* Wordmark */}
      <Text x="44" y="28" fontSize="22" fontFamily="Outfit_700Bold" fill={textColor}>Biz</Text>
      <Text x="87" y="28" fontSize="22" fontFamily="Outfit_600SemiBold" fill={iconColor}>Skills</Text>
    </Svg>
  );
}
