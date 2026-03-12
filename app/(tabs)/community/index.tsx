import { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';
import { useLikePost } from '@/hooks/useCommunityMutations';
import { useAuthStore } from '@/stores/authStore';
import { PostCard } from '@/components/PostCard';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import {
  LoadingIndicator,
  LoadingSpinner,
} from '@/components/LoadingIndicator';
import { CommunityPost } from '@/types/community';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

const FAB_SIZE = 56;

export default function CommunityFeedScreen() {
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.uid);

  const {
    posts,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useCommunityFeed();

  const likePost = useLikePost();

  const handlePostPress = useCallback(
    (postId: string) => {
      router.push(`/community/${postId}`);
    },
    [router],
  );

  const handleLike = useCallback(
    (postId: string, isLiked: boolean) => {
      likePost.mutate({ postId, isLiked });
    },
    [likePost],
  );

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderPost = useCallback(
    ({ item }: { item: CommunityPost }) => (
      <PostCard
        post={item}
        currentUserId={currentUserId}
        onPress={() => handlePostPress(item.id)}
        onLike={() =>
          handleLike(
            item.id,
            currentUserId ? item.likedBy.includes(currentUserId) : false,
          )
        }
      />
    ),
    [currentUserId, handlePostPress, handleLike],
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <LoadingSpinner />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="message-text-outline"
        title="No posts yet"
        subtitle="Be the first to share something with the community"
      />
    );
  }, [isLoading]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
        </View>
        <View style={styles.centered}>
          <LoadingIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
        </View>
        <ErrorState
          message="Failed to load the community feed"
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor={colors.secondary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyList : undefined
        }
      />

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/community/create-post')}
        hitSlop={4}
      >
        <MaterialCommunityIcons
          name="plus"
          size={28}
          color={colors.textLight}
        />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
