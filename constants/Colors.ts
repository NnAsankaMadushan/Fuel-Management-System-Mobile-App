const palette = {
  canvas: '#fff4ec',
  canvasAlt: '#fff8f1',
  surface: 'rgba(255, 250, 246, 0.90)',
  surfaceStrong: 'rgba(255, 251, 247, 0.96)',
  surfaceMuted: 'rgba(255, 245, 236, 0.82)',
  surfaceDark: '#3d2011',
  surfaceDarkMuted: '#5a2f16',
  text: '#2f1b0f',
  textMuted: '#7c5b49',
  textOnDark: '#fff6f0',
  border: 'rgba(111, 58, 21, 0.12)',
  borderStrong: 'rgba(111, 58, 21, 0.18)',
  accent: '#f97316',
  accentStrong: '#c2410c',
  accentSoft: 'rgba(249, 115, 22, 0.12)',
  teal: '#fb923c',
  tealSoft: 'rgba(251, 146, 60, 0.14)',
  amber: '#f59e0b',
  amberSoft: 'rgba(245, 158, 11, 0.14)',
  danger: '#d14a31',
  dangerSoft: 'rgba(209, 74, 49, 0.12)',
  success: '#c2410c',
  successSoft: 'rgba(249, 115, 22, 0.12)',
  white: '#ffffff',
  overlay: 'rgba(37, 19, 10, 0.34)',
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
      shadowColor: '#612f12',
      shadowOffset: { width: 0, height: 18 },
      shadowOpacity: 0.16,
      shadowRadius: 30,
      elevation: 8,
    },
    md: {
      shadowColor: '#612f12',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 5,
    },
    sm: {
      shadowColor: '#612f12',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  },
  tabBar: {
    activeTintColor: palette.accentStrong,
    inactiveTintColor: '#8c6a58',
    backgroundColor: 'rgba(255, 251, 247, 0.98)',
    borderTopColor: 'rgba(111, 58, 21, 0.12)',
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
