import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FallbackImage } from '@/components/FallbackImage';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { Coach } from '@/types';

interface CoachCardProps {
  coach: Coach;
  onPress: () => void;
}

const CARD_WIDTH = SCREEN_WIDTH * 0.6;
const CARD_HEIGHT = CARD_WIDTH * 0.7;

export const CoachCard = React.memo(function CoachCard({
  coach,
  onPress,
}: CoachCardProps) {
  const credentialLine = coach.bio.split('.')[0] ?? '';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <FallbackImage
        uri={coach.image}
        style={styles.image}
        resizeMode="cover"
        fallbackIcon="account"
      />
      <View style={styles.gradient} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {coach.name}
        </Text>
        {credentialLine ? (
          <Text style={styles.credential} numberOfLines={1}>
            {credentialLine}
          </Text>
        ) : null}
      </View>
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
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Simulated gradient via bottom overlay
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.premiumOverlay,
  },
  name: {
    ...typography.h3,
    color: colors.textLight,
  },
  credential: {
    ...typography.caption,
    color: colors.grey300,
    marginTop: 2,
  },
});
