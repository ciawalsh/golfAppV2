import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HoleScore } from '@/types/golf';
import { getScoreColor } from '@/lib/golf';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface HoleScoreInputProps {
  hole: HoleScore;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function HoleScoreInput({
  hole,
  onIncrement,
  onDecrement,
}: HoleScoreInputProps) {
  const displayScore = hole.score ?? hole.par;
  const toPar = hole.score != null ? hole.score - hole.par : null;
  const scoreColor = getScoreColor(toPar);
  const canDecrement = displayScore > 1;

  return (
    <View style={styles.container}>
      <Text style={styles.holeLabel}>Hole {hole.holeNumber}</Text>
      <Text style={styles.holeMeta}>
        Par {hole.par} · {hole.yardage} yds · SI {hole.strokeIndex}
      </Text>

      <View style={styles.scoreRow}>
        <Pressable
          style={[styles.button, !canDecrement && styles.buttonDisabled]}
          onPress={onDecrement}
          disabled={!canDecrement}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="minus"
            size={32}
            color={canDecrement ? colors.textPrimary : colors.textTertiary}
          />
        </Pressable>

        <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
          <Text
            style={[
              styles.scoreText,
              { color: hole.score != null ? scoreColor : colors.textSecondary },
            ]}
          >
            {displayScore}
          </Text>
          {toPar != null && toPar !== 0 ? (
            <Text style={[styles.toParLabel, { color: scoreColor }]}>
              {toPar > 0 ? `+${toPar}` : toPar}
            </Text>
          ) : null}
        </View>

        <Pressable style={styles.button} onPress={onIncrement} hitSlop={8}>
          <MaterialCommunityIcons
            name="plus"
            size={32}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  holeLabel: {
    ...typography.title1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  holeMeta: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.xxl,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: '700',
  },
  toParLabel: {
    ...typography.caption1,
    fontWeight: '700',
    marginTop: -4,
  },
});
