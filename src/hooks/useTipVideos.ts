import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import {
  normaliseMinTierLevel,
  normaliseVideoType,
  cleanVideoUrl,
} from '@/lib/normalise';
import { Video, VideoGenre } from '@/types';

interface FirestoreTipData {
  id?: string;
  title?: string;
  video?: string;
  thumbnail?: string;
  image?: string;
  duration?: number | string;
  date?: string;
  type?: string;
  minTierLevel?: number | string;
}

interface FetchResult {
  tips: Video[];
  tipsByCategory: Record<string, Video[]>;
  genres: VideoGenre[];
}

const CATEGORY_KEYS = [
  'drivers',
  'irons',
  'wedges',
  'putting',
  'greenJacket',
] as const;

async function fetchTipVideos(): Promise<FetchResult> {
  // Fetch both collections in parallel
  const [videosSnapshot, genresSnapshot] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.GOLF_CENTER_VIDEOS)),
    getDocs(collection(db, COLLECTIONS.GOLF_CENTER_VIDEO_GENRES)),
  ]);

  // Parse genres
  const genres: VideoGenre[] = [];
  genresSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    const genreArray = data.genres;
    if (Array.isArray(genreArray)) {
      genreArray.forEach(
        (g: { type?: string; title?: string; image?: string }) => {
          if (g.type && g.title) {
            genres.push({
              type: normaliseVideoType(g.type),
              title: g.title,
              image: g.image ?? '',
            });
          }
        },
      );
    }
  });

  // Parse videos from the single doc
  const allTips: Video[] = [];
  const tipsByCategory: Record<string, Video[]> = {};

  videosSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    for (const key of CATEGORY_KEYS) {
      const arr = data[key];
      if (!Array.isArray(arr)) continue;

      const categoryVideos = arr
        .filter((v: FirestoreTipData): v is FirestoreTipData => !!v.title)
        .map((v: FirestoreTipData): Video => {
          const rawDuration = v.duration;
          return {
            id: v.id ?? `tip_${key}_${v.title}`,
            title: v.title ?? '',
            videoUrl: cleanVideoUrl(v.video),
            thumbnailUrl: v.thumbnail ?? v.image ?? '',
            duration:
              typeof rawDuration === 'number'
                ? `${rawDuration} min`
                : rawDuration,
            type: normaliseVideoType(v.type ?? key),
            date: v.date,
            minTierLevel: normaliseMinTierLevel(v.minTierLevel),
          };
        });

      const normalisedKey = normaliseVideoType(key);
      tipsByCategory[normalisedKey] = [
        ...(tipsByCategory[normalisedKey] ?? []),
        ...categoryVideos,
      ];
      allTips.push(...categoryVideos);
    }
  });

  return { tips: allTips, tipsByCategory, genres };
}

export function useTipVideos() {
  const query = useQuery({
    queryKey: ['tip-videos'],
    queryFn: fetchTipVideos,
    staleTime: 30 * 60 * 1000,
  });

  return {
    tips: query.data?.tips ?? [],
    tipsByCategory: query.data?.tipsByCategory ?? {},
    genres: query.data?.genres ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
