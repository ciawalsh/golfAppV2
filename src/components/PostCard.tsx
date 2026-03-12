import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommunityPost } from '@/types/community';
import { FallbackImage } from '@/components/FallbackImage';
import { formatTimeAgo } from '@/lib/formatTimeAgo';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius, SCREEN_WIDTH } from '@/constants/spacing';

interface PostCardProps {
  post: CommunityPost;
  currentUserId: string | undefined;
  onPress: () => void;
  onLike: () => void;
}

export function PostCard({
  post,
  currentUserId,
  onPress,
  onLike,
}: PostCardProps) {
  const isLiked = currentUserId ? post.likedBy.includes(currentUserId) : false;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.header}>
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
                <Text style={styles.handicapText}>HCP {post.userHandicap}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.timeAgo}>{formatTimeAgo(post.createdAt)}</Text>
        </View>
      </View>

      {post.text ? (
        <Text style={styles.text} numberOfLines={4}>
          {post.text}
        </Text>
      ) : null}

      {post.imageUrl ? (
        <FallbackImage
          uri={post.imageUrl}
          style={styles.postImage}
          resizeMode="cover"
          fallbackIcon="image-off"
        />
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.actionButton} onPress={onLike} hitSlop={8}>
          <MaterialCommunityIcons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={isLiked ? colors.error : colors.textMuted}
          />
          <Text style={[styles.actionText, isLiked && { color: colors.error }]}>
            {post.likes > 0 ? post.likes : ''}
          </Text>
        </Pressable>

        <View style={styles.actionButton}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={20}
            color={colors.textMuted}
          />
          <Text style={styles.actionText}>
            {post.commentCount > 0 ? post.commentCount : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  text: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.sm,
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
});
