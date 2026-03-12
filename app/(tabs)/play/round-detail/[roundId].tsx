import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRounds } from '@/hooks/useRounds';
import { formatToPar, getScoreColor } from '@/lib/golf';
import { ScorecardTable } from '@/components/ScorecardTable';
import { EmptyState } from '@/components/EmptyState';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

export default function RoundDetailScreen() {
  const router = useRouter();
  const { roundId } = useLocalSearchParams<{ roundId: string }>();
  const { rounds, isLoading } = useRounds();

  const round = useMemo(
    () => rounds.find((r) => r.id === roundId) ?? null,
    [rounds, roundId],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  if (!round) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Round Detail" onBack={() => router.back()} />
        <EmptyState
          icon="golf"
          title="Round not found"
          subtitle="This round may have been deleted"
        />
      </SafeAreaView>
    );
  }

  const dateStr = round.completedAt
    ? new Date(round.completedAt).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date(round.startedAt).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  const toParColor = getScoreColor(round.toPar);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title={round.courseName} onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Course info */}
        <View style={styles.infoCard}>
          <Text style={styles.clubName}>{round.clubName}</Text>
          <Text style={styles.teeInfo}>
            {round.teeColor} tees · {round.holeCount} holes · Par{' '}
            {round.coursePar}
          </Text>
          {round.rating != null || round.slope != null ? (
            <Text style={styles.ratingInfo}>
              {round.rating != null ? `Rating ${round.rating.toFixed(1)}` : ''}
              {round.rating != null && round.slope != null ? ' · ' : ''}
              {round.slope != null ? `Slope ${round.slope}` : ''}
            </Text>
          ) : null}
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        {/* Score summary */}
        <View style={styles.scoreSummary}>
          <View style={styles.scoreMain}>
            <Text style={styles.totalScore}>{round.totalScore}</Text>
            <Text style={[styles.toParBig, { color: toParColor }]}>
              {formatToPar(round.toPar)}
            </Text>
          </View>
          <View style={styles.scoreDetails}>
            <ScoreStat
              label="Holes Played"
              value={`${round.through}/${round.holeCount}`}
            />
            <ScoreStat label="Course Par" value={String(round.coursePar)} />
          </View>
        </View>

        {/* Scorecard table */}
        <View style={styles.scorecardSection}>
          <Text style={styles.sectionTitle}>Scorecard</Text>
          <ScorecardTable holes={round.holes} holeCount={round.holeCount} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={colors.textPrimary}
        />
      </Pressable>
      <Text style={styles.headerTitle} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function ScoreStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.scoreStat}>
      <Text style={styles.scoreStatValue}>{value}</Text>
      <Text style={styles.scoreStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  infoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  clubName: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  teeInfo: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ratingInfo: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  scoreSummary: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreMain: {
    alignItems: 'center',
    paddingRight: spacing.xl,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
    minWidth: 80,
  },
  totalScore: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  toParBig: {
    ...typography.h3,
    fontWeight: '700',
  },
  scoreDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: spacing.lg,
  },
  scoreStat: {
    alignItems: 'center',
  },
  scoreStatValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  scoreStatLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  scorecardSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
});
