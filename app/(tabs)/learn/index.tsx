import { useCallback } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCoaches } from '@/hooks/useCoaches';
import { useTipVideos } from '@/hooks/useTipVideos';
import { useDormyVideos } from '@/hooks/useDormyVideos';
import { useSubscription } from '@/hooks/useSubscription';
import { isPremiumContent } from '@/lib/contentGating';
import { SectionHeader } from '@/components/SectionHeader';
import { CoachCard } from '@/components/CoachCard';
import { GenreCard } from '@/components/GenreCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { colors } from '@/constants/colors';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { Coach, VideoGenre } from '@/types';

export default function LearnScreen() {
  const router = useRouter();
  const { isFreeTier } = useSubscription();
  const {
    coaches,
    isLoading: coachesLoading,
    error: coachesError,
    refetch: refetchCoaches,
  } = useCoaches();
  const {
    genres: tipGenres,
    isLoading: tipsLoading,
    error: tipsError,
    refetch: refetchTips,
  } = useTipVideos();
  const {
    genres: dormyGenres,
    isLoading: dormyLoading,
    error: dormyError,
    refetch: refetchDormy,
  } = useDormyVideos();

  const coachesErrorMessage =
    coachesError instanceof Error && coachesError.message
      ? coachesError.message
      : 'Failed to load coaches';
  const tipsErrorMessage =
    tipsError instanceof Error && tipsError.message
      ? tipsError.message
      : 'Failed to load tips';
  const dormyErrorMessage =
    dormyError instanceof Error && dormyError.message
      ? dormyError.message
      : 'Failed to load content';

  const navigateToCoach = useCallback(
    (coach: Coach) => {
      router.push({
        pathname: '/(tabs)/learn/coach/[coachId]',
        params: { coachId: coach.id },
      });
    },
    [router],
  );

  const navigateToTips = useCallback(
    (genre: VideoGenre) => {
      router.push({
        pathname: '/(tabs)/learn/tips',
        params: { genre: genre.type },
      });
    },
    [router],
  );

  const navigateToDormy = useCallback(
    (genre: VideoGenre) => {
      router.push({
        pathname: '/(tabs)/learn/dormy',
        params: { genre: genre.type },
      });
    },
    [router],
  );

  const renderCoachSkeletons = () => (
    <View style={styles.skeletonRow}>
      {[1, 2].map((i) => (
        <SkeletonLoader
          key={i}
          width={SCREEN_WIDTH * 0.6}
          height={SCREEN_WIDTH * 0.6 * 0.7}
          radius={borderRadius.md}
        />
      ))}
    </View>
  );

  const renderGenreSkeletons = () => (
    <View style={styles.skeletonRow}>
      {[1, 2, 3].map((i) => (
        <SkeletonLoader
          key={i}
          width={SCREEN_WIDTH * 0.4}
          height={SCREEN_WIDTH * 0.4 * 0.75}
          radius={borderRadius.md}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Golf Pro Plans */}
        <SectionHeader title="Golf Pro Plans" />
        {coachesError ? (
          <ErrorState message={coachesErrorMessage} onRetry={refetchCoaches} />
        ) : coachesLoading ? (
          renderCoachSkeletons()
        ) : (
          <FlatList
            data={coaches}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <CoachCard coach={item} onPress={() => navigateToCoach(item)} />
            )}
          />
        )}

        {/* Section 2: Caddie Tips (Free) */}
        <SectionHeader title="Caddie Tips" />
        {tipsError ? (
          <ErrorState message={tipsErrorMessage} onRetry={refetchTips} />
        ) : tipsLoading ? (
          renderGenreSkeletons()
        ) : (
          <FlatList
            data={tipGenres}
            keyExtractor={(item) => item.type}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <GenreCard genre={item} onPress={() => navigateToTips(item)} />
            )}
          />
        )}

        {/* Section 3: The Dormy (Premium) */}
        <SectionHeader title="The Dormy" />
        {dormyError ? (
          <ErrorState message={dormyErrorMessage} onRetry={refetchDormy} />
        ) : dormyLoading ? (
          renderGenreSkeletons()
        ) : (
          <FlatList
            data={dormyGenres}
            keyExtractor={(item) => item.type}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <GenreCard
                genre={item}
                onPress={() => navigateToDormy(item)}
                locked={isFreeTier && isPremiumContent(4)}
              />
            )}
          />
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});
