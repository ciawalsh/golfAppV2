import { useInfiniteQuery } from '@tanstack/react-query';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { CommunityPost, FirestoreCommunityPostData } from '@/types/community';

const PAGE_SIZE = 10;

interface FeedPage {
  posts: CommunityPost[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

function mapFirestoreToPost(
  id: string,
  data: FirestoreCommunityPostData,
): CommunityPost | null {
  if (!data.text && !data.imageUrl) return null;

  return {
    id,
    userId: data.userId ?? '',
    userName: data.userName ?? 'Anonymous',
    userAvatar: data.userAvatar ?? null,
    userHandicap:
      typeof data.userHandicap === 'number' &&
      Number.isFinite(data.userHandicap)
        ? data.userHandicap
        : null,
    text: data.text ?? '',
    imageUrl: data.imageUrl ?? null,
    likes: Number.isFinite(data.likes) ? (data.likes as number) : 0,
    commentCount: Number.isFinite(data.commentCount)
      ? (data.commentCount as number)
      : 0,
    likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
    createdAt: data.createdAt?.toMillis?.() ?? 0,
  };
}

async function fetchFeedPage(
  lastDoc: QueryDocumentSnapshot<DocumentData> | null,
): Promise<FeedPage> {
  const q = lastDoc
    ? query(
        collection(db, COLLECTIONS.COMMUNITY_POSTS),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      )
    : query(
        collection(db, COLLECTIONS.COMMUNITY_POSTS),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE),
      );

  const snapshot = await getDocs(q);

  const posts = snapshot.docs
    .map((doc) => {
      const data = doc.data() as FirestoreCommunityPostData;
      return mapFirestoreToPost(doc.id, data);
    })
    .filter((p): p is CommunityPost => p !== null);

  return {
    posts,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
  };
}

export function useCommunityFeed() {
  const q = useInfiniteQuery({
    queryKey: ['communityFeed'],
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
    initialPageParam: null as QueryDocumentSnapshot<DocumentData> | null,
    getNextPageParam: (lastPage) => lastPage.lastDoc,
    staleTime: 2 * 60 * 1000,
  });

  const posts = q.data?.pages.flatMap((page) => page.posts) ?? [];

  return {
    posts,
    isLoading: q.isLoading,
    error: q.error,
    fetchNextPage: q.fetchNextPage,
    hasNextPage: q.hasNextPage,
    isFetchingNextPage: q.isFetchingNextPage,
    refetch: q.refetch,
  };
}
