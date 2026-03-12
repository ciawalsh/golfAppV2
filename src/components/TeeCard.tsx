import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GolfTee } from '@/types/golf';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface TeeCardProps {
  tee: GolfTee;
  selected: boolean;
  onPress: () => void;
}

const TEE_COLORS: Record<string, string> = {
  white: colors.teeWhite,
  yellow: colors.teeYellow,
  red: colors.teeRed,
  blue: colors.teeBlue,
  black: colors.teeBlack,
  green: colors.teeGreen,
  gold: colors.teeGold,
  medal: colors.teeMedal,
};

function getTeeHex(teeColor: string): string {
  return TEE_COLORS[teeColor.toLowerCase()] ?? colors.grey400;
}

export function TeeCard({ tee, selected, onPress }: TeeCardProps) {
  const teeHex = getTeeHex(tee.teeColor);
  const isLight = teeHex === colors.teeWhite || teeHex === colors.teeYellow;

  return (
    <Pressable
      style={[styles.container, selected && styles.selected]}
      onPress={onPress}
    >
      <View
        style={[
          styles.teeCircle,
          { backgroundColor: teeHex },
          isLight && styles.teeCircleBorder,
        ]}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{tee.teeName || tee.teeColor}</Text>
        <Text style={styles.detail}>
          {tee.totalYardage.toLocaleString()} yds · {tee.holes.length} holes
        </Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.statLabel}>Rating</Text>
        <Text style={styles.statValue}>
          {tee.rating != null ? tee.rating.toFixed(1) : 'N/A'}
        </Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.statLabel}>Slope</Text>
        <Text style={styles.statValue}>
          {tee.slope != null ? tee.slope.toString() : 'N/A'}
        </Text>
      </View>
      {selected ? (
        <MaterialCommunityIcons
          name="check-circle"
          size={24}
          color={colors.secondary}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  teeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  teeCircleBorder: {
    borderWidth: 1,
    borderColor: colors.grey300,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  detail: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stats: {
    alignItems: 'center',
    minWidth: 44,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  statValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
