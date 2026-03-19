import { TextStyle } from 'react-native';

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
  } as TextStyle,

  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  } as TextStyle,

  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  } as TextStyle,

  title3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  } as TextStyle,

  headline: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  } as TextStyle,

  body: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  } as TextStyle,

  callout: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  } as TextStyle,

  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  } as TextStyle,

  caption2: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  } as TextStyle,

  // Keep a button style for consistency
  button: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  } as TextStyle,

  tabLabel: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  } as TextStyle,
} as const;
