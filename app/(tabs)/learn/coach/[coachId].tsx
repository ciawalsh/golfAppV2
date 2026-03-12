import { useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCoaches } from '@/hooks/useCoaches';
import { useCoachCourses } from '@/hooks/useCoachCourses';
import { useSubscription } from '@/hooks/useSubscription';
import { isPremiumContent } from '@/lib/contentGating';
import { FallbackImage } from '@/components/FallbackImage';
import { CourseListItem } from '@/components/CourseListItem';
import { LoadingSpinner } from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { Course } from '@/types';

const HERO_HEIGHT = SCREEN_WIDTH * 0.55;

export default function CoachDetailScreen() {
  const { coachId } = useLocalSearchParams<{ coachId: string }>();
  const router = useRouter();
  const { isFreeTier } = useSubscription();
  const { coaches, isLoading: coachesLoading } = useCoaches();
  const coach = coaches.find((c) => c.id === coachId);
  const { courses, isLoading, error, refetch } = useCoachCourses(
    coachId ?? '',
    coach?.name ?? '',
  );

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
          videoUrl: coach.videoPitch,
          title: `Meet ${coach.name}`,
          coachName: coach.name,
        },
      });
    }
  }, [router, coach]);

  if (coachesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner size={32} />
      </SafeAreaView>
    );
  }

  if (!coach) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState title="Coach not found" icon="account-off" />
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View>
      {/* Hero */}
      <View style={styles.hero}>
        <FallbackImage
          uri={coach.image}
          style={styles.heroImage}
          resizeMode="cover"
          fallbackIcon="account"
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

      {/* Profile */}
      <View style={styles.profileSection}>
        <View style={styles.profilePicContainer}>
          <FallbackImage
            uri={coach.profilePic}
            style={styles.profilePic}
            resizeMode="cover"
            fallbackIcon="account"
          />
        </View>
        <Text style={styles.name}>{coach.name}</Text>
        <Text style={styles.bio}>{coach.bio}</Text>

        {coach.videoPitch ? (
          <Pressable style={styles.pitchButton} onPress={playVideoPitch}>
            <MaterialCommunityIcons
              name="play-circle"
              size={20}
              color={colors.textLight}
            />
            <Text style={styles.pitchButtonText}>
              Meet {coach.name.split(' ')[0]}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {/* Courses header */}
      <Text style={styles.coursesTitle}>Courses</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <LoadingSpinner size={32} />
        </View>
      ) : error ? (
        <View>
          {renderHeader()}
          <ErrorState message="Failed to load courses" onRetry={refetch} />
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <EmptyState title="No courses yet" icon="book-open-variant" />
          }
          renderItem={({ item }) => (
            <CourseListItem
              course={item}
              onPress={() => navigateToCourse(item)}
              locked={isFreeTier && isPremiumContent(item.minTierLevel)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
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
    backgroundColor: colors.overlayLight,
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
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    marginTop: -36,
  },
  profilePicContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: colors.surface,
    overflow: 'hidden',
    backgroundColor: colors.grey200,
    marginBottom: spacing.sm,
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  bio: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  pitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginTop: spacing.md,
  },
  pitchButtonText: {
    ...typography.button,
    color: colors.textLight,
  },
  coursesTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
