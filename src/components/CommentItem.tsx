import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AvatarWithBadge } from '@/components/AvatarWithBadge';
import type { PublicProfile } from '@/hooks/useUserProfiles';
import type { VideoComment } from '@/types/community';
import { formatTimeAgo } from '@/lib/formatTimeAgo';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { borderRadius, spacing } from '@/constants/spacing';

interface CommentItemProps {
  comment: VideoComment;
  profile: PublicProfile;
  currentUserId: string | undefined;
  isLiked: boolean;
  onLike: () => void;
}

export function CommentItem({
  comment,
  profile,
  currentUserId,
  isLiked,
  onLike,
}: CommentItemProps) {
  const canLike = !!currentUserId;

  return (
    <View style={styles.container}>
      <AvatarWithBadge
        photoURL={profile.photoURL}
        isPremium={profile.isPremium}
        size={32}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <Text style={styles.userName} numberOfLines={1}>
              {profile.displayName}
            </Text>
            {profile.handicap !== null ? (
              <View style={styles.handicapBadge}>
                <Text style={styles.handicapText}>HCP {profile.handicap}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.timeAgo}>{formatTimeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
        <Pressable
          style={[styles.likeButton, !canLike && styles.likeButtonDisabled]}
          onPress={onLike}
          disabled={!canLike}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? colors.error : colors.textMuted}
          />
          <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
            {comment.likes}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  userName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
  },
  timeAgo: {
    ...typography.caption,
    color: colors.textMuted,
  },
  handicapBadge: {
    backgroundColor: colors.grey100,
    borderRadius: borderRadius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  handicapText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  text: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 20,
  },
  likeButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  likeButtonDisabled: {
    opacity: 0.6,
  },
  likeCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  likeCountActive: {
    color: colors.error,
  },
});
