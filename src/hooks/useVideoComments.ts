import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { COLLECTIONS } from '@/constants/collections';
import { db } from '@/lib/firebase';
import type {
  FirestoreVideoCommentData,
  VideoComment,
} from '@/types/community';

const COMMENTS_LIMIT = 50;

async function fetchVideoComments(videoId: string): Promise<VideoComment[]> {
  const commentsQuery = query(
    collection(db, COLLECTIONS.VIDEO_COMMENTS, videoId, 'comments'),
    orderBy('createdAt', 'desc'),
    limit(COMMENTS_LIMIT),
  );
  const snapshot = await getDocs(commentsQuery);

  return snapshot.docs.map((commentDoc) => {
    const data = commentDoc.data() as FirestoreVideoCommentData;

    return {
      id: commentDoc.id,
      userId: data.userId ?? '',
      text: data.text ?? '',
      likes: Number.isFinite(data.likes) ? (data.likes as number) : 0,
      likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
      createdAt: data.createdAt?.toMillis?.() ?? 0,
    };
  });
}

export function useVideoComments(videoId: string | undefined) {
  const queryResult = useQuery({
    queryKey: ['videoComments', videoId],
    queryFn: () => fetchVideoComments(videoId!),
    enabled: !!videoId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    comments: queryResult.data ?? [],
    isLoading: queryResult.isLoading,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
}
