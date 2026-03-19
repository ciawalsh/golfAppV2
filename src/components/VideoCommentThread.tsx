import { useMemo } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ErrorState } from '@/components/ErrorState';
import { CommentInput } from '@/components/CommentInput';
import { CommentItem } from '@/components/CommentItem';
import { LoadingSpinner } from '@/components/LoadingIndicator';
import {
  useCreateVideoComment,
  useToggleVideoCommentLike,
} from '@/hooks/useVideoCommentMutations';
import { useUserProfiles, type PublicProfile } from '@/hooks/useUserProfiles';
import { useVideoComments } from '@/hooks/useVideoComments';
import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface VideoCommentThreadProps {
  videoId: string;
}

const DEFAULT_PROFILE: PublicProfile = {
  displayName: 'Anonymous',
  photoURL: null,
  handicap: null,
  isPremium: false,
};

export function VideoCommentThread({ videoId }: VideoCommentThreadProps) {
  const currentUserId = useAuthStore((state) => state.user?.uid);
  const { comments, isLoading, error, refetch } = useVideoComments(videoId);
  const createComment = useCreateVideoComment();
  const toggleCommentLike = useToggleVideoCommentLike();

  const userIds = useMemo(
    () => comments.map((comment) => comment.userId),
    [comments],
  );
  const { profiles } = useUserProfiles(userIds);

  const handleSendComment = (text: string) => {
    createComment.mutate({ videoId, text });
  };

  if (isLoading) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Discussion</Text>
          <Text style={styles.count}>0</Text>
        </View>
        <View style={styles.centered}>
          <LoadingSpinner size={32} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (error) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Discussion</Text>
        </View>
        <ErrorState
          message="Failed to load comments"
          onRetry={() => {
            void refetch();
          }}
        />
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Discussion</Text>
        <Text style={styles.count}>{comments.length}</Text>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isLiked = currentUserId
            ? item.likedBy.includes(currentUserId)
            : false;

          return (
            <CommentItem
              comment={item}
              profile={profiles.get(item.userId) ?? DEFAULT_PROFILE}
              currentUserId={currentUserId}
              isLiked={isLiked}
              onLike={() => {
                if (!currentUserId || toggleCommentLike.isPending) {
                  return;
                }

                toggleCommentLike.mutate({
                  videoId,
                  commentId: item.id,
                  isLiked,
                });
              }}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No comments yet. Be the first to discuss this lesson!
            </Text>
          </View>
        }
        contentContainerStyle={
          comments.length === 0 ? styles.emptyContent : styles.listContent
        }
        style={styles.list}
      />

      <CommentInput
        onSend={handleSendComment}
        isPending={createComment.isPending}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.separatorLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  count: {
    ...typography.callout,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacing.sm,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    backgroundColor: colors.separatorLight,
    height: 1,
    marginLeft: spacing.lg + 32 + spacing.sm,
  },
});
