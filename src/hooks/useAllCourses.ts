import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useCoaches } from '@/hooks/useCoaches';
import { fetchCoachCoursesCatalog } from '@/services/contentApi';
import { Course } from '@/types';

export interface CourseWithImage extends Course {
  displayImage: string;
  coachProfilePic: string;
}

export function useAllCourses() {
  const userId = useAuthStore((s) => s.user?.uid);
  const { coaches, isLoading: coachesLoading } = useCoaches();

  const courseQueries = useQueries({
    queries: coaches.map((coach) => ({
      queryKey: ['coach-courses', coach.id, userId],
      queryFn: () => fetchCoachCoursesCatalog(coach.id),
      staleTime: 30 * 60 * 1000,
      enabled: !!userId && !!coach.id,
    })),
  });

  const isLoading = coachesLoading || courseQueries.some((q) => q.isLoading);
  const error = courseQueries.find((q) => q.error)?.error ?? null;

  const courses = useMemo(() => {
    const result: CourseWithImage[] = [];
    courseQueries.forEach((q, i) => {
      const coach = coaches[i];
      const data = (q.data ?? []) as Course[];
      data.forEach((course) => {
        result.push({
          ...course,
          displayImage: course.image ?? coach?.image ?? '',
          coachProfilePic: coach?.profilePic ?? '',
        });
      });
    });
    return result;
  }, [courseQueries, coaches]);

  return { courses, isLoading, error };
}
