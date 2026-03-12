import { useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { usePostComments } from '@/hooks/usePostComments';
import { useLikePost, useCreateComment } from '@/hooks/useCommunityMutations';
import { useAuthStore } from '@/stores/authStore';
import { FallbackImage } from '@/components/FallbackImage';
import { CommentItem } from '@/components/CommentItem';
import { CommentInput } from '@/components/CommentInput';
import {
  LoadingIndicator,
  LoadingSpinner,
} from '@/components/LoadingIndicator';
import { ErrorState } from '@/components/ErrorState';
import { formatTimeAgo } from '@/lib/formatTimeAgo';
import {
  CommunityPost,
  PostComment,
  FirestoreCommunityPostData,
} from '@/types/community';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius, SCREEN_WIDTH } from '@/constants/spacing';

function usePost(postId: string) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async (): Promise<CommunityPost | null> => {
      const snap = await getDoc(doc(db, COLLECTIONS.COMMUNITY_POSTS, postId));
      if (!snap.exists()) return null;

      const data = snap.data() as FirestoreCommunityPostData;
      return {
        id: snap.id,
        userId: data.userId ?? '',
        userName: data.userName ?? 'Anonymous',
        userAvatar: data.userAvatar ?? null,
        userHandicap:
          typeof data.userHandicap === 'number' &&
          Number.isFinite(data.userHandicap)
            ? data.userHandicap
            : null,
        text: data.text ?? '',
        imageUrl: data.imageUrl ?? null,
        likes: Number.isFinite(data.likes) ? (data.likes as number) : 0,
        commentCount: Number.isFinite(data.commentCount)
          ? (data.commentCount as number)
          : 0,
        likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
        createdAt: data.createdAt?.toMillis?.() ?? 0,
      };
    },
    enabled: !!postId,
    staleTime: 60 * 1000,
  });
}

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.user?.uid);

  const {
    data: post,
    isLoading: postLoading,
    error: postError,
    refetch: refetchPost,
  } = usePost(postId ?? '');

  const { comments, isLoading: commentsLoading } = usePostComments(
    postId ?? '',
  );

  const likePost = useLikePost();
  const createComment = useCreateComment();

  const isLiked = currentUserId
    ? (post?.likedBy.includes(currentUserId) ?? false)
    : false;

  const handleLike = useCallback(() => {
    if (!post) return;
    likePost.mutate({ postId: post.id, isLiked });
  }, [post, isLiked, likePost]);

  const handleSendComment = useCallback(
    (text: string) => {
      if (!postId) return;
      createComment.mutate(
        { postId, text },
        {
          onSuccess: () => {
            refetchPost();
          },
        },
      );
    },
    [postId, createComment, refetchPost],
  );

  const renderHeader = useCallback(() => {
    if (!post) return null;
    return (
      <View>
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <FallbackImage
              uri={post.userAvatar ?? undefined}
              style={styles.avatar}
              fallbackIcon="account"
            />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {post.userName}
                </Text>
                {post.userHandicap != null ? (
                  <View style={styles.handicapBadge}>
                    <Text style={styles.handicapText}>
                      HCP {post.userHandicap}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(post.createdAt)}
              </Text>
            </View>
          </View>

          {post.text ? <Text style={styles.postText}>{post.text}</Text> : null}

          {post.imageUrl ? (
            <FallbackImage
              uri={post.imageUrl}
              style={styles.postImage}
              resizeMode="cover"
              fallbackIcon="image-off"
            />
          ) : null}

          <View style={styles.actions}>
            <Pressable
              style={styles.actionButton}
              onPress={handleLike}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? colors.error : colors.textMuted}
              />
              <Text
                style={[styles.actionText, isLiked && { color: colors.error }]}
              >
                {post.likes > 0 ? `${post.likes}` : ''}
              </Text>
            </Pressable>

            <View style={styles.actionButton}>
              <MaterialCommunityIcons
                name="comment-outline"
                size={20}
                color={colors.textMuted}
              />
              <Text style={styles.actionText}>
                {post.commentCount > 0 ? `${post.commentCount}` : ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <Text style={styles.commentsTitle}>
          Comments {post.commentCount > 0 ? `(${post.commentCount})` : ''}
        </Text>

        {commentsLoading ? (
          <View style={styles.commentsLoading}>
            <LoadingSpinner />
          </View>
        ) : null}

        {!commentsLoading && comments.length === 0 ? (
          <View style={styles.noComments}>
            <Text style={styles.noCommentsText}>
              No comments yet. Be the first!
            </Text>
          </View>
        ) : null}
      </View>
    );
  }, [post, isLiked, handleLike, commentsLoading, comments.length]);

  const renderComment = useCallback(
    ({ item }: { item: PostComment }) => <CommentItem comment={item} />,
    [],
  );

  if (postLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navHeader}>
          <Pressable onPress={router.back} hitSlop={8}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.navTitle}>Post</Text>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.centered}>
          <LoadingIndicator />
        </View>
      </SafeAreaView>
    );
  }

  if (postError || !post) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.navHeader}>
          <Pressable onPress={router.back} hitSlop={8}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.navTitle}>Post</Text>
          <View style={styles.navSpacer} />
        </View>
        <ErrorState message="Failed to load this post" onRetry={refetchPost} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.navHeader}>
        <Pressable onPress={router.back} hitSlop={8}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.navTitle}>Post</Text>
        <View style={styles.navSpacer} />
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      <CommentInput
        onSend={handleSendComment}
        isPending={createComment.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  navTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  navSpacer: {
    width: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  postContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.grey200,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  handicapBadge: {
    backgroundColor: colors.grey100,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  handicapText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  timeAgo: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  postText: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  postImage: {
    width: SCREEN_WIDTH - spacing.lg * 2,
    height: (SCREEN_WIDTH - spacing.lg * 2) * 0.6,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    backgroundColor: colors.grey200,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    height: spacing.sm,
    backgroundColor: colors.borderLight,
  },
  commentsTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  commentsLoading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  noComments: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  noCommentsText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
