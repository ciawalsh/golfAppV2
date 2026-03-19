import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { HeroCoachCard } from '@/components/HeroCoachCard';
import { PageDots } from '@/components/PageDots';
import { spacing, SCREEN_WIDTH, SCREEN_HEIGHT } from '@/constants/spacing';
import { Coach } from '@/types';

interface HeroCarouselProps {
  coaches: Coach[];
  onCoachPress: (coach: Coach) => void;
}

const HERO_HEIGHT = SCREEN_HEIGHT * 0.55;
const THRESHOLD = SCREEN_WIDTH * 0.15;

function HeroCard({
  coach,
  index,
  activeIndex,
  translateX,
  isDragging,
  isGesturing,
  isActiveCard,
  onPress,
}: {
  coach: Coach;
  index: number;
  activeIndex: SharedValue<number>;
  translateX: SharedValue<number>;
  isDragging: SharedValue<number>;
  isGesturing: SharedValue<number>;
  isActiveCard: boolean;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    // Hard-reject coaches more than 1 away
    if (Math.abs(index - activeIndex.value) > 1) {
      return { opacity: 0, transform: [{ translateX: 0 }, { scale: 1 }] };
    }

    const isActive = activeIndex.value === index;
    // Only show next/prev while finger is actively dragging — NOT during spring settle
    const dragging = isDragging.value > 0.5;
    const isNext =
      dragging && activeIndex.value === index - 1 && translateX.value < 0;
    const isPrev =
      dragging && activeIndex.value === index + 1 && translateX.value > 0;

    if (isActive) {
      // Settle phase — at rest immediately, no translateX-based positioning
      // (avoids discontinuity when card switches from isNext→isActive path)
      if (isDragging.value < 0.5) {
        return {
          opacity: 1,
          transform: [{ translateX: 0 }, { scale: 1 }],
        };
      }

      // Active drag phase — follow finger
      const leftProgress = interpolate(
        -translateX.value,
        [0, SCREEN_WIDTH],
        [0, 1],
        Extrapolation.CLAMP,
      );
      const rightProgress = interpolate(
        translateX.value,
        [0, SCREEN_WIDTH],
        [0, 1],
        Extrapolation.CLAMP,
      );
      const progress = Math.max(leftProgress, rightProgress);

      return {
        opacity: interpolate(
          progress,
          [0, 0.3, 0.7],
          [1, 0.5, 0],
          Extrapolation.CLAMP,
        ),
        transform: [
          { translateX: translateX.value * 0.1 },
          {
            scale: interpolate(
              progress,
              [0, 1],
              [1, 0.95],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    }

    if (isNext) {
      const progress = interpolate(
        -translateX.value,
        [0, SCREEN_WIDTH],
        [0, 1],
        Extrapolation.CLAMP,
      );
      return {
        opacity: interpolate(
          progress,
          [0, 0.3, 0.7],
          [0, 0.5, 1],
          Extrapolation.CLAMP,
        ),
        transform: [
          {
            translateX: interpolate(
              progress,
              [0, 1],
              [SCREEN_WIDTH * 0.1, 0],
              Extrapolation.CLAMP,
            ),
          },
          {
            scale: interpolate(
              progress,
              [0, 1],
              [0.95, 1],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    }

    if (isPrev) {
      const progress = interpolate(
        translateX.value,
        [0, SCREEN_WIDTH],
        [0, 1],
        Extrapolation.CLAMP,
      );
      return {
        opacity: interpolate(
          progress,
          [0, 0.3, 0.7],
          [0, 0.5, 1],
          Extrapolation.CLAMP,
        ),
        transform: [
          {
            translateX: interpolate(
              progress,
              [0, 1],
              [-SCREEN_WIDTH * 0.1, 0],
              Extrapolation.CLAMP,
            ),
          },
          {
            scale: interpolate(
              progress,
              [0, 1],
              [0.95, 1],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    }

    // Not involved in current transition
    return {
      opacity: activeIndex.value === index ? 1 : 0,
      transform: [{ translateX: 0 }, { scale: 1 }],
    };
  });

  return (
    <HeroCoachCard
      coach={coach}
      height={HERO_HEIGHT}
      onPress={onPress}
      style={animatedStyle}
      isGesturing={isGesturing}
      pointerEvents={isActiveCard ? 'auto' : 'none'}
    />
  );
}

export function HeroCarousel({ coaches, onCoachPress }: HeroCarouselProps) {
  const [dotsIndex, setDotsIndex] = useState(0);
  const activeIndex = useSharedValue(0);
  const translateX = useSharedValue(0);
  const isDragging = useSharedValue(0);
  const isGesturing = useSharedValue(0);

  const updateDotsIndex = useCallback((index: number) => {
    setDotsIndex(index);
  }, []);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onStart(() => {
      'worklet';
      isDragging.value = 1;
      isGesturing.value = withTiming(1, { duration: 100 });
    })
    .onUpdate((event) => {
      'worklet';
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      'worklet';
      const count = coaches.length;
      if (count === 0) return;

      // Kill dragging immediately — blocks isNext/isPrev during spring settle
      isDragging.value = 0;

      if (event.translationX < -THRESHOLD && activeIndex.value < count - 1) {
        activeIndex.value = activeIndex.value + 1;
        runOnJS(updateDotsIndex)(activeIndex.value);
      } else if (event.translationX > THRESHOLD && activeIndex.value > 0) {
        activeIndex.value = activeIndex.value - 1;
        runOnJS(updateDotsIndex)(activeIndex.value);
      }

      // Ease-in-out settle — gentle start, fast middle, soft landing
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
    })
    .onFinalize(() => {
      'worklet';
      isGesturing.value = withDelay(200, withTiming(0, { duration: 250 }));
    });

  return (
    <View>
      <GestureDetector gesture={panGesture}>
        <View style={styles.heroContainer}>
          {coaches.map((coach, i) => (
            <HeroCard
              key={coach.id}
              coach={coach}
              index={i}
              activeIndex={activeIndex}
              translateX={translateX}
              isDragging={isDragging}
              isGesturing={isGesturing}
              isActiveCard={i === dotsIndex}
              onPress={() => onCoachPress(coach)}
            />
          ))}
        </View>
      </GestureDetector>
      <View style={styles.dotsContainer}>
        <PageDots count={coaches.length} activeIndex={dotsIndex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  dotsContainer: {
    marginTop: spacing.lg,
  },
});
