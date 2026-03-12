import { View, Text, StyleSheet } from 'react-native';
import { PostComment } from '@/types/community';
import { FallbackImage } from '@/components/FallbackImage';
import { formatTimeAgo } from '@/lib/formatTimeAgo';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface CommentItemProps {
  comment: PostComment;
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <View style={styles.container}>
      <FallbackImage
        uri={comment.userAvatar ?? undefined}
        style={styles.avatar}
        fallbackIcon="account"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.userName}>{comment.userName}</Text>
          <Text style={styles.timeAgo}>{formatTimeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.grey200,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  timeAgo: {
    ...typography.caption,
    color: colors.textMuted,
  },
  text: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginTop: 2,
    lineHeight: 20,
  },
});
