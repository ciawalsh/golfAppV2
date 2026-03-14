import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/constants/collections';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import type { VideoComment } from '@/types/community';

interface CreateVideoCommentParams {
  videoId: string;
  text: string;
}

interface ToggleVideoCommentLikeParams {
  videoId: string;
  commentId: string;
  isLiked: boolean;
}

export function useCreateVideoComment() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.uid);

  return useMutation({
    mutationFn: async ({ videoId, text }: CreateVideoCommentParams) => {
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const trimmedText = text.trim();
      if (!trimmedText) {
        throw new Error('Comment text is required');
      }

      const commentRef = doc(
        collection(db, COLLECTIONS.VIDEO_COMMENTS, videoId, 'comments'),
      );

      await setDoc(commentRef, {
        userId,
        text: trimmedText,
        likes: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: (_data, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: ['videoComments', videoId] });
    },
  });
}

export function useToggleVideoCommentLike() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.uid);

  return useMutation({
    mutationFn: async ({
      videoId,
      commentId,
      isLiked,
    }: ToggleVideoCommentLikeParams) => {
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const commentRef = doc(
        db,
        COLLECTIONS.VIDEO_COMMENTS,
        videoId,
        'comments',
        commentId,
      );

      await updateDoc(commentRef, {
        likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        likes: increment(isLiked ? -1 : 1),
      });
    },
    onMutate: async ({ videoId, commentId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['videoComments', videoId] });

      const previousComments = queryClient.getQueryData<VideoComment[]>([
        'videoComments',
        videoId,
      ]);

      queryClient.setQueryData<VideoComment[] | undefined>(
        ['videoComments', videoId],
        (currentComments) => {
          if (!currentComments || !userId) {
            return currentComments;
          }

          return currentComments.map((comment) => {
            if (comment.id !== commentId) {
              return comment;
            }

            return {
              ...comment,
              likes: isLiked ? comment.likes - 1 : comment.likes + 1,
              likedBy: isLiked
                ? comment.likedBy.filter((id) => id !== userId)
                : [...comment.likedBy, userId],
            };
          });
        },
      );

      return { previousComments };
    },
    onError: (_error, { videoId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          ['videoComments', videoId],
          context.previousComments,
        );
      }
    },
    onSettled: (_data, _error, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: ['videoComments', videoId] });
    },
  });
}
