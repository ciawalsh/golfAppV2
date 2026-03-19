import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FallbackImage } from '@/components/FallbackImage';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Coach } from '@/types';

interface CoachAvatarProps {
  coach: Coach;
  onPress: () => void;
}

const AVATAR_SIZE = 72;

export const CoachAvatar = React.memo(function CoachAvatar({
  coach,
  onPress,
}: CoachAvatarProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.avatarClip}>
        <FallbackImage
          uri={coach.profilePic}
          style={styles.avatar}
          resizeMode="cover"
          fallbackIcon="account"
        />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {coach.name.split(' ')[0]}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: AVATAR_SIZE + spacing.xl,
    marginRight: spacing.md,
  },
  avatarClip: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
