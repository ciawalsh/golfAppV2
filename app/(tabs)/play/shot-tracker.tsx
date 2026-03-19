import { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, {
  Marker,
  Polyline,
  MapPressEvent,
  Region,
} from 'react-native-maps';
import { useLocation } from '@/hooks/useLocation';
import { useRoundStore } from '@/stores/roundStore';
import { useGolfClubs } from '@/hooks/useGolfClubs';
import { haversineDistanceYards } from '@/lib/golf';
import { ClubType, CLUB_LABELS, Shot } from '@/types/golf';
import { LoadingSpinner } from '@/components/LoadingIndicator';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

const DEFAULT_DELTA = 0.003;

const CLUB_OPTIONS: ClubType[] = [
  'driver',
  '3wood',
  '5wood',
  '7wood',
  '3iron',
  '4iron',
  '5iron',
  '6iron',
  '7iron',
  '8iron',
  '9iron',
  'pw',
  'gw',
  'sw',
  'lw',
  'putter',
];

function generateShotId(): string {
  return (
    'shot-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2, 8)
  );
}

export default function ShotTrackerScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const {
    location,
    isLoading: locationLoading,
    error: locationError,
  } = useLocation();

  const activeRound = useRoundStore((s) => s.activeRound);
  const addShot = useRoundStore((s) => s.addShot);
  const removeShot = useRoundStore((s) => s.removeShot);
  const currentHoleIndex = useRoundStore((s) => s.currentHoleIndex);
  const { clubs } = useGolfClubs();

  const holeCount = activeRound?.holeCount ?? 18;

  // Local state
  const [selectedHole, setSelectedHole] = useState(
    activeRound ? currentHoleIndex + 1 : 1,
  );
  const [selectedClubType, setSelectedClubType] = useState<ClubType>('driver');
  const [pendingPin, setPendingPin] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Shots for the selected hole
  const shotsForHole = useMemo(() => {
    if (!activeRound) return [];
    return activeRound.shots
      .filter((s) => s.holeNumber === selectedHole)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [activeRound, selectedHole]);

  // Calculate distances between consecutive shots
  const shotDistances = useMemo(() => {
    const distances: (number | null)[] = [];
    for (let i = 0; i < shotsForHole.length; i++) {
      if (i === 0) {
        distances.push(null);
      } else {
        const prev = shotsForHole[i - 1]!;
        const curr = shotsForHole[i]!;
        const dist = haversineDistanceYards(
          prev.latitude,
          prev.longitude,
          curr.latitude,
          curr.longitude,
        );
        distances.push(dist);
      }
    }
    return distances;
  }, [shotsForHole]);

  // Map center: course club coords > user location > default London
  // Derive from activeRound.clubId (persisted), not ephemeral selectedClub
  const initialRegion: Region = useMemo(() => {
    if (activeRound?.clubId) {
      const club = clubs.find((c) => c.id === activeRound.clubId);
      if (
        club &&
        Number.isFinite(club.latitude) &&
        Number.isFinite(club.longitude)
      ) {
        return {
          latitude: club.latitude,
          longitude: club.longitude,
          latitudeDelta: DEFAULT_DELTA,
          longitudeDelta: DEFAULT_DELTA,
        };
      }
    }
    if (location) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: DEFAULT_DELTA,
        longitudeDelta: DEFAULT_DELTA,
      };
    }
    return {
      latitude: 51.5074,
      longitude: -0.1278,
      latitudeDelta: DEFAULT_DELTA,
      longitudeDelta: DEFAULT_DELTA,
    };
  }, [activeRound?.clubId, clubs, location]);

  const handleMapPress = useCallback((e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPendingPin({ latitude, longitude });
  }, []);

  const handleConfirmShot = useCallback(() => {
    if (!pendingPin) return;

    const shotNumber = shotsForHole.length + 1;
    const prevShot =
      shotsForHole.length > 0 ? shotsForHole[shotsForHole.length - 1] : null;

    const distanceYards = prevShot
      ? haversineDistanceYards(
          prevShot.latitude,
          prevShot.longitude,
          pendingPin.latitude,
          pendingPin.longitude,
        )
      : null;

    const shot: Shot = {
      id: generateShotId(),
      holeNumber: selectedHole,
      shotNumber,
      club: selectedClubType,
      latitude: pendingPin.latitude,
      longitude: pendingPin.longitude,
      distanceYards,
      timestamp: Date.now(),
    };

    addShot(shot);
    setPendingPin(null);
  }, [pendingPin, shotsForHole, selectedHole, selectedClubType, addShot]);

  const handleCancelPin = useCallback(() => {
    setPendingPin(null);
  }, []);

  const handleRemoveLastShot = useCallback(() => {
    if (shotsForHole.length === 0) return;
    const lastShot = shotsForHole[shotsForHole.length - 1]!;
    Alert.alert('Remove Shot', `Remove shot ${lastShot.shotNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeShot(lastShot.id),
      },
    ]);
  }, [shotsForHole, removeShot]);

  // Polyline coordinates for connecting shots
  const polylineCoords = useMemo(
    () =>
      shotsForHole.map((s) => ({
        latitude: s.latitude,
        longitude: s.longitude,
      })),
    [shotsForHole],
  );

  // Hole selector data
  const holeNumbers = useMemo(
    () => Array.from({ length: holeCount }, (_, i) => i + 1),
    [holeCount],
  );

  const renderClubItem = useCallback(
    ({ item }: { item: ClubType }) => (
      <Pressable
        style={[
          styles.clubChip,
          item === selectedClubType && styles.clubChipActive,
        ]}
        onPress={() => setSelectedClubType(item)}
      >
        <Text
          style={[
            styles.clubChipText,
            item === selectedClubType && styles.clubChipTextActive,
          ]}
        >
          {CLUB_LABELS[item]}
        </Text>
      </Pressable>
    ),
    [selectedClubType],
  );

  const renderHoleItem = useCallback(
    ({ item }: { item: number }) => (
      <Pressable
        style={[
          styles.holeChip,
          item === selectedHole && styles.holeChipActive,
        ]}
        onPress={() => setSelectedHole(item)}
      >
        <Text
          style={[
            styles.holeChipText,
            item === selectedHole && styles.holeChipTextActive,
          ]}
        >
          {item}
        </Text>
      </Pressable>
    ),
    [selectedHole],
  );

  // No active round guard
  if (!activeRound) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={colors.textPrimary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Shot Tracker</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centered}>
          <MaterialCommunityIcons
            name="golf"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.noRoundTitle}>No Active Round</Text>
          <Text style={styles.noRoundSubtitle}>
            Start a round from the Play tab to use the shot tracker
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Shot Tracker</Text>
        {shotsForHole.length > 0 ? (
          <Pressable onPress={handleRemoveLastShot} hitSlop={8}>
            <MaterialCommunityIcons
              name="undo"
              size={22}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Hole selector */}
      <FlatList
        data={holeNumbers}
        horizontal
        keyExtractor={(item) => String(item)}
        renderItem={renderHoleItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.holeSelectorContent}
        style={styles.holeSelector}
      />

      {/* Map */}
      <View style={styles.mapContainer}>
        {locationLoading && !location ? (
          <View style={styles.centered}>
            <LoadingSpinner size={36} />
            <Text style={styles.loadingText}>Getting location...</Text>
          </View>
        ) : locationError && !location ? (
          <View style={styles.centered}>
            <MaterialCommunityIcons
              name="map-marker-off"
              size={48}
              color={colors.textSecondary}
            />
            <Text style={styles.noRoundTitle}>Location Unavailable</Text>
            <Text style={styles.noRoundSubtitle}>
              Enable location permissions in Settings to use the shot tracker
            </Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            mapType="satellite"
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton
            onPress={handleMapPress}
          >
            {/* Existing shots as numbered markers */}
            {shotsForHole.map((shot, index) => (
              <Marker
                key={shot.id}
                coordinate={{
                  latitude: shot.latitude,
                  longitude: shot.longitude,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker}>
                    <Text style={styles.markerText}>{index + 1}</Text>
                  </View>
                  {shotDistances[index] != null ? (
                    <Text style={styles.distanceLabel}>
                      {Math.round(shotDistances[index]!)} yds
                    </Text>
                  ) : null}
                </View>
              </Marker>
            ))}

            {/* Pending pin */}
            {pendingPin ? (
              <Marker coordinate={pendingPin} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={styles.pendingMarker}>
                  <MaterialCommunityIcons
                    name="plus-circle"
                    size={28}
                    color={colors.accent}
                  />
                </View>
              </Marker>
            ) : null}

            {/* Polyline connecting shots */}
            {polylineCoords.length >= 2 ? (
              <Polyline
                coordinates={polylineCoords}
                strokeColor={colors.accent}
                strokeWidth={2}
                lineDashPattern={[8, 4]}
              />
            ) : null}
          </MapView>
        )}
      </View>

      {/* Club picker */}
      <FlatList
        data={CLUB_OPTIONS}
        horizontal
        keyExtractor={(item) => item}
        renderItem={renderClubItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.clubPickerContent}
        style={styles.clubPicker}
      />

      {/* Confirm/cancel bar when pin is pending */}
      {pendingPin ? (
        <View style={styles.confirmBar}>
          <Pressable style={styles.cancelButton} onPress={handleCancelPin}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <View style={styles.confirmInfo}>
            <Text style={styles.confirmClub}>
              {CLUB_LABELS[selectedClubType]}
            </Text>
            <Text style={styles.confirmHole}>Hole {selectedHole}</Text>
          </View>
          <Pressable style={styles.confirmButton} onPress={handleConfirmShot}>
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.confirmButtonText}>Add Shot</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            Hole {selectedHole} · {shotsForHole.length} shot
            {shotsForHole.length !== 1 ? 's' : ''} · Tap map to add
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.title3,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 22,
  },
  holeSelector: {
    maxHeight: 40,
  },
  holeSelectorContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  holeChip: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeChipActive: {
    backgroundColor: colors.accent,
  },
  holeChipText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  holeChipTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xxl,
  },
  loadingText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  noRoundTitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  noRoundSubtitle: {
    ...typography.callout,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  distanceLabel: {
    ...typography.caption1,
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
    overflow: 'hidden',
  },
  pendingMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubPicker: {
    maxHeight: 44,
    borderTopWidth: 1,
    borderTopColor: colors.separatorLight,
    backgroundColor: colors.surface,
  },
  clubPickerContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  clubChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
  },
  clubChipActive: {
    backgroundColor: colors.accent,
  },
  clubChipText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  clubChipTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  confirmBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.separatorLight,
    gap: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelButtonText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  confirmInfo: {
    alignItems: 'center',
  },
  confirmClub: {
    ...typography.callout,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  confirmHole: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  confirmButtonText: {
    ...typography.callout,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  infoBar: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.separatorLight,
    alignItems: 'center',
  },
  infoText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
});
