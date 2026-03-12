import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { PostComment, FirestoreCommentData } from '@/types/community';

async function fetchComments(postId: string): Promise<PostComment[]> {
  const q = query(
    collection(db, COLLECTIONS.COMMUNITY_POSTS, postId, 'comments'),
    orderBy('createdAt', 'asc'),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as FirestoreCommentData;
      if (!data.text) return null;

      return {
        id: doc.id,
        userId: data.userId ?? '',
        userName: data.userName ?? 'Anonymous',
        userAvatar: data.userAvatar ?? null,
        text: data.text ?? '',
        createdAt: data.createdAt?.toMillis?.() ?? 0,
      } satisfies PostComment;
    })
    .filter((c): c is PostComment => c !== null);
}

export function usePostComments(postId: string) {
  const q = useQuery({
    queryKey: ['postComments', postId],
    queryFn: () => fetchComments(postId),
    staleTime: 60 * 1000,
    enabled: !!postId,
  });

  return {
    comments: q.data ?? [],
    isLoading: q.isLoading,
    error: q.error,
    refetch: q.refetch,
  };
}
