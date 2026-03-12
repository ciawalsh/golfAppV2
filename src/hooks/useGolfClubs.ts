import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { normalizeClub, haversineDistanceMiles } from '@/lib/golf';
import { GolfClub } from '@/types/golf';

async function fetchAllClubs(): Promise<GolfClub[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.GOLF_CLUBS));

  const clubs: GolfClub[] = [];

  // Log field names from first doc to help identify club_name field
  if (__DEV__ && snapshot.docs.length > 0) {
    const firstDoc = snapshot.docs[0]!;
    const fields = Object.keys(firstDoc.data());
    // eslint-disable-next-line no-console
    console.log('[useGolfClubs] Sample doc fields:', fields.join(', '));
    // eslint-disable-next-line no-console
    console.log(
      '[useGolfClubs] Sample doc data:',
      JSON.stringify(firstDoc.data()).slice(0, 500),
    );
  }

  for (const doc of snapshot.docs) {
    const club = normalizeClub(doc.id, doc.data());
    if (club) clubs.push(club);
  }

  return clubs;
}

/**
 * Search clubs by name, city, or state.
 * Optionally sorts by distance from user if coordinates provided.
 * Returns top 20 results.
 */
export function searchClubs(
  clubs: GolfClub[],
  query: string,
  userLat?: number | null,
  userLng?: number | null,
): GolfClub[] {
  const q = query.trim().toLowerCase();

  let results: GolfClub[];

  if (!q) {
    // No search query — show nearest clubs if location available
    if (userLat != null && userLng != null) {
      results = [...clubs].sort((a, b) => {
        const distA = haversineDistanceMiles(
          userLat,
          userLng,
          a.latitude,
          a.longitude,
        );
        const distB = haversineDistanceMiles(
          userLat,
          userLng,
          b.latitude,
          b.longitude,
        );
        return distA - distB;
      });
    } else {
      return [];
    }
  } else {
    results = clubs.filter(
      (club) =>
        club.clubName.toLowerCase().includes(q) ||
        club.city.toLowerCase().includes(q) ||
        club.state.toLowerCase().includes(q) ||
        club.country.toLowerCase().includes(q),
    );

    // Sort by distance if location available, otherwise alphabetical
    if (userLat != null && userLng != null) {
      results.sort((a, b) => {
        const distA = haversineDistanceMiles(
          userLat,
          userLng,
          a.latitude,
          a.longitude,
        );
        const distB = haversineDistanceMiles(
          userLat,
          userLng,
          b.latitude,
          b.longitude,
        );
        return distA - distB;
      });
    } else {
      results.sort((a, b) => a.clubName.localeCompare(b.clubName));
    }
  }

  return results.slice(0, 20);
}

export function useGolfClubs() {
  const query = useQuery({
    queryKey: ['golfClubs'],
    queryFn: fetchAllClubs,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours — static data
    gcTime: 48 * 60 * 60 * 1000,
  });

  return {
    clubs: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
