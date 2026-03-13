import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { fetchCoachCoursesCatalog } from '@/services/contentApi';
import { Course } from '@/types';

export function useCoachCourses(coachId: string) {
  const userId = useAuthStore((s) => s.user?.uid);
  const query = useQuery({
    queryKey: ['coach-courses', coachId, userId],
    queryFn: () => fetchCoachCoursesCatalog(coachId),
    staleTime: 30 * 60 * 1000,
    enabled: !!coachId && !!userId,
  });

  return {
    courses: (query.data ?? []) as Course[],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
