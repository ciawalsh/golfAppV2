import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { normaliseMinTierLevel } from '@/lib/normalise';
import { Article } from '@/types';

interface FirestoreArticleData {
  title?: string;
  description?: string;
  image?: string;
  date?: unknown;
  type?: string;
  link?: string;
  minTierLevel?: number | string;
  location?: string;
}

function formatDate(raw: unknown): string {
  if (!raw) return '';
  // Firestore Timestamp
  if (typeof raw === 'object' && raw !== null && 'toDate' in raw) {
    const ts = raw as { toDate: () => Date };
    return ts.toDate().toISOString();
  }
  if (typeof raw === 'string') return raw;
  return '';
}

async function fetchArticles(): Promise<Article[]> {
  const q = query(
    collection(db, COLLECTIONS.ARTICLES),
    orderBy('date', 'desc'),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as FirestoreArticleData;
      if (!data.title) return null;

      // Only include articles with a description (original SweetSpot articles)
      // Exclude stale external-only articles with no description
      if (!data.description && data.type === 'EXTERNAL') return null;

      const article: Article = {
        id: doc.id,
        title: data.title ?? '',
        description: data.description,
        image: data.image,
        date: formatDate(data.date),
        type: data.type ?? 'internal',
        link: data.link,
        minTierLevel: normaliseMinTierLevel(data.minTierLevel),
        location: data.location,
      };
      return article;
    })
    .filter((a): a is Article => a !== null);
}

export function useArticles() {
  const result = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  return {
    articles: result.data ?? [],
    isLoading: result.isLoading,
    error: result.error,
    refetch: result.refetch,
  };
}
