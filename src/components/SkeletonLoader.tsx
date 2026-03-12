import { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { borderRadius } from '@/constants/spacing';

interface SkeletonLoaderProps {
  width: number | `${number}%`;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width,
  height,
  radius = borderRadius.sm,
  style,
}: SkeletonLoaderProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View
      style={[styles.container, { width, height, borderRadius: radius }, style]}
    >
      <Animated.View
        style={[styles.shimmer, { borderRadius: radius }, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.skeletonBase,
  },
  shimmer: {
    flex: 1,
    backgroundColor: colors.skeletonHighlight,
  },
});
