import { useCallback, useMemo } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRoundStore } from '@/stores/roundStore';
import { useRoundSync } from '@/hooks/useRoundSync';
import { persistRound } from '@/services/roundApi';
import { formatToPar, getScoreColor } from '@/lib/golf';
import { HoleScoreInput } from '@/components/HoleScoreInput';
import { HoleIndicatorStrip } from '@/components/HoleIndicatorStrip';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';
import { Round } from '@/types/golf';

export default function ActiveRoundScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const activeRound = useRoundStore((s) => s.activeRound);
  const currentHoleIndex = useRoundStore((s) => s.currentHoleIndex);
  const setScore = useRoundStore((s) => s.setScore);
  const goToHole = useRoundStore((s) => s.goToHole);
  const nextHole = useRoundStore((s) => s.nextHole);
  const prevHole = useRoundStore((s) => s.prevHole);
  const completeRound = useRoundStore((s) => s.completeRound);

  // Debounced Firestore sync
  useRoundSync();

  const currentHole = activeRound?.holes[currentHoleIndex] ?? null;
  const holeCount = activeRound?.holes.length ?? 0;
  const isFirstHole = currentHoleIndex === 0;
  const isLastHole = currentHoleIndex === holeCount - 1;

  const runningTotal = useMemo(() => {
    if (!activeRound) return { through: 0, toPar: 0, totalScore: 0 };
    return {
      through: activeRound.through,
      toPar: activeRound.toPar,
      totalScore: activeRound.totalScore,
    };
  }, [activeRound]);

  const handleIncrement = useCallback(() => {
    if (!currentHole || !activeRound) return;
    const current = currentHole.score ?? currentHole.par;
    setScore(currentHoleIndex, current + 1);
  }, [currentHole, activeRound, currentHoleIndex, setScore]);

  const handleDecrement = useCallback(() => {
    if (!currentHole || !activeRound) return;
    const current = currentHole.score ?? currentHole.par;
    if (current > 1) {
      setScore(currentHoleIndex, current - 1);
    }
  }, [currentHole, activeRound, currentHoleIndex, setScore]);

  const handleEndRound = useCallback(() => {
    Alert.alert('End Round', 'Are you sure you want to finish this round?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Round',
        style: 'destructive',
        onPress: async () => {
          // completeRound() sets _syncCancelled: true, which prevents
          // useRoundSync's flush() from overwriting with stale inProgress data
          const completed = completeRound();
          if (!completed) return;

          try {
            // Authoritative write — this is the single source of truth
            await persistRound(completed);
          } catch {
            // Sync failure is not critical; round data is still in Firestore
            // from previous syncs
          }

          queryClient.setQueryData<Round[]>(
            ['rounds', completed.userId],
            (currentRounds) => {
              const existingRounds = currentRounds ?? [];
              return [
                completed,
                ...existingRounds.filter((round) => round.id !== completed.id),
              ];
            },
          );

          // Invalidate rounds query so Play Home refreshes
          void queryClient.invalidateQueries({
            queryKey: ['rounds', completed.userId],
          });

          Alert.alert(
            'Round Complete!',
            `You scored ${completed.totalScore} (${formatToPar(completed.toPar)}) at ${completed.courseName}`,
            [
              {
                text: 'Share Scorecard',
                onPress: () => {
                  router.replace({
                    pathname: '/play/round-detail/[roundId]',
                    params: {
                      roundId: completed.id,
                      share: 'true',
                    },
                  });
                },
              },
              {
                text: 'Skip',
                style: 'cancel',
                onPress: () => {
                  router.replace({
                    pathname: '/play/round-detail/[roundId]',
                    params: { roundId: completed.id },
                  });
                },
              },
            ],
            { cancelable: false },
          );
        },
      },
    ]);
  }, [completeRound, queryClient, router]);

  // Guard: no active round
  if (!activeRound || !currentHole) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noRound}>
          <Text style={styles.noRoundText}>No active round</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.replace('/play')}
          >
            <Text style={styles.backButtonText}>Back to Play</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const toParColor = getScoreColor(runningTotal.toPar);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.courseName} numberOfLines={1}>
          {activeRound.courseName}
        </Text>
        <View style={styles.topBarActions}>
          <Pressable
            onPress={() => router.push('/play/shot-tracker')}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={22}
              color={colors.secondary}
            />
          </Pressable>
          <Pressable onPress={handleEndRound} hitSlop={8}>
            <Text style={styles.endRoundText}>End Round</Text>
          </Pressable>
        </View>
      </View>

      {/* Score input — center of screen */}
      <View style={styles.scoreArea}>
        <HoleScoreInput
          hole={currentHole}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
      </View>

      {/* Running total bar */}
      {runningTotal.through > 0 ? (
        <View style={styles.runningTotal}>
          <Text style={styles.runningLabel}>
            Through {runningTotal.through}:
          </Text>
          <Text style={[styles.runningToPar, { color: toParColor }]}>
            {formatToPar(runningTotal.toPar)}
          </Text>
          <Text style={styles.runningScore}>({runningTotal.totalScore})</Text>
        </View>
      ) : null}

      {/* Navigation arrows */}
      <View style={styles.navRow}>
        <Pressable
          style={[styles.navButton, isFirstHole && styles.navButtonDisabled]}
          onPress={prevHole}
          disabled={isFirstHole}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={32}
            color={isFirstHole ? colors.grey300 : colors.textPrimary}
          />
        </Pressable>

        <Text style={styles.holeCounter}>
          {currentHoleIndex + 1} / {holeCount}
        </Text>

        <Pressable
          style={[styles.navButton, isLastHole && styles.navButtonDisabled]}
          onPress={nextHole}
          disabled={isLastHole}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={32}
            color={isLastHole ? colors.grey300 : colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* Hole indicator strip */}
      <HoleIndicatorStrip
        holes={activeRound.holes}
        currentIndex={currentHoleIndex}
        onHolePress={goToHole}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  courseName: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  endRoundText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '700',
  },
  scoreArea: {
    flex: 1,
    justifyContent: 'center',
  },
  runningTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  runningLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  runningToPar: {
    ...typography.body,
    fontWeight: '700',
  },
  runningScore: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: colors.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  holeCounter: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontWeight: '600',
  },
  noRound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  noRoundText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  backButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    ...typography.button,
    color: colors.textLight,
  },
});
