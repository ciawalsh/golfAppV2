import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { useGolfTees } from '@/hooks/useGolfTees';
import { useRoundStore } from '@/stores/roundStore';
import { useAuthStore } from '@/stores/authStore';
import { GolfTee, HoleScore, Round } from '@/types/golf';
import { TeeCard } from '@/components/TeeCard';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

/** Generate a v4-style UUID using Math.random (sufficient for local round IDs). */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function SelectTeeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    clubId: string;
    courseId: string;
    courseName: string;
    clubName: string;
  }>();

  const { tees, isLoading, error, refetch } = useGolfTees(
    params.courseId ?? '',
  );
  const user = useAuthStore((s) => s.user);
  const setSelectedTee = useRoundStore((s) => s.setSelectedTee);
  const startRound = useRoundStore((s) => s.startRound);
  const resetSetup = useRoundStore((s) => s.resetSetup);

  const [selectedTee, setLocalSelectedTee] = useState<GolfTee | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleTeePress = useCallback(
    (tee: GolfTee) => {
      setLocalSelectedTee(tee);
      setSelectedTee(tee);
    },
    [setSelectedTee],
  );

  const handleStartRound = useCallback(async () => {
    if (!selectedTee || !user || isStarting) return;

    setIsStarting(true);

    try {
      const roundId = generateId();
      const holes: HoleScore[] = selectedTee.holes.map((h) => ({
        holeNumber: h.holeNumber,
        par: h.par,
        yardage: h.yardage,
        strokeIndex: h.strokeIndex,
        score: null,
        putts: null,
      }));

      const holeCount: 9 | 18 = selectedTee.holes.length <= 9 ? 9 : 18;
      const coursePar = selectedTee.holes.reduce((sum, h) => sum + h.par, 0);

      const round: Round = {
        id: roundId,
        userId: user.uid,
        clubId: params.clubId ?? '',
        courseId: params.courseId ?? '',
        courseName: params.courseName ?? '',
        clubName: params.clubName ?? '',
        teeColor: selectedTee.teeColor,
        teeName: selectedTee.teeName,
        holeCount,
        coursePar,
        rating: selectedTee.rating,
        slope: selectedTee.slope,
        totalScore: 0,
        toPar: 0,
        through: 0,
        inProgress: true,
        startedAt: Date.now(),
        completedAt: 0,
        holes,
        shots: [],
      };

      // Write to Firestore
      const roundRef = doc(db, COLLECTIONS.USERS, user.uid, 'rounds', roundId);
      await setDoc(roundRef, round);

      // Update local store
      startRound(round);
      resetSetup();

      // Navigate to active scorecard
      router.replace(`/play/round/${roundId}`);
    } catch {
      Alert.alert('Error', 'Failed to start round. Please try again.');
    } finally {
      setIsStarting(false);
    }
  }, [selectedTee, user, isStarting, params, startRound, resetSetup, router]);

  const renderItem = useCallback(
    ({ item }: { item: GolfTee }) => (
      <TeeCard
        tee={item}
        selected={
          selectedTee?.teeName === item.teeName &&
          selectedTee?.teeColor === item.teeColor
        }
        onPress={() => handleTeePress(item)}
      />
    ),
    [selectedTee, handleTeePress],
  );

  const keyExtractor = useCallback(
    (item: GolfTee, index: number) =>
      `${item.teeColor}-${item.teeName}-${index}`,
    [],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          courseName={params.courseName ?? 'Select Tee'}
          onBack={() => router.back()}
        />
        <LoadingIndicator />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          courseName={params.courseName ?? 'Select Tee'}
          onBack={() => router.back()}
        />
        <ErrorState message="Failed to load tees" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        courseName={params.courseName ?? 'Select Tee'}
        onBack={() => router.back()}
      />

      {tees.length === 0 ? (
        <EmptyState
          icon="golf-tee"
          title="No tee data available"
          subtitle="This course has no tee information"
        />
      ) : (
        <FlatList
          data={tees}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.startButton,
            (!selectedTee || isStarting) && styles.startButtonDisabled,
          ]}
          onPress={handleStartRound}
          disabled={!selectedTee || isStarting}
        >
          <Text style={styles.startButtonText}>
            {isStarting ? 'Starting...' : 'Start Round'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Header({
  courseName,
  onBack,
}: {
  courseName: string;
  onBack: () => void;
}) {
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
        {courseName}
      </Text>
      <View style={styles.headerSpacer} />
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
  listContent: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  startButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonDisabled: {
    opacity: 0.4,
  },
  startButtonText: {
    ...typography.button,
    color: colors.textLight,
    fontWeight: '700',
  },
});
