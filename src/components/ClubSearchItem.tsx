import { Pressable, View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GolfClub } from '@/types/golf';
import { haversineDistanceMiles } from '@/lib/golf';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

interface ClubSearchItemProps {
  club: GolfClub;
  userLat?: number | null;
  userLng?: number | null;
  onPress: () => void;
}

export function ClubSearchItem({
  club,
  userLat,
  userLng,
  onPress,
}: ClubSearchItemProps) {
  const distance =
    userLat != null && userLng != null
      ? haversineDistanceMiles(userLat, userLng, club.latitude, club.longitude)
      : null;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.icon}>
        <MaterialCommunityIcons
          name="golf"
          size={24}
          color={colors.secondary}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {club.clubName}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {[club.city, club.state, club.country].filter(Boolean).join(', ')}
        </Text>
      </View>
      {distance != null && Number.isFinite(distance) ? (
        <Text style={styles.distance}>
          {distance < 1
            ? `${Math.round(distance * 1760)} yds`
            : `${distance.toFixed(1)} mi`}
        </Text>
      ) : null}
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={colors.grey400}
      />
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
    minHeight: 56,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.grey100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  distance: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
