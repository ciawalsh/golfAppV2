import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { FallbackImage } from '@/components/FallbackImage';

interface AvatarWithBadgeProps {
  photoURL: string | null | undefined;
  isPremium: boolean;
  size?: number;
}

export function AvatarWithBadge({
  photoURL,
  isPremium,
  size = 40,
}: AvatarWithBadgeProps) {
  const borderWidth = isPremium ? 2 : 0;
  const avatarSize = Math.max(size - borderWidth * 2, 0);
  const badgeSize = Math.max(16, Math.round(size * 0.38));
  const iconSize = Math.max(10, Math.round(size * 0.22));
  const fallbackIconSize = Math.max(16, Math.round(size * 0.42));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.avatarFrame,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth,
            borderColor: colors.premiumGold,
          },
        ]}
      >
        <FallbackImage
          uri={photoURL ?? undefined}
          fallbackIcon="account"
          fallbackIconSize={fallbackIconSize}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          }}
        />
      </View>

      {isPremium ? (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="crown"
            size={iconSize}
            color={colors.premiumGold}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'visible',
  },
  avatarFrame: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    bottom: -2,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
  },
});
