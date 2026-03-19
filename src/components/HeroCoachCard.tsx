import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { FallbackImage } from '@/components/FallbackImage';
import { GradientOverlay } from '@/components/GradientOverlay';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH } from '@/constants/spacing';
import { Coach } from '@/types';

interface HeroCoachCardProps {
  coach: Coach;
  height: number;
  onPress: () => void;
  style?: object;
  isGesturing?: SharedValue<number>;
  pointerEvents?: 'auto' | 'none';
}

export const HeroCoachCard = React.memo(function HeroCoachCard({
  coach,
  height,
  onPress,
  style,
  isGesturing,
  pointerEvents = 'auto',
}: HeroCoachCardProps) {
  const credentialLine = coach.shortBio;

  const textStyle = useAnimatedStyle(() => ({
    opacity: isGesturing ? interpolate(isGesturing.value, [0, 1], [1, 0]) : 1,
  }));

  return (
    <Animated.View
      style={[styles.card, { height, width: SCREEN_WIDTH }, style]}
      pointerEvents={pointerEvents}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress}>
        <FallbackImage
          uri={coach.image}
          style={styles.image}
          resizeMode="cover"
          fallbackIcon="account"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.2)', 'transparent']}
          locations={[0, 0.4, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.leftEdgeFade}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
          locations={[0, 0.6, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.rightEdgeFade}
        />
        <GradientOverlay
          height="60%"
          colors={[
            'transparent',
            'rgba(0,0,0,0.4)',
            'rgba(0,0,0,0.85)',
            'rgba(0,0,0,1.0)',
          ]}
        />
        <Animated.View style={[styles.info, textStyle]}>
          <Text style={styles.name} numberOfLines={1}>
            {coach.name}
          </Text>
          {credentialLine ? (
            <Text style={styles.credential} numberOfLines={1}>
              {credentialLine}
            </Text>
          ) : null}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  leftEdgeFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.35,
  },
  rightEdgeFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.35,
  },
  info: {
    position: 'absolute',
    bottom: '15%',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  name: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  credential: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
