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

interface FirestoreDormyVideo {
  id?: string;
  title?: string;
  video?: string;
  thumbnail?: string;
  duration?: string;
  date?: string;
  type?: string;
  minTierLevel?: number | string;
}

interface FetchResult {
  videos: Video[];
  videosByCategory: Record<string, Video[]>;
  genres: VideoGenre[];
}

const DORMY_KEYS = ['chatShow', 'caddieHour'] as const;

async function fetchDormyVideos(): Promise<FetchResult> {
  const [videosSnapshot, genresSnapshot] = await Promise.all([
    getDocs(collection(db, COLLECTIONS.DORMY_VIDEOS)),
    getDocs(collection(db, COLLECTIONS.DORMY_VIDEO_GENRES)),
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

  // Parse videos
  const allVideos: Video[] = [];
  const videosByCategory: Record<string, Video[]> = {};

  videosSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    for (const key of DORMY_KEYS) {
      // Also check lowercase variants
      const arr = data[key] ?? data[key.toLowerCase()];
      if (!Array.isArray(arr)) continue;

      const categoryVideos = arr
        .filter((v: FirestoreDormyVideo): v is FirestoreDormyVideo => !!v.title)
        .map(
          (v: FirestoreDormyVideo): Video => ({
            id: v.id ?? `dormy_${key}_${v.title}`,
            title: v.title ?? '',
            videoUrl: cleanVideoUrl(v.video),
            thumbnailUrl: v.thumbnail ?? '',
            duration: v.duration,
            type: normaliseVideoType(v.type ?? key),
            date: v.date,
            minTierLevel: normaliseMinTierLevel(v.minTierLevel ?? 4),
          }),
        );

      const normalisedKey = normaliseVideoType(key);
      videosByCategory[normalisedKey] = [
        ...(videosByCategory[normalisedKey] ?? []),
        ...categoryVideos,
      ];
      allVideos.push(...categoryVideos);
    }
  });

  return { videos: allVideos, videosByCategory, genres };
}

export function useDormyVideos() {
  const query = useQuery({
    queryKey: ['dormy-videos'],
    queryFn: fetchDormyVideos,
    staleTime: 30 * 60 * 1000,
  });

  return {
    videos: query.data?.videos ?? [],
    videosByCategory: query.data?.videosByCategory ?? {},
    genres: query.data?.genres ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
