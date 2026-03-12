import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { normaliseMinTierLevel, cleanVideoUrl } from '@/lib/normalise';
import { Course, Video } from '@/types';

interface FirestoreVideoData {
  id?: string;
  title?: string;
  video?: string;
  thumbnail?: string;
  image?: string;
  duration?: number | string;
  description?: string;
  type?: string;
  date?: string;
  minTierLevel?: number | string;
}

interface FirestoreCourseData {
  title?: string;
  image?: string;
  videos?: FirestoreVideoData[];
  minTierLevel?: number | string;
}

async function fetchCoachCourses(
  coachId: string,
  coachName: string,
): Promise<Course[]> {
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.GOLF_CENTER_COACHES, coachId, 'courses'),
  );

  return snapshot.docs
    .map((doc) => {
      const data = doc.data() as FirestoreCourseData;
      if (!data.title) return null;

      const videos: Video[] = (data.videos ?? [])
        .filter((v): v is FirestoreVideoData => !!v.title)
        .map((v) => {
          const videoUrl = cleanVideoUrl(v.video);
          // Legacy data uses either "thumbnail" or "image" for the thumbnail field
          const thumbnailUrl = v.thumbnail ?? v.image ?? '';
          // Duration is stored as a number (minutes) in Firestore
          const rawDuration = v.duration;
          const duration =
            typeof rawDuration === 'number'
              ? `${rawDuration} min`
              : rawDuration;

          return {
            id: v.id ?? doc.id + '_' + (v.title ?? ''),
            title: v.title ?? '',
            videoUrl,
            thumbnailUrl,
            duration,
            description: v.description,
            type: v.type,
            date: v.date,
            minTierLevel: normaliseMinTierLevel(v.minTierLevel),
          };
        });

      const course: Course = {
        id: doc.id,
        title: data.title ?? '',
        image: data.image,
        coachId,
        coachName,
        videos,
        minTierLevel: normaliseMinTierLevel(data.minTierLevel),
      };
      return course;
    })
    .filter((course): course is Course => course !== null);
}

export function useCoachCourses(coachId: string, coachName: string) {
  const query = useQuery({
    queryKey: ['coach-courses', coachId],
    queryFn: () => fetchCoachCourses(coachId, coachName),
    staleTime: 30 * 60 * 1000,
    enabled: !!coachId,
  });

  return {
    courses: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
