import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FallbackImage } from '@/components/FallbackImage';
import { PremiumBadge } from '@/components/PremiumBadge';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';
import { Course } from '@/types';

interface CourseListItemProps {
  course: Course;
  onPress: () => void;
  locked?: boolean;
}

export const CourseListItem = React.memo(function CourseListItem({
  course,
  onPress,
  locked = false,
}: CourseListItemProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.thumbnail}>
        <FallbackImage
          uri={course.image}
          style={styles.image}
          resizeMode="cover"
          fallbackIcon="book-open-variant"
        />
        {locked && (
          <View style={styles.lockOverlay}>
            <PremiumBadge size="small" />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <View style={styles.meta}>
          <MaterialCommunityIcons
            name="play-circle-outline"
            size={14}
            color={colors.textMuted}
          />
          <Text style={styles.metaText}>
            {course.videos.length}{' '}
            {course.videos.length === 1 ? 'lesson' : 'lessons'}
          </Text>
        </View>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.grey400}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  thumbnail: {
    width: 72,
    height: 54,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.grey100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.premiumOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
