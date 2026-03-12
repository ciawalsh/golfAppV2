import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Round } from '@/types/golf';
import { formatToPar, getScoreColor } from '@/lib/golf';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface RoundCardProps {
  round: Round;
  onPress: () => void;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function RoundCard({ round, onPress }: RoundCardProps) {
  const scoreColor = getScoreColor(round.toPar);

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.courseName} numberOfLines={1}>
          {round.courseName}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {round.clubName} · {round.teeColor} tees
        </Text>
        <Text style={styles.date}>
          {formatDate(round.completedAt || round.startedAt)}
        </Text>
      </View>
      <View style={styles.right}>
        {round.inProgress ? (
          <View style={styles.inProgressBadge}>
            <Text style={styles.inProgressText}>In Progress</Text>
          </View>
        ) : (
          <>
            <Text style={styles.score}>{round.totalScore}</Text>
            <Text style={[styles.toPar, { color: scoreColor }]}>
              {formatToPar(round.toPar)}
            </Text>
            <Text style={styles.through}>
              {round.through}/{round.holeCount}
            </Text>
          </>
        )}
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.grey400}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  left: {
    flex: 1,
  },
  courseName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'center',
    minWidth: 48,
  },
  score: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  toPar: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  through: {
    ...typography.caption,
    color: colors.textMuted,
  },
  inProgressBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  inProgressText: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: '600',
  },
});
