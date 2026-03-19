import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTipVideos } from '@/hooks/useTipVideos';
import { useSubscription } from '@/hooks/useSubscription';
import { canAccessContent, isPremiumContent } from '@/lib/contentGating';
import { VideoCard } from '@/components/VideoCard';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { toTitleCase } from '@/lib/toTitleCase';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { Video, VideoGenre } from '@/types';

export default function TipsScreen() {
  const { genre: initialGenre } = useLocalSearchParams<{ genre?: string }>();
  const router = useRouter();
  const { tipsByCategory, genres, isLoading, error, refetch } = useTipVideos();
  const { tier, isFreeTier } = useSubscription();
  const [selectedGenre, setSelectedGenre] = useState(initialGenre ?? 'all');

  const filteredTips = useMemo(() => {
    if (selectedGenre === 'all') {
      return Object.values(tipsByCategory).flat();
    }
    return tipsByCategory[selectedGenre] ?? [];
  }, [tipsByCategory, selectedGenre]);

  const playVideo = useCallback(
    (video: Video) => {
      if (!canAccessContent(tier, video.minTierLevel)) {
        router.push('/(tabs)/more');
        return;
      }

      router.push({
        pathname: '/player',
        params: {
          videoId: video.id,
          videoUrl: video.videoUrl,
          title: video.title,
        },
      });
    },
    [router, tier],
  );

  const errorMessage =
    error instanceof Error && error.message
      ? error.message
      : 'Failed to load tips';

  const allGenres: (
    | VideoGenre
    | { type: string; title: string; image: string }
  )[] = useMemo(
    () => [{ type: 'all', title: 'All', image: '' }, ...genres],
    [genres],
  );

  const renderPills = () => (
    <FlatList
      style={{ flexGrow: 0 }}
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
            {toTitleCase(item.title)}
          </Text>
        </Pressable>
      )}
    />
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
          <Text style={styles.headerTitle}>Caddie Tips</Text>
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
        <ErrorState message={errorMessage} onRetry={refetch} />
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
        <Text style={styles.headerTitle}>Caddie Tips</Text>
        <View style={styles.headerSpacer} />
      </View>

      {renderPills()}

      <FlatList
        data={filteredTips}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <EmptyState
            title="No tips in this category"
            icon="lightbulb-outline"
          />
        }
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            onPress={() => playVideo(item)}
            locked={isFreeTier && isPremiumContent(item.minTierLevel)}
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
    ...typography.title3,
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
    height: 36,
    borderRadius: 18,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.backgroundElevated,
  },
  pillActive: {
    backgroundColor: colors.backgroundSecondary,
  },
  pillText: {
    ...typography.callout,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  pillTextActive: {
    color: colors.textPrimary,
  },
  grid: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
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
