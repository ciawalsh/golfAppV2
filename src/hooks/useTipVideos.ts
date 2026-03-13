import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { fetchTipVideosCatalog } from '@/services/contentApi';
import { Video, VideoGenre } from '@/types';

export function useTipVideos() {
  const userId = useAuthStore((s) => s.user?.uid);
  const query = useQuery({
    queryKey: ['tip-videos', userId],
    queryFn: fetchTipVideosCatalog,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    enabled: !!userId,
  });

  return {
    tips: (query.data?.tips ?? []) as Video[],
    tipsByCategory: (query.data?.tipsByCategory ?? {}) as Record<
      string,
      Video[]
    >,
    genres: (query.data?.genres ?? []) as VideoGenre[],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
