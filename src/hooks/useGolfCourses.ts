import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { normalizeCourse } from '@/lib/golf';
import { GolfCourse } from '@/types/golf';

async function fetchCoursesForClub(clubId: string): Promise<GolfCourse[]> {
  const q = query(
    collection(db, COLLECTIONS.GOLF_COURSES),
    where('club_id', '==', clubId),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => normalizeCourse(doc.id, doc.data()))
    .filter((c): c is GolfCourse => c !== null);
}

export function useGolfCourses(clubId: string) {
  const q = useQuery({
    queryKey: ['golfCourses', clubId],
    queryFn: () => fetchCoursesForClub(clubId),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: !!clubId,
  });

  return {
    courses: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
  };
}
