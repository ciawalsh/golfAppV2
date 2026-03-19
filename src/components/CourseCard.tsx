import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FallbackImage } from '@/components/FallbackImage';
import { GradientOverlay } from '@/components/GradientOverlay';
import { PremiumBadge } from '@/components/PremiumBadge';
import { toTitleCase } from '@/lib/toTitleCase';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';

interface CourseCardProps {
  title: string;
  image: string;
  lessonCount: number;
  coachName: string;
  coachProfilePic?: string;
  locked?: boolean;
  onPress: () => void;
}

const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2 - spacing.md;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

export { CARD_WIDTH as COURSE_CARD_WIDTH };

export const CourseCard = React.memo(function CourseCard({
  title,
  image,
  lessonCount,
  coachName,
  coachProfilePic,
  locked = false,
  onPress,
}: CourseCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <FallbackImage
        uri={image}
        style={styles.image}
        resizeMode="cover"
        fallbackIcon="book-open-variant"
      />
      <GradientOverlay
        height="50%"
        colors={[
          'transparent',
          'rgba(0,0,0,0.3)',
          'rgba(0,0,0,0.8)',
          'rgba(0,0,0,1.0)',
        ]}
      />
      <View style={styles.gradientSeal} />
      {locked && (
        <View style={styles.badge}>
          <PremiumBadge size="small" />
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {toTitleCase(title)}
        </Text>
        <View style={styles.metaRow}>
          {coachProfilePic ? (
            <FallbackImage
              uri={coachProfilePic}
              style={styles.coachAvatar}
              resizeMode="cover"
              fallbackIcon="account"
            />
          ) : null}
          <Text style={styles.meta} numberOfLines={1}>
            {coachName} · {lessonCount}{' '}
            {lessonCount === 1 ? 'lesson' : 'lessons'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
    backgroundColor: colors.backgroundElevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientSeal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#000000',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  title: {
    ...typography.title2,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: spacing.sm,
  },
  coachAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  meta: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
});
