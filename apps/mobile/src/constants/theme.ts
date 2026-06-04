export const Colors = {
  // ─── Brand ─────────────────────────────────────────────────────────────
  brand:      '#5B4DFF',
  brandLight: '#8B7FFF',
  brandTint:  '#EEEDFE',
  brandDark:  '#3C3489',
  brandXDark: '#26215C',

  // ─── BizCoin (amber/gold) ───────────────────────────────────────────────
  bizcoin:     '#F5B731',
  bizcoinTint: '#FEF9EC',
  bizcoinDark: '#92600A',

  // ─── Ink (text) ─────────────────────────────────────────────────────────
  inkPrimary:   '#0F0E1A',
  inkSecondary: '#4A4860',
  inkTertiary:  '#9896A4',
  inkDisabled:  '#C8C7D0',

  // ─── Surface (backgrounds) ──────────────────────────────────────────────
  surface:          '#FFFFFF',
  surfaceSecondary: '#F7F7F8',
  surfaceTertiary:  '#F0EFF5',

  // ─── Borders ────────────────────────────────────────────────────────────
  border:       'rgba(15,14,26,0.08)',
  borderStrong: 'rgba(15,14,26,0.16)',

  // ─── Semantic ───────────────────────────────────────────────────────────
  success:     '#22C55E',
  successTint: '#EAF3DE',
  successDark: '#27500A',

  danger:     '#EF4444',
  dangerTint: '#FEF2F2',
  dangerDark: '#991B1B',

  warning:     '#F59E0B',
  warningTint: '#FEF9EC',
  warningDark: '#92600A',

  info:     '#3B82F6',
  infoTint: '#E6F1FB',
  infoDark: '#0C447C',

  // ─── Dark mode surfaces ─────────────────────────────────────────────────
  darkBg:       '#0F0E1A',
  darkCard:     '#1A1826',
  darkElevated: '#231F35',
  darkBorder:   'rgba(255,255,255,0.08)',
  darkBorderStrong: 'rgba(255,255,255,0.16)',
} as const;

export const Fonts = {
  regular:  'Outfit_400Regular',
  medium:   'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold:     'Outfit_700Bold',
} as const;

export const Radius = {
  xs:   6,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  full: 9999,
} as const;

export const Shadow = {
  // Subtle brand-tinted shadow — more premium than gray shadows
  sm: {
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#5B4DFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const Spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20,
  6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
} as const;

// ─── Type helpers ────────────────────────────────────────────────────────────
export type ColorToken  = keyof typeof Colors;
export type FontToken   = keyof typeof Fonts;
export type RadiusToken = keyof typeof Radius;
export type ShadowToken = keyof typeof Shadow;
