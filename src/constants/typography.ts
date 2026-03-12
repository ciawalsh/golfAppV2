import { Platform, TextStyle } from 'react-native';

export const fontFamilies = {
  heading: Platform.select({
    ios: 'Futura-Bold',
    android: 'NunitoSans-Bold',
    default: 'NunitoSans-Bold',
  }),
  bodyLight: 'NunitoSans-Light',
  bodyRegular: 'NunitoSans-Regular',
  bodySemiBold: 'NunitoSans-SemiBold',
  bodyBold: 'NunitoSans-Bold',
  bodyExtraBold: 'NunitoSans-ExtraBold',
} as const;

export const typography = {
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  } as TextStyle,

  h2: {
    fontFamily: fontFamilies.heading,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  } as TextStyle,

  h3: {
    fontFamily: fontFamilies.heading,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  } as TextStyle,

  body: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
  } as TextStyle,

  bodySmall: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  } as TextStyle,

  caption: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
  } as TextStyle,

  button: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
  } as TextStyle,

  tabLabel: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
  } as TextStyle,
} as const;
