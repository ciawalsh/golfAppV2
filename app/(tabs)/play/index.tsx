import { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoundStore } from '@/stores/roundStore';
import { useRounds } from '@/hooks/useRounds';
import { useDeleteRound } from '@/hooks/useRoundMutations';
import { formatToPar } from '@/lib/golf';
import { SwipeableRoundCard } from '@/components/SwipeableRoundCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

export default function PlayScreen() {
  const router = useRouter();
  const activeRound = useRoundStore((s) => s.activeRound);
  const { rounds, isLoading, error, refetch } = useRounds();
  const deleteRoundMutation = useDeleteRound();

  const completedRounds = useMemo(
    () => rounds.filter((r) => !r.inProgress),
    [rounds],
  );

  const recentRounds = useMemo(
    () => completedRounds.slice(0, 5),
    [completedRounds],
  );

  const confirmDeleteRound = (roundId: string) => {
    Alert.alert('Delete Round', 'Delete this round from your history?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteRoundMutation.mutate(roundId, {
            onError: () => {
              Alert.alert('Error', 'Failed to delete round. Please try again.');
            },
          });
        },
      },
    ]);
  };

  const stats = useMemo(() => {
    if (completedRounds.length === 0) return null;

    const played = completedRounds.length;
    const scores = completedRounds
      .filter((r) => r.totalScore > 0)
      .map((r) => r.totalScore);

    const best = scores.length > 0 ? Math.min(...scores) : null;
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : null;

    return { played, best, avg };
  }, [completedRounds]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message="Failed to load rounds" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Play</Text>

        {activeRound?.inProgress ? (
          <Pressable
            style={styles.resumeCard}
            onPress={() => router.push(`/play/round/${activeRound.id}`)}
          >
            <View style={styles.resumeLeft}>
              <MaterialCommunityIcons
                name="golf-tee"
                size={24}
                color={colors.secondary}
              />
              <View style={styles.resumeInfo}>
                <Text style={styles.resumeLabel}>Round in Progress</Text>
                <Text style={styles.resumeCourseName} numberOfLines={1}>
                  {activeRound.courseName}
                </Text>
                <Text style={styles.resumeMeta}>
                  Through {activeRound.through} ·{' '}
                  {formatToPar(activeRound.toPar)}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={colors.secondary}
            />
          </Pressable>
        ) : (
          <Pressable
            style={styles.startButton}
            onPress={() => router.push('/play/select-course')}
          >
            <MaterialCommunityIcons
              name="plus-circle"
              size={24}
              color={colors.textLight}
            />
            <Text style={styles.startButtonText}>Start New Round</Text>
          </Pressable>
        )}

        {stats != null ? (
          <View style={styles.statsRow}>
            <StatBox label="Rounds" value={String(stats.played)} />
            <StatBox
              label="Best"
              value={stats.best != null ? String(stats.best) : '-'}
            />
            <StatBox
              label="Average"
              value={stats.avg != null ? String(stats.avg) : '-'}
            />
          </View>
        ) : null}

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Rounds</Text>
          {recentRounds.length === 0 ? (
            <EmptyState
              icon="golf"
              title="No rounds yet"
              subtitle="Start your first round to track your scores"
            />
          ) : (
            <View style={styles.roundsList}>
              {recentRounds.map((round) => (
                <SwipeableRoundCard
                  key={round.id}
                  round={round}
                  onPress={() => router.push(`/play/round-detail/${round.id}`)}
                  onDelete={() => confirmDeleteRound(round.id)}
                  isDeleting={
                    deleteRoundMutation.isPending &&
                    deleteRoundMutation.variables === round.id
                  }
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    marginBottom: spacing.xl,
  },
  resumeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  resumeInfo: {
    flex: 1,
  },
  resumeLabel: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resumeCourseName: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  resumeMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  startButtonText: {
    ...typography.button,
    color: colors.textLight,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  recentSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  roundsList: {
    gap: spacing.sm,
  },
});
