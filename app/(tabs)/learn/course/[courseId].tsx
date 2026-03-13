import { useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCoachCourses } from '@/hooks/useCoachCourses';
import { useSubscription } from '@/hooks/useSubscription';
import { canAccessContent, isPremiumContent } from '@/lib/contentGating';
import { LessonListItem } from '@/components/LessonListItem';
import { LoadingSpinner } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { FallbackImage } from '@/components/FallbackImage';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { Video } from '@/types';

const HERO_HEIGHT = SCREEN_WIDTH * 0.45;

export default function CourseDetailScreen() {
  const { courseId, coachId, coachName } = useLocalSearchParams<{
    courseId: string;
    coachId: string;
    coachName: string;
  }>();
  const router = useRouter();
  const { tier, isFreeTier } = useSubscription();
  const { courses, isLoading, error, refetch } = useCoachCourses(coachId ?? '');

  const course = useMemo(
    () => courses.find((c) => c.id === courseId),
    [courses, courseId],
  );

  const playLesson = useCallback(
    (lesson: Video) => {
      if (!canAccessContent(tier, lesson.minTierLevel)) return;

      router.push({
        pathname: '/player',
        params: {
          videoUrl: lesson.videoUrl,
          title: lesson.title,
          coachName: coachName ?? course?.coachName ?? '',
        },
      });
    },
    [router, tier, coachName, course?.coachName],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <LoadingSpinner size={32} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message="Failed to load course" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState title="Course not found" icon="book-off-outline" />
      </SafeAreaView>
    );
  }

  const isLocked = isFreeTier && isPremiumContent(course.minTierLevel);

  const renderHeader = () => (
    <View>
      <View style={styles.hero}>
        <FallbackImage
          uri={course.image}
          style={styles.heroImage}
          resizeMode="cover"
          fallbackIcon="book-open-variant"
        />
        <View style={styles.heroOverlay} />
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textLight}
          />
        </Pressable>
      </View>

      <View style={styles.headerInfo}>
        <Text style={styles.title}>{course.title}</Text>
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={course.videos}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState title="No lessons yet" icon="play-circle-outline" />
        }
        renderItem={({ item, index }) => (
          <LessonListItem
            lesson={item}
            index={index}
            onPress={() => playLesson(item)}
            locked={isFreeTier && isPremiumContent(item.minTierLevel)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
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
    height: HERO_HEIGHT,
    backgroundColor: colors.grey200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.videoPlayOverlay,
  },
  backButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlayMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  coachName: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  lessonCount: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  premiumBannerText: {
    ...typography.bodySmall,
    color: colors.textLight,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: colors.premiumGold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  upgradeButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
