import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FallbackImage } from '@/components/FallbackImage';
import { GradientOverlay } from '@/components/GradientOverlay';
import { PremiumBadge } from '@/components/PremiumBadge';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { toTitleCase } from '@/lib/toTitleCase';
import { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  onPress: () => void;
  locked?: boolean;
}

const CARD_WIDTH = (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2;

export const VideoCard = React.memo(function VideoCard({
  video,
  onPress,
  locked = false,
}: VideoCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <FallbackImage
        uri={video.thumbnailUrl}
        style={styles.image}
        resizeMode="cover"
        fallbackIcon="play-circle"
      />
      <GradientOverlay height="60%" />
      {locked ? (
        <View style={styles.lockOverlay}>
          <PremiumBadge size="large" />
        </View>
      ) : (
        <View style={styles.playIcon}>
          <MaterialCommunityIcons
            name="play-circle"
            size={24}
            color={colors.textPrimary}
          />
        </View>
      )}
      {video.duration ? (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      ) : null}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {toTitleCase(video.title)}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  playIcon: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.premiumOverlay,
  },
  durationBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.durationBadgeBg,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  durationText: {
    ...typography.caption2,
    color: colors.textPrimary,
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
  },
  title: {
    ...typography.caption1,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
