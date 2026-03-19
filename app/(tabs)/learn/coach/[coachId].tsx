import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useParallaxHero } from '@/hooks/useParallaxHero';
import { useCoaches } from '@/hooks/useCoaches';
import { useCoachCourses } from '@/hooks/useCoachCourses';
import { useSubscription } from '@/hooks/useSubscription';
import { isPremiumContent } from '@/lib/contentGating';
import { toTitleCase } from '@/lib/toTitleCase';
import { FallbackImage } from '@/components/FallbackImage';
import { GradientOverlay } from '@/components/GradientOverlay';
import { PremiumBadge } from '@/components/PremiumBadge';
import { LoadingSpinner } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius, SCREEN_HEIGHT } from '@/constants/spacing';
import { Course } from '@/types';

const HERO_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function CoachDetailScreen() {
  const { coachId } = useLocalSearchParams<{ coachId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isFreeTier } = useSubscription();
  const {
    coaches,
    isLoading: coachesLoading,
    error: coachesError,
    refetch: refetchCoaches,
  } = useCoaches();
  const coach = coaches.find((c) => c.id === coachId);
  const { courses, isLoading, error, refetch } = useCoachCourses(coachId ?? '');

  const { scrollHandler, heroAnimatedStyle } = useParallaxHero(HERO_HEIGHT);

  const navigateToCourse = useCallback(
    (course: Course) => {
      router.push({
        pathname: '/(tabs)/learn/course/[courseId]',
        params: {
          courseId: course.id,
          coachId: coachId ?? '',
          coachName: coach?.name ?? '',
        },
      });
    },
    [router, coachId, coach?.name],
  );

  const playVideoPitch = useCallback(() => {
    if (coach?.videoPitch) {
      router.push({
        pathname: '/player',
        params: {
          videoId: `coach-pitch_${coach.id}`,
          videoUrl: coach.videoPitch,
          title: `Meet ${coach.name}`,
          coachName: coach.name,
        },
      });
    }
  }, [router, coach]);

  if (coachesLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.headerBarTitle} numberOfLines={1}>
            Coach
          </Text>
          <View style={styles.headerBarSpacer} />
        </View>
        <LoadingSpinner size={32} />
      </SafeAreaView>
    );
  }

  if (coachesError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.headerBarTitle} numberOfLines={1}>
            Coach
          </Text>
          <View style={styles.headerBarSpacer} />
        </View>
        <ErrorState message="Failed to load coach" onRetry={refetchCoaches} />
      </SafeAreaView>
    );
  }

  if (!coach) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.headerBarTitle} numberOfLines={1}>
            Coach
          </Text>
          <View style={styles.headerBarSpacer} />
        </View>
        <EmptyState title="Coach not found" icon="account-off" />
      </SafeAreaView>
    );
  }

  const firstName = coach.name.split(' ')[0];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.hero, heroAnimatedStyle]}>
        <FallbackImage
          uri={coach.image}
          style={styles.heroImage}
          resizeMode="cover"
          fallbackIcon="account"
        />
        <GradientOverlay
          height="60%"
          colors={[
            'transparent',
            'rgba(0,0,0,0.4)',
            'rgba(0,0,0,0.85)',
            '#000000',
          ]}
        />
        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>{coach.name}</Text>
        </View>
      </Animated.View>

      <Pressable
        style={[styles.backButton, { top: insets.top + spacing.sm }]}
        onPress={() => router.back()}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={colors.textPrimary}
        />
      </Pressable>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: HERO_HEIGHT }} />

        <View style={styles.contentSheet}>
          <Text style={styles.bio}>{coach.bio}</Text>

          {coach.videoPitch ? (
            <Pressable style={styles.pitchButton} onPress={playVideoPitch}>
              <View style={styles.pitchPlayCircle}>
                <MaterialCommunityIcons
                  name="play"
                  size={16}
                  color={colors.textPrimary}
                />
              </View>
              <Text style={styles.pitchButtonText}>Meet {firstName}</Text>
            </Pressable>
          ) : null}

          <Text style={styles.coursesTitle}>Courses</Text>

          {isLoading ? (
            <LoadingSpinner size={32} />
          ) : error ? (
            <ErrorState message="Failed to load courses" onRetry={refetch} />
          ) : courses.length === 0 ? (
            <EmptyState title="No courses yet" icon="book-open-variant" />
          ) : (
            courses.map((course) => {
              const locked =
                isFreeTier && isPremiumContent(course.minTierLevel);
              return (
                <Pressable
                  key={course.id}
                  style={styles.courseCard}
                  onPress={() => navigateToCourse(course)}
                >
                  <View style={styles.courseCardAccent} />
                  <View style={styles.courseCardImage}>
                    <FallbackImage
                      uri={course.image}
                      style={styles.courseCardImageFill}
                      resizeMode="cover"
                      fallbackIcon="book-open-variant"
                    />
                    {locked && (
                      <View style={styles.courseCardLock}>
                        <PremiumBadge size="small" />
                      </View>
                    )}
                  </View>
                  <View style={styles.courseCardText}>
                    <Text style={styles.courseCardTitle} numberOfLines={2}>
                      {toTitleCase(course.title)}
                    </Text>
                    <Text style={styles.courseCardMeta}>
                      {course.videos.length}{' '}
                      {course.videos.length === 1 ? 'lesson' : 'lessons'}
                    </Text>
                    <View style={styles.courseCardChevron}>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color={colors.textTertiary}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}

          <View style={styles.bottomSpacer} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerBarTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerBarSpacer: {
    width: 24,
  },
  hero: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlayMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSheet: {
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  heroInfo: {
    position: 'absolute',
    bottom: HERO_HEIGHT * 0.15,
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  heroName: {
    ...typography.display,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  pitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: spacing.lg,
  },
  pitchPlayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pitchButtonText: {
    ...typography.headline,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  coursesTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginTop: spacing.xl,
  },
  courseCard: {
    flexDirection: 'row',
    height: 100,
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  courseCardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.accent,
    zIndex: 1,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  courseCardImage: {
    width: '40%',
    height: '100%',
  },
  courseCardImageFill: {
    width: '100%',
    height: '100%',
  },
  courseCardLock: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.premiumOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseCardText: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  courseCardTitle: {
    ...typography.headline,
    color: colors.textPrimary,
  },
  courseCardMeta: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  courseCardChevron: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
  },
  bottomSpacer: {
    height: 100,
  },
});
