import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';

interface PremiumBadgeProps {
  size?: 'small' | 'large';
}

export function PremiumBadge({ size = 'small' }: PremiumBadgeProps) {
  const iconSize = size === 'large' ? 16 : 12;

  return (
    <View style={[styles.badge, size === 'large' && styles.badgeLarge]}>
      <MaterialCommunityIcons
        name="lock"
        size={iconSize}
        color={colors.premiumGold}
      />
      {size === 'large' && <Text style={styles.label}>Premium</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.premiumOverlay,
    borderRadius: 4,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLarge: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  label: {
    ...typography.caption1,
    color: colors.premiumGold,
    fontWeight: '700',
  },
});
