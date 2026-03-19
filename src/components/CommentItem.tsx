import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AvatarWithBadge } from '@/components/AvatarWithBadge';
import type { PublicProfile } from '@/hooks/useUserProfiles';
import type { VideoComment } from '@/types/community';
import { formatTimeAgo } from '@/lib/formatTimeAgo';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

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
        <View style={styles.topRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {profile.displayName}
          </Text>
          {profile.handicap !== null ? (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.handicapText}>HCP {profile.handicap}</Text>
            </>
          ) : null}
          <Text style={styles.dot}>·</Text>
          <Text style={styles.timeAgo}>{formatTimeAgo(comment.createdAt)}</Text>
          <View style={styles.spacer} />
          <Pressable
            style={styles.likeButton}
            onPress={onLike}
            disabled={!canLike}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={isLiked ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.likeCount, isLiked && styles.likeCountActive]}>
              {comment.likes}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  userName: {
    ...typography.callout,
    color: colors.textPrimary,
    fontWeight: '600',
    flexShrink: 1,
  },
  dot: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  handicapText: {
    ...typography.caption1,
    color: colors.accent,
  },
  timeAgo: {
    ...typography.caption1,
    color: colors.textTertiary,
  },
  spacer: {
    flex: 1,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  likeCount: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  likeCountActive: {
    color: colors.error,
  },
  text: {
    ...typography.callout,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 20,
  },
});
