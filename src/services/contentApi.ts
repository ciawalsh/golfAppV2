import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { Coach, Course, Video, VideoGenre } from '@/types';

interface CoachesResponse {
  coaches: Coach[];
}

interface CoachCoursesResponse {
  courses: Course[];
}

interface TipVideosResponse {
  tips: Video[];
  tipsByCategory: Record<string, Video[]>;
  genres: VideoGenre[];
}

interface DormyVideosResponse {
  videos: Video[];
  videosByCategory: Record<string, Video[]>;
  genres: VideoGenre[];
}

interface FirebaseCallableError {
  code?: unknown;
  message?: unknown;
}

function normaliseContentError(error: unknown, fallbackMessage: string): Error {
  if (__DEV__) {
    console.warn('[contentApi] callable failed:', error);
  }

  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as FirebaseCallableError).code ?? '')
      : '';

  if (code === 'functions/not-found' || code === 'not-found') {
    return new Error(
      'Learning content service is not deployed yet. Deploy Cloud Functions and try again.',
    );
  }

  if (code === 'functions/unavailable' || code === 'unavailable') {
    return new Error(
      'Learning content service is unavailable. Check your network connection and Functions deployment.',
    );
  }

  if (code === 'functions/unauthenticated' || code === 'unauthenticated') {
    return new Error('Please sign in again to load learning content.');
  }

  if (error instanceof Error && error.message) {
    return error;
  }

  return new Error(fallbackMessage);
}

export async function fetchCoachesCatalog(): Promise<Coach[]> {
  try {
    const callable = httpsCallable<Record<string, never>, CoachesResponse>(
      functions,
      'getCoachesCatalog',
    );
    const result = await callable({});
    return result.data.coaches ?? [];
  } catch (error) {
    throw normaliseContentError(error, 'Failed to load coaches.');
  }
}

export async function fetchCoachCoursesCatalog(
  coachId: string,
): Promise<Course[]> {
  try {
    const callable = httpsCallable<{ coachId: string }, CoachCoursesResponse>(
      functions,
      'getCoachCoursesCatalog',
    );
    const result = await callable({ coachId });
    return result.data.courses ?? [];
  } catch (error) {
    throw normaliseContentError(error, 'Failed to load courses.');
  }
}

export async function fetchTipVideosCatalog(): Promise<TipVideosResponse> {
  try {
    const callable = httpsCallable<Record<string, never>, TipVideosResponse>(
      functions,
      'getTipVideosCatalog',
    );
    const result = await callable({});
    return {
      tips: result.data.tips ?? [],
      tipsByCategory: result.data.tipsByCategory ?? {},
      genres: result.data.genres ?? [],
    };
  } catch (error) {
    throw normaliseContentError(error, 'Failed to load tips.');
  }
}

export async function fetchDormyVideosCatalog(): Promise<DormyVideosResponse> {
  try {
    const callable = httpsCallable<Record<string, never>, DormyVideosResponse>(
      functions,
      'getDormyVideosCatalog',
    );
    const result = await callable({});
    return {
      videos: result.data.videos ?? [],
      videosByCategory: result.data.videosByCategory ?? {},
      genres: result.data.genres ?? [],
    };
  } catch (error) {
    throw normaliseContentError(error, 'Failed to load Dormy content.');
  }
}
