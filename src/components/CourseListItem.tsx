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
        <Text style={styles.metaText}>
          {course.videos.length}{' '}
          {course.videos.length === 1 ? 'lesson' : 'lessons'}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.textTertiary}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
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
    ...typography.headline,
    color: colors.textPrimary,
  },
  metaText: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
});
