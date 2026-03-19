import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { useParallaxHero } from '@/hooks/useParallaxHero';
import { useCoachCourses } from '@/hooks/useCoachCourses';
import { useSubscription } from '@/hooks/useSubscription';
import { canAccessContent, isPremiumContent } from '@/lib/contentGating';
import { toTitleCase } from '@/lib/toTitleCase';
import { LessonListItem } from '@/components/LessonListItem';
import { LoadingSpinner } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { FallbackImage } from '@/components/FallbackImage';
import { GradientOverlay } from '@/components/GradientOverlay';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_HEIGHT, borderRadius } from '@/constants/spacing';
import { Video } from '@/types';

const HERO_HEIGHT = SCREEN_HEIGHT * 0.35;

export default function CourseDetailScreen() {
  const { courseId, coachId, coachName } = useLocalSearchParams<{
    courseId: string;
    coachId: string;
    coachName: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tier, isFreeTier } = useSubscription();
  const { courses, isLoading, error, refetch } = useCoachCourses(coachId ?? '');

  const course = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courses, courseId],
  );

  const { scrollHandler, heroAnimatedStyle } = useParallaxHero(HERO_HEIGHT);

  const playLesson = useCallback(
    (lesson: Video) => {
      if (!canAccessContent(tier, lesson.minTierLevel)) return;

      router.push({
        pathname: '/player',
        params: {
          videoId: lesson.id,
          videoUrl: lesson.videoUrl,
          title: lesson.title,
          coachName: coachName ?? course?.coachName ?? '',
        },
      });
    },
    [router, tier, coachName, course?.coachName],
  );

  const backButtonStyle = [styles.backButton, { top: insets.top + spacing.sm }];

  const renderBackButton = () => (
    <Pressable style={backButtonStyle} onPress={() => router.back()}>
      <MaterialCommunityIcons
        name="arrow-left"
        size={24}
        color={colors.textPrimary}
      />
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderBackButton()}
        <View style={styles.centered}>
          <LoadingSpinner size={32} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderBackButton()}
        <ErrorState message="Failed to load course" onRetry={refetch} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.container}>
        {renderBackButton()}
        <EmptyState title="Course not found" icon="book-off-outline" />
      </View>
    );
  }

  const isLocked = isFreeTier && isPremiumContent(course.minTierLevel);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.hero, heroAnimatedStyle]}>
        <FallbackImage
          uri={course.image}
          style={styles.heroImage}
          resizeMode="cover"
          fallbackIcon="book-open-variant"
        />
        <GradientOverlay
          colors={[
            'transparent',
            'rgba(0,0,0,0.4)',
            'rgba(0,0,0,0.85)',
            '#000000',
          ]}
        />
      </Animated.View>

      {renderBackButton()}

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: HERO_HEIGHT }} />

        <View style={styles.infoCard}>
          <Text style={styles.title}>{toTitleCase(course.title)}</Text>
          <Text style={styles.coachName}>{course.coachName}</Text>
          <Text style={styles.lessonCount}>
            {course.videos.length}{' '}
            {course.videos.length === 1 ? 'lesson' : 'lessons'}
          </Text>
        </View>

        {isLocked && (
          <View style={styles.premiumBanner}>
            <MaterialCommunityIcons
              name="lock"
              size={16}
              color={colors.premiumGold}
            />
            <Text style={styles.premiumBannerText}>
              Subscribe to unlock this course
            </Text>
            <Pressable
              style={styles.upgradeButton}
              onPress={() => router.push('/(tabs)/more')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </Pressable>
          </View>
        )}

        {/* TODO: Course-level discussion (requires new Firestore collection) */}

        <Text style={styles.lessonsTitle}>Lessons</Text>

        {course.videos.length === 0 ? (
          <EmptyState title="No lessons yet" icon="play-circle-outline" />
        ) : (
          <View style={styles.lessonCard}>
            {course.videos.map((video, index) => (
              <React.Fragment key={video.id}>
                {index > 0 && <View style={styles.lessonSeparator} />}
                <LessonListItem
                  lesson={video}
                  index={index}
                  onPress={() => playLesson(video)}
                  locked={isFreeTier && isPremiumContent(video.minTierLevel)}
                />
              </React.Fragment>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlayMedium,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  infoCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.xl,
    marginTop: -40,
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
  },
  title: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  coachName: {
    ...typography.callout,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  lessonCount: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
  },
  premiumBannerText: {
    ...typography.callout,
    color: colors.textPrimary,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: colors.premiumGold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  upgradeButtonText: {
    ...typography.caption1,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  lessonsTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  lessonCard: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    overflow: 'hidden',
  },
  lessonSeparator: {
    height: 1,
    backgroundColor: colors.separator,
    marginRight: spacing.lg,
    marginLeft: spacing.lg,
  },
  bottomSpacer: {
    height: 100,
  },
});
