export const colors = {
  // Brand
  primary: '#1e2c3a',
  secondary: '#82d54c',
  tertiary: '#ffc96b',

  // Backgrounds
  background: '#F9F9F9',
  surface: '#FFFFFF',
  darkBackground: '#2A3E51',

  // Semantic
  success: '#5AC20F',
  error: '#FF4C6A',
  warning: '#ffc96b',
  info: '#4A90D9',

  // Text
  textPrimary: '#1e2c3a',
  textSecondary: '#6B7C93',
  textLight: '#FFFFFF',
  textMuted: '#9EAAB8',

  // Greys
  grey50: '#F9F9F9',
  grey100: '#F0F2F5',
  grey200: '#E1E5EA',
  grey300: '#C8CED6',
  grey400: '#9EAAB8',
  grey500: '#6B7C93',
  grey600: '#4A5568',
  grey700: '#2D3748',
  grey800: '#1A202C',

  // Tab Bar
  tabActive: '#82d54c',
  tabInactive: '#9EAAB8',
  tabBackground: '#FFFFFF',

  // Borders
  border: '#E1E5EA',
  borderLight: '#F0F2F5',

  // Social Auth
  appleButton: '#000000',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayMedium: 'rgba(0, 0, 0, 0.4)',
  videoPlayOverlay: 'rgba(0, 0, 0, 0.2)',
  videoPlayOverlayAlt: 'rgba(0, 0, 0, 0.25)',
  durationBadgeBg: 'rgba(0, 0, 0, 0.7)',

  // Premium / Content
  premiumGold: '#FFD700',
  premiumOverlay: 'rgba(0, 0, 0, 0.6)',
  videoPlayerBg: '#000000',
  cardShadow: 'rgba(0, 0, 0, 0.08)',

  // Skeleton
  skeletonBase: '#E1E5EA',
  skeletonHighlight: '#F0F2F5',

  // Scorecard
  scoreEagle: '#1A5276',
  scoreBirdie: '#2E86C1',
  scorePar: '#27AE60',
  scoreBogey: '#E67E22',
  scoreDouble: '#E74C3C',
  scoreUnplayed: '#D5DBDB',

  // Tee colors
  teeWhite: '#FFFFFF',
  teeYellow: '#F4D03F',
  teeRed: '#E74C3C',
  teeBlue: '#2E86C1',
  teeBlack: '#1C2833',
  teeGreen: '#27AE60',
  teeGold: '#F39C12',
  teeMedal: '#F4D03F',

  // Settings
  settingsBackground: '#F2F2F7',
} as const;

export type ColorKey = keyof typeof colors;
