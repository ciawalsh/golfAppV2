import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { fetchDormyVideosCatalog } from '@/services/contentApi';
import { Video, VideoGenre } from '@/types';

export function useDormyVideos() {
  const userId = useAuthStore((s) => s.user?.uid);
  const query = useQuery({
    queryKey: ['dormy-videos', userId],
    queryFn: fetchDormyVideosCatalog,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    enabled: !!userId,
  });

  return {
    videos: (query.data?.videos ?? []) as Video[],
    videosByCategory: (query.data?.videosByCategory ?? {}) as Record<
      string,
      Video[]
    >,
    genres: (query.data?.genres ?? []) as VideoGenre[],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
