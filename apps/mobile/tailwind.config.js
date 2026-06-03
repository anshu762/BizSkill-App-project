/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5B4DFF',
          light: '#8B7FFF',
          tint: '#EEEDFE',
          dark: '#3C3489',
          xdark: '#26215C',
        },
        bizcoin: {
          DEFAULT: '#F5B731',
          tint: '#FEF9EC',
          dark: '#92600A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F7F7F8',
          tertiary: '#F0EFF5',
        },
        ink: {
          primary: '#0F0E1A',
          secondary: '#4A4860',
          tertiary: '#9896A4',
          disabled: '#C8C7D0',
        },
        border: {
          DEFAULT: 'rgba(15,14,26,0.08)',
          strong: 'rgba(15,14,26,0.16)',
        },
        stage: {
          idea: { bg: '#F3F4F6', text: '#374151' },
          building: { bg: '#E6F1FB', text: '#0C447C' },
          launched: { bg: '#EAF3DE', text: '#27500A' },
        },
        status: {
          success: '#22C55E',
          danger: '#EF4444',
          warning: '#F59E0B',
        },
        dark: {
          bg: '#0F0E1A',
          card: '#1A1826',
          elevated: '#231F35',
          border: 'rgba(255,255,255,0.08)',
        },
      },
      fontFamily: {
        outfit: ['Outfit_400Regular'],
        'outfit-medium': ['Outfit_500Medium'],
        'outfit-semibold': ['Outfit_600SemiBold'],
        'outfit-bold': ['Outfit_700Bold'],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        full: '9999px',
      },
      spacing: {
        px: '1px',
        0.5: '2px',
        1: '4px',
        1.5: '6px',
        2: '8px',
        2.5: '10px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
      },
    },
  },
  plugins: [],
};
