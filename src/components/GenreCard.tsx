import React from 'react';
import { Text, Pressable, StyleSheet, View } from 'react-native';
import { FallbackImage } from '@/components/FallbackImage';
import { GradientOverlay } from '@/components/GradientOverlay';
import { PremiumBadge } from '@/components/PremiumBadge';
import { toTitleCase } from '@/lib/toTitleCase';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { VideoGenre } from '@/types';

interface GenreCardProps {
  genre: VideoGenre;
  onPress: () => void;
  locked?: boolean;
}

const CARD_SIZE = SCREEN_WIDTH * 0.35;

export const GenreCard = React.memo(function GenreCard({
  genre,
  onPress,
  locked = false,
}: GenreCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <FallbackImage
        uri={genre.image}
        style={styles.image}
        resizeMode="cover"
        fallbackIcon="play-circle-outline"
      />
      <GradientOverlay
        height="40%"
        colors={[
          'transparent',
          'rgba(0,0,0,0.3)',
          'rgba(0,0,0,0.7)',
          'rgba(0,0,0,0.9)',
        ]}
      />
      <Text style={styles.title} numberOfLines={2}>
        {toTitleCase(genre.title)}
      </Text>
      {locked && (
        <View style={styles.badge}>
          <PremiumBadge size="small" />
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  title: {
    ...typography.headline,
    color: colors.textPrimary,
    padding: spacing.md,
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
});
