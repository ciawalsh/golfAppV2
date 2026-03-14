import { useQueries } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/constants/collections';
import { db } from '@/lib/firebase';

export interface PublicProfile {
  displayName: string;
  photoURL: string | null;
  handicap: number | null;
  isPremium: boolean;
}

const DEFAULT_PROFILE: PublicProfile = {
  displayName: 'Anonymous',
  photoURL: null,
  handicap: null,
  isPremium: false,
};

class PublicProfileNotReadyError extends Error {
  constructor() {
    super('Public profile projection not ready');
  }
}

async function fetchPublicProfile(userId: string): Promise<PublicProfile> {
  const snap = await getDoc(doc(db, COLLECTIONS.PUBLIC_PROFILES, userId));
  if (!snap.exists()) {
    throw new PublicProfileNotReadyError();
  }

  const data = snap.data();
  return {
    displayName:
      typeof data.displayName === 'string' && data.displayName.trim()
        ? data.displayName
        : DEFAULT_PROFILE.displayName,
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    handicap:
      typeof data.handicap === 'number' && Number.isFinite(data.handicap)
        ? data.handicap
        : null,
    isPremium: data.isPremium === true,
  };
}

/**
 * Batch-fetch and cache public profiles for a list of user IDs.
 * Returns a Map<userId, PublicProfile>.
 * Each profile is cached independently with a 5-minute stale time.
 */
export function useUserProfiles(userIds: string[]): {
  profiles: Map<string, PublicProfile>;
  isLoading: boolean;
} {
  const uniqueIds = [
    ...new Set(userIds.map((userId) => userId.trim()).filter(Boolean)),
  ];

  const queries = useQueries({
    queries: uniqueIds.map((userId) => ({
      queryKey: ['publicProfile', userId],
      queryFn: () => fetchPublicProfile(userId),
      staleTime: 5 * 60 * 1000,
      enabled: userId.length > 0,
      retry: (failureCount: number, error: Error) =>
        error instanceof PublicProfileNotReadyError && failureCount < 3,
      retryDelay: 1000,
    })),
  });

  const profiles = new Map<string, PublicProfile>();
  uniqueIds.forEach((userId, index) => {
    profiles.set(userId, queries[index]?.data ?? DEFAULT_PROFILE);
  });

  return {
    profiles,
    isLoading: queries.some((query) => query.isLoading),
  };
}
