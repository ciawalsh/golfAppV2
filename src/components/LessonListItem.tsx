import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { toTitleCase } from '@/lib/toTitleCase';
import { FallbackImage } from '@/components/FallbackImage';
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
  const formattedDuration = lesson.duration
    ? /^\d+$/.test(lesson.duration)
      ? `${lesson.duration} min`
      : lesson.duration
    : null;

  return (
    <Pressable style={styles.container} onPress={onPress} disabled={locked}>
      <View style={styles.thumbnail}>
        <FallbackImage
          uri={lesson.thumbnailUrl}
          style={styles.thumbnailImage}
          resizeMode="cover"
          fallbackIcon="play-circle-outline"
        />
        {formattedDuration ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationBadgeText}>{formattedDuration}</Text>
          </View>
        ) : null}
        {locked && (
          <View style={styles.lockOverlay}>
            <MaterialCommunityIcons
              name="lock"
              size={20}
              color={colors.textPrimary}
            />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text
          style={[styles.title, locked && styles.titleLocked]}
          numberOfLines={2}
        >
          {index + 1}. {toTitleCase(lesson.title)}
        </Text>
        {lesson.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {lesson.description}
          </Text>
        ) : formattedDuration ? (
          <Text style={styles.description}>{formattedDuration}</Text>
        ) : null}
      </View>
      {!locked && (
        <MaterialCommunityIcons
          name="play-circle-outline"
          size={24}
          color={colors.textSecondary}
        />
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  thumbnail: {
    width: 100,
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.durationBadgeBg,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  durationBadgeText: {
    ...typography.caption2,
    color: colors.textPrimary,
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
    ...typography.headline,
    color: colors.textPrimary,
  },
  titleLocked: {
    color: colors.textSecondary,
  },
  description: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
});
