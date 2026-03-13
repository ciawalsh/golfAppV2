import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { useAuthStore } from '@/stores/authStore';
import { uploadImage } from '@/services/imageUpload';
import { createCommunityComment } from '@/services/communityApi';
import { CommunityPost } from '@/types/community';

// ── Create Post ──

interface CreatePostParams {
  text: string;
  imageUri: string | null;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ text, imageUri }: CreatePostParams) => {
      if (!user) throw new Error('Not authenticated');

      const postRef = doc(collection(db, COLLECTIONS.COMMUNITY_POSTS));
      const postId = postRef.id;

      let imageUrl: string | null = null;
      if (imageUri) {
        imageUrl = await uploadImage(
          imageUri,
          `community/posts/${postId}/${Date.now()}.jpg`,
        );
      }

      await setDoc(postRef, {
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL ?? null,
        userHandicap: user.handicap ?? null,
        text,
        imageUrl,
        likes: 0,
        commentCount: 0,
        likedBy: [],
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
    },
  });
}

// ── Like / Unlike Post ──

interface LikePostParams {
  postId: string;
  isLiked: boolean;
}

export function useLikePost() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.uid);

  return useMutation({
    mutationFn: async ({ postId, isLiked }: LikePostParams) => {
      if (!userId) throw new Error('Not authenticated');

      const postRef = doc(db, COLLECTIONS.COMMUNITY_POSTS, postId);

      if (isLiked) {
        // Unlike
        await updateDoc(postRef, {
          likedBy: arrayRemove(userId),
          likes: increment(-1),
        });
      } else {
        // Like
        await updateDoc(postRef, {
          likedBy: arrayUnion(userId),
          likes: increment(1),
        });
      }
    },
    // Optimistic update
    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ['communityFeed'] });
      await queryClient.cancelQueries({ queryKey: ['post', postId] });

      const previousData = queryClient.getQueryData(['communityFeed']);
      const previousPost = queryClient.getQueryData(['post', postId]);

      queryClient.setQueryData<
        | {
            pages: { posts: CommunityPost[]; lastDoc: unknown }[];
            pageParams: unknown[];
          }
        | undefined
      >(['communityFeed'], (old) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.map((post: CommunityPost) => {
              if (post.id !== postId || !userId) return post;
              return {
                ...post,
                likes: isLiked ? post.likes - 1 : post.likes + 1,
                likedBy: isLiked
                  ? post.likedBy.filter((id) => id !== userId)
                  : [...post.likedBy, userId],
              };
            }),
          })),
        };
      });

      // Also optimistically update the single-post query (detail screen)
      queryClient.setQueryData<CommunityPost | null | undefined>(
        ['post', postId],
        (old) => {
          if (!old || !userId) return old;
          return {
            ...old,
            likes: isLiked ? old.likes - 1 : old.likes + 1,
            likedBy: isLiked
              ? old.likedBy.filter((id) => id !== userId)
              : [...old.likedBy, userId],
          };
        },
      );

      return { previousData, previousPost };
    },
    onError: (_err, { postId }, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['communityFeed'], context.previousData);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(['post', postId], context.previousPost);
      }
    },
    onSettled: (_data, _err, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}

// ── Create Comment ──

interface CreateCommentParams {
  postId: string;
  text: string;
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async ({ postId, text }: CreateCommentParams) => {
      if (!user) throw new Error('Not authenticated');
      await createCommunityComment(postId, text);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
}
