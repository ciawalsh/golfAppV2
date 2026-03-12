import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { useAuthStore } from '@/stores/authStore';
import { uploadImage } from '@/services/imageUpload';
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

      const previousData = queryClient.getQueryData(['communityFeed']);

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

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['communityFeed'], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
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

      const batch = writeBatch(db);

      // Create comment doc
      const commentRef = doc(
        collection(db, COLLECTIONS.COMMUNITY_POSTS, postId, 'comments'),
      );
      batch.set(commentRef, {
        userId: user.uid,
        userName: user.displayName,
        userAvatar: user.photoURL ?? null,
        text,
        createdAt: serverTimestamp(),
      });

      // Increment comment count on parent post
      const postRef = doc(db, COLLECTIONS.COMMUNITY_POSTS, postId);
      batch.update(postRef, { commentCount: increment(1) });

      await batch.commit();
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      queryClient.invalidateQueries({ queryKey: ['communityFeed'] });
    },
  });
}
