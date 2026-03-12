import React from 'react';
import { Text, Pressable, StyleSheet, View } from 'react-native';
import { FallbackImage } from '@/components/FallbackImage';
import { PremiumBadge } from '@/components/PremiumBadge';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { VideoGenre } from '@/types';

interface GenreCardProps {
  genre: VideoGenre;
  onPress: () => void;
  locked?: boolean;
}

const CARD_WIDTH = SCREEN_WIDTH * 0.4;
const CARD_HEIGHT = CARD_WIDTH * 0.75;

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
      <View style={styles.overlay} />
      <Text style={styles.title} numberOfLines={2}>
        {genre.title}
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
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
    backgroundColor: colors.grey200,
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayLight,
  },
  title: {
    ...typography.button,
    color: colors.textLight,
    padding: spacing.sm,
    textTransform: 'uppercase',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
});
