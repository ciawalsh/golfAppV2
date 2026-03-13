import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { deleteRound } from '@/services/roundApi';
import { Round } from '@/types/golf';

export function useDeleteRound() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.uid);

  return useMutation({
    mutationFn: async (roundId: string) => {
      if (!userId) throw new Error('Not authenticated');
      await deleteRound(userId, roundId);
    },
    onMutate: async (roundId) => {
      if (!userId) return { previousRounds: undefined as Round[] | undefined };

      await queryClient.cancelQueries({ queryKey: ['rounds', userId] });

      const previousRounds = queryClient.getQueryData<Round[]>([
        'rounds',
        userId,
      ]);

      queryClient.setQueryData<Round[]>(['rounds', userId], (current) =>
        (current ?? []).filter((round) => round.id !== roundId),
      );

      return { previousRounds };
    },
    onError: (_error, _roundId, context) => {
      if (!userId || !context?.previousRounds) return;
      queryClient.setQueryData(['rounds', userId], context.previousRounds);
    },
    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: ['rounds', userId] });
    },
  });
}
