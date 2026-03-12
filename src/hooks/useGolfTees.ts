import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { normalizeTees } from '@/lib/golf';
import { GolfTee } from '@/types/golf';

async function fetchTeesForCourse(courseId: string): Promise<GolfTee[]> {
  const docRef = doc(db, COLLECTIONS.GOLF_TEES, courseId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return [];

  return normalizeTees(snapshot.data());
}

export function useGolfTees(courseId: string) {
  const q = useQuery({
    queryKey: ['golfTees', courseId],
    queryFn: () => fetchTeesForCourse(courseId),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!courseId,
  });

  return {
    tees: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
