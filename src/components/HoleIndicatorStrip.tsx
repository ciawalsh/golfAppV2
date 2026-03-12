import { View, Pressable, Text, StyleSheet } from 'react-native';
import { HoleScore } from '@/types/golf';
import { getScoreColor } from '@/lib/golf';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface HoleIndicatorStripProps {
  holes: HoleScore[];
  currentIndex: number;
  onHolePress: (index: number) => void;
}

export function HoleIndicatorStrip({
  holes,
  currentIndex,
  onHolePress,
}: HoleIndicatorStripProps) {
  return (
    <View style={styles.container}>
      {holes.map((hole, index) => {
        const isCurrent = index === currentIndex;
        const toPar = hole.score != null ? hole.score - hole.par : null;
        const dotColor =
          hole.score != null ? getScoreColor(toPar) : colors.scoreUnplayed;

        return (
          <Pressable
            key={hole.holeNumber}
            style={[
              styles.dot,
              { backgroundColor: dotColor },
              isCurrent && styles.currentDot,
            ]}
            onPress={() => onHolePress(index)}
            hitSlop={4}
          >
            <Text
              style={[
                styles.dotText,
                isCurrent && styles.currentDotText,
                hole.score != null && styles.scoredDotText,
              ]}
            >
              {hole.holeNumber}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    flexWrap: 'wrap',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentDot: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dotText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  currentDotText: {
    fontWeight: '700',
  },
  scoredDotText: {
    color: colors.textLight,
  },
});
