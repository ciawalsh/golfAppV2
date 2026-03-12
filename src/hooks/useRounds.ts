import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { useAuthStore } from '@/stores/authStore';
import { Round } from '@/types/golf';

async function fetchUserRounds(userId: string): Promise<Round[]> {
  const q = query(
    collection(db, COLLECTIONS.USERS, userId, 'rounds'),
    orderBy('startedAt', 'desc'),
    limit(20),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId ?? userId,
      clubId: data.clubId ?? '',
      courseId: data.courseId ?? '',
      courseName: data.courseName ?? '',
      clubName: data.clubName ?? '',
      teeColor: data.teeColor ?? '',
      teeName: data.teeName ?? '',
      holeCount: data.holeCount === 9 ? 9 : 18,
      coursePar: Number.isFinite(data.coursePar) ? data.coursePar : 72,
      rating: Number.isFinite(data.rating) ? data.rating : null,
      slope: Number.isFinite(data.slope) ? data.slope : null,
      totalScore: Number.isFinite(data.totalScore) ? data.totalScore : 0,
      toPar: Number.isFinite(data.toPar) ? data.toPar : 0,
      through: Number.isFinite(data.through) ? data.through : 0,
      inProgress: data.inProgress ?? false,
      startedAt: Number.isFinite(data.startedAt) ? data.startedAt : 0,
      completedAt: Number.isFinite(data.completedAt) ? data.completedAt : 0,
      holes: Array.isArray(data.holes) ? data.holes : [],
      shots: Array.isArray(data.shots) ? data.shots : [],
    } satisfies Round;
  });
}

export function useRounds() {
  const userId = useAuthStore((s) => s.user?.uid);

  const q = useQuery({
    queryKey: ['rounds', userId],
    queryFn: () => fetchUserRounds(userId!),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });

  return {
    rounds: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
