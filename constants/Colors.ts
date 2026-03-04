const palette = {
  canvas: '#f8f4ee',
  canvasAlt: '#f1f5f6',
  surface: 'rgba(255, 255, 255, 0.88)',
  surfaceStrong: 'rgba(255, 255, 255, 0.96)',
  surfaceMuted: '#f6efe5',
  surfaceDark: '#1b2a36',
  surfaceDarkMuted: '#273847',
  text: '#18212f',
  textMuted: '#5b6875',
  textOnDark: '#f8fafc',
  border: 'rgba(24, 33, 47, 0.10)',
  borderStrong: 'rgba(24, 33, 47, 0.18)',
  accent: '#f97316',
  accentStrong: '#dd5b11',
  accentSoft: '#fff0dd',
  teal: '#0d9488',
  tealSoft: '#dff7f4',
  danger: '#dc4c3f',
  dangerSoft: 'rgba(220, 76, 63, 0.12)',
  success: '#1d8b5f',
  successSoft: 'rgba(29, 139, 95, 0.12)',
  white: '#ffffff',
  overlay: 'rgba(15, 23, 42, 0.34)',
};

export const AppTheme = {
  colors: palette,
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  shadow: {
    lg: {
      shadowColor: '#152232',
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.12,
      shadowRadius: 42,
      elevation: 8,
    },
    md: {
      shadowColor: '#152232',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 26,
      elevation: 5,
    },
    sm: {
      shadowColor: '#152232',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 18,
      elevation: 3,
    },
  },
  tabBar: {
    activeTintColor: palette.accent,
    inactiveTintColor: '#7b8794',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopColor: 'rgba(24, 33, 47, 0.08)',
  },
};

export const RoleAccents = {
  vehicle_owner: palette.accent,
  station_owner: palette.teal,
  station_operator: palette.accentStrong,
  admin: palette.surfaceDark,
};

export const Colors = {
  light: {
    text: palette.text,
    background: palette.canvas,
    tint: palette.accent,
    icon: palette.textMuted,
    tabIconDefault: AppTheme.tabBar.inactiveTintColor,
    tabIconSelected: AppTheme.tabBar.activeTintColor,
  },
  dark: {
    text: palette.textOnDark,
    background: palette.surfaceDark,
    tint: palette.white,
    icon: '#c6d0d8',
    tabIconDefault: '#9ba7b4',
    tabIconSelected: palette.white,
  },
};
