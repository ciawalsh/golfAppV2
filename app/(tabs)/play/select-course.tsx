import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGolfClubs, searchClubs } from '@/hooks/useGolfClubs';
import { useGolfCourses } from '@/hooks/useGolfCourses';
import { useLocation } from '@/hooks/useLocation';
import { useRoundStore } from '@/stores/roundStore';
import { GolfClub } from '@/types/golf';
import { ClubSearchItem } from '@/components/ClubSearchItem';
import { LoadingSpinner } from '@/components/LoadingIndicator';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, borderRadius } from '@/constants/spacing';

export default function SelectCourseScreen() {
  const router = useRouter();
  const {
    clubs,
    isLoading: clubsLoading,
    error: clubsError,
    refetch: refetchClubs,
  } = useGolfClubs();
  const { location } = useLocation();
  const setSelectedClub = useRoundStore((s) => s.setSelectedClub);
  const setSelectedCourse = useRoundStore((s) => s.setSelectedCourse);
  const resetSetup = useRoundStore((s) => s.resetSetup);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch courses for the selected club
  const { courses, isLoading: coursesLoading } = useGolfCourses(
    selectedClubId ?? '',
  );

  const handleQueryChange = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(text);
    }, 300);
  }, []);

  const filteredClubs = useMemo(
    () =>
      searchClubs(
        clubs,
        debouncedQuery,
        location?.latitude,
        location?.longitude,
      ),
    [clubs, debouncedQuery, location],
  );

  const handleClubPress = useCallback(
    (club: GolfClub) => {
      setSelectedClub(club);
      setSelectedClubId(club.id);
    },
    [setSelectedClub],
  );

  // When courses load for the selected club, handle navigation
  const handleCourseSelection = useCallback(() => {
    if (coursesLoading || !selectedClubId) return;

    const club = clubs.find((c) => c.id === selectedClubId);
    if (!club) return;

    if (courses.length === 0) {
      Alert.alert('No Courses', 'No course data found for this club.');
      setSelectedClubId(null);
      return;
    }

    if (courses.length === 1) {
      const course = courses[0]!;
      setSelectedCourse(course);
      router.push({
        pathname: '/play/select-tee',
        params: {
          clubId: club.id,
          courseId: course.courseId,
          courseName: course.courseName,
          clubName: club.clubName,
        },
      });
      setSelectedClubId(null);
      return;
    }

    // Multiple courses: show picker
    const options = courses.map((c) => c.courseName);
    Alert.alert('Select Course', 'This club has multiple courses:', [
      ...options.map((name, index) => ({
        text: name,
        onPress: () => {
          const course = courses[index]!;
          setSelectedCourse(course);
          router.push({
            pathname: '/play/select-tee',
            params: {
              clubId: club.id,
              courseId: course.courseId,
              courseName: course.courseName,
              clubName: club.clubName,
            },
          });
          setSelectedClubId(null);
        },
      })),
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => setSelectedClubId(null),
      },
    ]);
  }, [
    courses,
    coursesLoading,
    selectedClubId,
    clubs,
    setSelectedCourse,
    router,
  ]);

  // Trigger course selection logic when courses finish loading
  useEffect(() => {
    if (selectedClubId && !coursesLoading && courses.length >= 0) {
      handleCourseSelection();
    }
  }, [courses, coursesLoading, selectedClubId, handleCourseSelection]);

  const renderItem = useCallback(
    ({ item }: { item: GolfClub }) => (
      <ClubSearchItem
        club={item}
        userLat={location?.latitude}
        userLng={location?.longitude}
        onPress={() => handleClubPress(item)}
      />
    ),
    [location, handleClubPress],
  );

  const keyExtractor = useCallback((item: GolfClub) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            resetSetup();
            router.back();
          }}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textPrimary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Select Course</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.textSecondary}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clubs by name or location..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleQueryChange}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => {
              setQuery('');
              setDebouncedQuery('');
            }}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {clubsLoading ? (
        <View style={styles.centered}>
          <LoadingSpinner size={36} />
          <Text style={styles.loadingText}>Loading clubs...</Text>
        </View>
      ) : clubsError ? (
        <ErrorState message="Failed to load clubs" onRetry={refetchClubs} />
      ) : selectedClubId && coursesLoading ? (
        <View style={styles.centered}>
          <LoadingSpinner size={36} />
          <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
      ) : filteredClubs.length === 0 && debouncedQuery.length > 0 ? (
        <EmptyState
          icon="magnify"
          title="No clubs found"
          subtitle="Try a different search term"
        />
      ) : filteredClubs.length === 0 && debouncedQuery.length === 0 ? (
        <EmptyState
          icon="golf"
          title="Search for a golf club"
          subtitle="Type a club name, city, or country to find your course"
        />
      ) : (
        <FlatList
          data={filteredClubs}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={Separator}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
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
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    minHeight: 44,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.separatorLight,
    marginLeft: spacing.lg,
  },
});
