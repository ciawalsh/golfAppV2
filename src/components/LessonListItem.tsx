import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FallbackImage } from '@/components/FallbackImage';
import { PremiumBadge } from '@/components/PremiumBadge';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';
import { Video } from '@/types';

interface LessonListItemProps {
  lesson: Video;
  index: number;
  onPress: () => void;
  locked?: boolean;
}

export const LessonListItem = React.memo(function LessonListItem({
  lesson,
  index,
  onPress,
  locked = false,
}: LessonListItemProps) {
  return (
    <Pressable style={styles.container} onPress={onPress} disabled={locked}>
      <Text style={styles.index}>{index + 1}</Text>
      <View style={styles.thumbnail}>
        <FallbackImage
          uri={lesson.thumbnailUrl}
          style={styles.image}
          resizeMode="cover"
          fallbackIcon="play-circle"
        />
        {locked ? (
          <View style={styles.lockOverlay}>
            <PremiumBadge size="small" />
          </View>
        ) : (
          <View style={styles.playOverlay}>
            <MaterialCommunityIcons
              name="play"
              size={20}
              color={colors.textLight}
            />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.title, locked && styles.titleLocked]}
          numberOfLines={2}
        >
          {lesson.title}
        </Text>
        {lesson.duration ? (
          <Text style={styles.duration}>{lesson.duration}</Text>
        ) : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  index: {
    ...typography.body,
    color: colors.textMuted,
    width: 20,
    textAlign: 'center',
  },
  thumbnail: {
    width: 80,
    height: 56,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.grey100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.videoPlayOverlayAlt,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.premiumOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
  },
  titleLocked: {
    color: colors.textMuted,
  },
  duration: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
