import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { Coach } from '@/types';

interface FirestoreCoachData {
  name?: string;
  bio?: string;
  profilePic?: string;
  image?: string;
  videoPitch?: string;
  live?: boolean;
  order?: number;
  stats?: Record<string, unknown>;
}

async function fetchCoaches(): Promise<Coach[]> {
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.GOLF_CENTER_COACHES),
  );

  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as FirestoreCoachData;
      // Skip empty/invalid docs
      if (!data.name) return null;

      const coach: Coach = {
        id: doc.id,
        name: data.name ?? '',
        bio: data.bio ?? '',
        profilePic: data.profilePic ?? '',
        image: data.image ?? '',
        videoPitch: data.videoPitch,
        live: data.live === true,
        order: Number.isFinite(data.order) ? (data.order as number) : 999,
        stats: data.stats,
      };
      return coach;
    })
    .filter((coach): coach is Coach => coach !== null && coach.live)
    .sort((a, b) => a.order - b.order);
}

export function useCoaches() {
  const query = useQuery({
    queryKey: ['coaches'],
    queryFn: fetchCoaches,
    staleTime: 30 * 60 * 1000, // 30 minutes — content rarely changes
  });

  return {
    coaches: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
