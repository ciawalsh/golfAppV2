import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDormyVideos } from '@/hooks/useDormyVideos';
import { useSubscription } from '@/hooks/useSubscription';
import { canAccessContent } from '@/lib/contentGating';
import { VideoCard } from '@/components/VideoCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { Video, VideoGenre } from '@/types';

export default function DormyScreen() {
  const { genre: initialGenre } = useLocalSearchParams<{ genre?: string }>();
  const router = useRouter();
  const { videosByCategory, genres, isLoading, error, refetch } =
    useDormyVideos();
  const { tier, isFreeTier } = useSubscription();
  const [selectedGenre, setSelectedGenre] = useState(initialGenre ?? 'all');

  const filteredVideos = useMemo(() => {
    if (selectedGenre === 'all') {
      return Object.values(videosByCategory).flat();
    }
    return videosByCategory[selectedGenre] ?? [];
  }, [videosByCategory, selectedGenre]);

  const handleVideoPress = useCallback(
    (video: Video) => {
      if (!canAccessContent(tier, video.minTierLevel)) {
        // Navigate to subscription/upgrade (Sprint 3)
        router.push('/(tabs)/more');
        return;
      }
      router.push({
        pathname: '/player',
        params: {
          videoUrl: video.videoUrl,
          title: video.title,
          thumbnailUrl: video.thumbnailUrl,
        },
      });
    },
    [router, tier],
  );

  const allGenres: (
    | VideoGenre
    | { type: string; title: string; image: string }
  )[] = useMemo(
    () => [{ type: 'all', title: 'All', image: '' }, ...genres],
    [genres],
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>The Dormy</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonLoader
              key={i}
              width={SCREEN_WIDTH * 0.42}
              height={SCREEN_WIDTH * 0.42 * (9 / 16) + 40}
              radius={borderRadius.sm}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message="Failed to load content" onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>The Dormy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={allGenres}
        keyExtractor={(item) => item.type}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillList}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.pill,
              selectedGenre === item.type && styles.pillActive,
            ]}
            onPress={() => setSelectedGenre(item.type)}
          >
            <Text
              style={[
                styles.pillText,
                selectedGenre === item.type && styles.pillTextActive,
              ]}
            >
              {item.title}
            </Text>
          </Pressable>
        )}
      />

      <FlatList
        data={filteredVideos}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <EmptyState title="No content available" icon="television-play" />
        }
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            onPress={() => handleVideoPress(item)}
            locked={isFreeTier}
          />
        )}
      />
    </SafeAreaView>
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
  pillList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.grey100,
    marginRight: spacing.sm,
  },
  pillActive: {
    backgroundColor: colors.secondary,
  },
  pillText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: colors.textLight,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});
