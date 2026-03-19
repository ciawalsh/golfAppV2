import { DimensionValue, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientOverlayProps {
  height?: string;
  colors?: readonly [string, string, ...string[]];
  style?: ViewStyle;
}

const DEFAULT_COLORS = ['transparent', 'rgba(0,0,0,0.85)'] as const;

export function GradientOverlay({
  height = '60%',
  colors: gradientColors,
  style,
}: GradientOverlayProps) {
  const topOffset = `${100 - parseFloat(height)}%` as DimensionValue;

  return (
    <LinearGradient
      colors={gradientColors ?? [...DEFAULT_COLORS]}
      style={[styles.gradient, { top: topOffset }, style]}
    />
  );
}

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
