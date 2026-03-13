import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { fetchCoachesCatalog } from '@/services/contentApi';
import { Coach } from '@/types';

export function useCoaches() {
  const userId = useAuthStore((s) => s.user?.uid);
  const query = useQuery({
    queryKey: ['coaches', userId],
    queryFn: fetchCoachesCatalog,
    staleTime: 30 * 60 * 1000, // 30 minutes — content rarely changes
    enabled: !!userId,
  });

  return {
    coaches: (query.data ?? []) as Coach[],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
