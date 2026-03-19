import { useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCoaches } from '@/hooks/useCoaches';
import { useAllCourses, CourseWithImage } from '@/hooks/useAllCourses';
import { useTipVideos } from '@/hooks/useTipVideos';
import { useDormyVideos } from '@/hooks/useDormyVideos';
import { useSubscription } from '@/hooks/useSubscription';
import { isPremiumContent } from '@/lib/contentGating';
import { HeroCarousel } from '@/components/learn/HeroCarousel';
import { CoachAvatarRow } from '@/components/learn/CoachAvatarRow';
import { CourseRow } from '@/components/learn/CourseRow';
import { TipRow } from '@/components/learn/TipRow';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { colors } from '@/constants/colors';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { Coach, VideoGenre } from '@/types';

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFreeTier } = useSubscription();
  const {
    coaches,
    isLoading: coachesLoading,
    error: coachesError,
    refetch: refetchCoaches,
  } = useCoaches();
  const {
    courses: allCourses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useAllCourses();
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

  const navigateToCoach = useCallback(
    (coach: Coach) => {
      router.push({
        pathname: '/(tabs)/learn/coach/[coachId]',
        params: { coachId: coach.id },
      });
    },
    [router],
  );

  const navigateToCourse = useCallback(
    (course: CourseWithImage) => {
      router.push({
        pathname: '/(tabs)/learn/course/[courseId]',
        params: {
          courseId: course.id,
          coachId: course.coachId,
          coachName: course.coachName,
        },
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

  const coachesErrorMessage =
    coachesError instanceof Error
      ? coachesError.message
      : 'Failed to load coaches';

  if (coachesError) {
    return (
      <View style={styles.container}>
        <View style={{ paddingTop: insets.top }}>
          <ErrorState message={coachesErrorMessage} onRetry={refetchCoaches} />
        </View>
      </View>
    );
  }

  if (coachesLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.skeletonRow, { paddingTop: insets.top }]}>
          {[1, 2].map((i) => (
            <SkeletonLoader
              key={i}
              width={SCREEN_WIDTH * 0.6}
              height={SCREEN_WIDTH * 0.6 * 0.7}
              radius={borderRadius.md}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroCarousel coaches={coaches} onCoachPress={navigateToCoach} />

        <View style={{ marginTop: spacing.xxl }}>
          <CoachAvatarRow coaches={coaches} onCoachPress={navigateToCoach} />
        </View>

        <View style={{ marginTop: spacing.xxl }}>
          {coursesLoading ? (
            <View style={styles.skeletonRow}>
              <SkeletonLoader
                width={SCREEN_WIDTH * 0.7}
                height={SCREEN_WIDTH * 0.7 * 1.2}
                radius={borderRadius.lg}
              />
            </View>
          ) : coursesError ? (
            <ErrorState message="Failed to load courses" onRetry={() => {}} />
          ) : (
            <CourseRow
              courses={allCourses}
              isFreeTier={isFreeTier}
              onCoursePress={navigateToCourse}
            />
          )}
        </View>

        <View style={{ marginTop: spacing.xl }}>
          {tipsLoading ? (
            <View style={styles.skeletonRow}>
              <SkeletonLoader
                width={SCREEN_WIDTH * 0.35}
                height={SCREEN_WIDTH * 0.35}
                radius={borderRadius.md}
              />
              <SkeletonLoader
                width={SCREEN_WIDTH * 0.35}
                height={SCREEN_WIDTH * 0.35}
                radius={borderRadius.md}
              />
            </View>
          ) : tipsError ? (
            <ErrorState message="Failed to load tips" onRetry={refetchTips} />
          ) : (
            <TipRow
              title="Free Tips"
              genres={tipGenres}
              onSeeAll={() =>
                router.push({
                  pathname: '/(tabs)/learn/tips',
                  params: { genre: 'all' },
                })
              }
              onGenrePress={navigateToTips}
            />
          )}
        </View>

        <View style={{ marginTop: spacing.xl }}>
          {dormyLoading ? (
            <View style={styles.skeletonRow}>
              <SkeletonLoader
                width={SCREEN_WIDTH * 0.35}
                height={SCREEN_WIDTH * 0.35}
                radius={borderRadius.md}
              />
              <SkeletonLoader
                width={SCREEN_WIDTH * 0.35}
                height={SCREEN_WIDTH * 0.35}
                radius={borderRadius.md}
              />
            </View>
          ) : dormyError ? (
            <ErrorState
              message="Failed to load content"
              onRetry={refetchDormy}
            />
          ) : (
            <TipRow
              title="The Dormy"
              genres={dormyGenres}
              locked={isFreeTier && isPremiumContent(4)}
              onSeeAll={() =>
                router.push({
                  pathname: '/(tabs)/learn/dormy',
                  params: { genre: 'all' },
                })
              }
              onGenrePress={navigateToDormy}
            />
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  bottomSpacer: {
    height: 100,
  },
});
