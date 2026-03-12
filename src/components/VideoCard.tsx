import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FallbackImage } from '@/components/FallbackImage';
import { PremiumBadge } from '@/components/PremiumBadge';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { Video } from '@/types';

interface VideoCardProps {
  video: Video;
  onPress: () => void;
  locked?: boolean;
}

const CARD_WIDTH = SCREEN_WIDTH * 0.42;

export const VideoCard = React.memo(function VideoCard({
  video,
  onPress,
  locked = false,
}: VideoCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.thumbnail}>
        <FallbackImage
          uri={video.thumbnailUrl}
          style={styles.image}
          resizeMode="cover"
          fallbackIcon="play-circle"
        />
        {locked ? (
          <View style={styles.lockOverlay}>
            <PremiumBadge size="large" />
          </View>
        ) : (
          <View style={styles.playOverlay}>
            <MaterialCommunityIcons
              name="play-circle"
              size={32}
              color={colors.textLight}
            />
          </View>
        )}
        {video.duration ? (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {video.title}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginRight: spacing.md,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    backgroundColor: colors.grey200,
    marginBottom: spacing.xs,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.videoPlayOverlay,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.premiumOverlay,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.durationBadgeBg,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  durationText: {
    ...typography.caption,
    color: colors.textLight,
    fontSize: 10,
  },
  title: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
});
