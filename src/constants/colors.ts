export const colors = {
  // Backgrounds
  background: '#000000',
  backgroundElevated: '#1C1C1E',
  backgroundSecondary: '#2C2C2E',
  backgroundGrouped: '#F2F2F7',

  // Surfaces
  surface: '#1C1C1E',
  surfaceLight: '#FFFFFF',

  // Text — dark backgrounds
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',

  // Text — light backgrounds (settings, forms)
  textOnLight: '#000000',
  textOnLightSecondary: '#8E8E93',

  // Accent — single colour, used sparingly
  accent: '#34C759',
  accentMuted: 'rgba(52, 199, 89, 0.15)',

  // Semantic
  error: '#FF453A',
  warning: '#FFD60A',
  info: '#007AFF',
  success: '#34C759',

  // Scorecard
  scoreEagle: '#007AFF',
  scoreBirdie: '#34C759',
  scorePar: '#8E8E93',
  scoreBogey: '#FF9500',
  scoreDouble: '#FF453A',
  scoreUnplayed: '#48484A',

  // Tee colours (kept — these are real-world golf tee colours)
  teeWhite: '#FFFFFF',
  teeYellow: '#F4D03F',
  teeRed: '#E74C3C',
  teeBlue: '#2E86C1',
  teeBlack: '#1C2833',
  teeGreen: '#27AE60',
  teeGold: '#F39C12',
  teeMedal: '#F4D03F',

  // Premium
  premiumGold: '#FFD700',
  premiumOverlay: 'rgba(0, 0, 0, 0.6)',

  // Tab bar
  tabActive: '#FFFFFF',
  tabInactive: '#48484A',
  tabBackground: '#000000',

  // Borders / Separators
  separator: 'rgba(84, 84, 88, 0.36)',
  separatorLight: 'rgba(60, 60, 67, 0.12)',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayMedium: 'rgba(0, 0, 0, 0.4)',
  durationBadgeBg: 'rgba(0, 0, 0, 0.7)',

  // Video
  videoPlayerBg: '#000000',

  // Skeleton
  skeletonBase: '#2C2C2E',
  skeletonHighlight: '#3A3A3C',

  // Settings (light mode)
  settingsBackground: '#F2F2F7',

  // Card shadow (for light-bg contexts)
  cardShadow: 'rgba(0, 0, 0, 0.08)',
} as const;

export type ColorKey = keyof typeof colors;
