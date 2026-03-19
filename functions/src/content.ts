import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';
import { adminBucket, adminDb } from './admin';

type SubscriptionTier = 'free' | 'premium_monthly' | 'premium_annual';

interface Coach {
  id: string;
  name: string;
  bio: string;
  shortBio: string;
  profilePic: string;
  image: string;
  videoPitch?: string;
  live: boolean;
  order: number;
  stats?: Record<string, unknown>;
}

interface Course {
  id: string;
  title: string;
  image?: string;
  coachId: string;
  coachName: string;
  videos: Video[];
  minTierLevel: number;
}

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration?: string;
  description?: string;
  type?: string;
  date?: string;
  minTierLevel: number;
}

interface FirestoreCoachData {
  name?: string;
  bio?: string;
  shortBio?: string;
  profilePic?: string;
  image?: string;
  videoPitch?: string;
  live?: boolean;
  order?: number;
  stats?: Record<string, unknown>;
}

interface FirestoreCourseData {
  title?: string;
  image?: string;
  videos?: FirestoreVideoData[];
  minTierLevel?: number | string;
}

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

interface FirestoreGenreData {
  genres?: Array<{ type?: string; title?: string; image?: string }>;
}

const REGION = 'europe-west2';
const SIGNED_URL_TTL_MS = 12 * 60 * 60 * 1000;
const DORMY_KEYS = ['chatShow', 'caddieHour'] as const;
const TIP_KEYS = [
  'drivers',
  'irons',
  'wedges',
  'putting',
  'greenJacket',
] as const;
const FIREBASE_STORAGE_RE =
  /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/(.+?)(\?|$)/;
const GOOGLE_CLOUD_STORAGE_RE =
  /^https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+?)(\?|$)/;

interface StorageReference {
  bucket?: string;
  path: string;
}

interface SignedUrlOptions {
  allowOriginalUrlOnFailure?: boolean;
  allowDownloadTokenFallback?: boolean;
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function requireUid(request: { auth?: { uid?: string } }): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }
  return uid;
}

async function getUserTier(uid: string): Promise<SubscriptionTier> {
  const snap = await adminDb.collection('users').doc(uid).get();
  const tier = snap.data()?.subscription?.tier;
  if (tier === 'premium_monthly' || tier === 'premium_annual') {
    return tier;
  }
  return 'free';
}

function normaliseMinTierLevel(
  val: number | string | undefined | null,
): number {
  if (val == null) return 0;
  const num = typeof val === 'string' ? Number(val) : val;
  return Number.isFinite(num) ? num : 0;
}

function normaliseVideoType(type: string | undefined): string {
  if (!type) return 'unknown';
  const cleaned = type
    .replace(/['"\\]/g, '')
    .trim()
    .toLowerCase();
  const map: Record<string, string> = {
    driver: 'drivers',
    caddyhour: 'caddieHour',
    caddiehour: 'caddieHour',
    chatshow: 'chatShow',
    greenjacket: 'greenJacket',
  };
  return map[cleaned] ?? cleaned;
}

function cleanVideoUrl(url: string | undefined): string {
  if (!url) return '';
  return url.replace(/^['"]|['"]$/g, '').trim();
}

function canAccessContent(
  tier: SubscriptionTier,
  minTierLevel: number,
): boolean {
  return minTierLevel <= 1 || tier !== 'free';
}

function extractStorageReference(url: string): StorageReference | null {
  if (url.startsWith('gs://')) {
    const withoutScheme = url.replace('gs://', '');
    const slashIdx = withoutScheme.indexOf('/');
    if (slashIdx === -1) return null;
    return {
      bucket: withoutScheme.substring(0, slashIdx),
      path: withoutScheme.substring(slashIdx + 1),
    };
  }

  const firebaseMatch = url.match(FIREBASE_STORAGE_RE);
  if (firebaseMatch?.[1] && firebaseMatch[2]) {
    return {
      bucket: firebaseMatch[1],
      path: safeDecodeURIComponent(firebaseMatch[2]),
    };
  }

  const gcsMatch = url.match(GOOGLE_CLOUD_STORAGE_RE);
  if (gcsMatch?.[1] && gcsMatch[2]) {
    return {
      bucket: gcsMatch[1],
      path: safeDecodeURIComponent(gcsMatch[2]),
    };
  }

  // Some legacy content docs store Firebase Storage object paths directly,
  // e.g. "ProCoaches/andrew-murray.jpg", rather than full URLs.
  if (!/^[a-z]+:\/\//i.test(url)) {
    const decodedPath = safeDecodeURIComponent(url.replace(/^\/+/, ''))
      .replace(/^o\//, '')
      .replace(/^\/+/, '');

    if (decodedPath.includes('/')) {
      return { path: decodedPath };
    }
  }

  return null;
}

function sanitiseUrlForLog(url: string): string {
  return url.split('?')[0];
}

function getProjectIdFromEnv(): string | undefined {
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;

  if (process.env.FIREBASE_CONFIG) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_CONFIG) as {
        projectId?: string;
      };
      return parsed.projectId;
    } catch {
      return undefined;
    }
  }

  return undefined;
}

function addBucketVariants(
  target: Set<string>,
  bucketName: string | undefined,
) {
  if (!bucketName) return;

  target.add(bucketName);

  const firebasestorageMatch = bucketName.match(/^(.+)\.firebasestorage\.app$/);
  if (firebasestorageMatch?.[1]) {
    target.add(`${firebasestorageMatch[1]}.appspot.com`);
  }

  const appspotMatch = bucketName.match(/^(.+)\.appspot\.com$/);
  if (appspotMatch?.[1]) {
    target.add(`${appspotMatch[1]}.firebasestorage.app`);
  }
}

function getBucketCandidates(explicitBucket?: string): string[] {
  const buckets = new Set<string>();

  if (explicitBucket) {
    addBucketVariants(buckets, explicitBucket);
    return Array.from(buckets);
  }

  addBucketVariants(buckets, adminBucket.name);

  const projectId = getProjectIdFromEnv();
  if (projectId) {
    addBucketVariants(buckets, `${projectId}.appspot.com`);
    addBucketVariants(buckets, `${projectId}.firebasestorage.app`);
  }

  return Array.from(buckets);
}

function canonicaliseFirebaseDownloadUrl(url: string): string {
  const match = url.match(FIREBASE_STORAGE_RE);
  if (!match?.[1] || !match[2]) return url;

  const [, bucket, rawPath] = match;
  const queryIndex = url.indexOf('?');
  const query = queryIndex === -1 ? '' : url.slice(queryIndex);
  const path = safeDecodeURIComponent(rawPath);

  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}${query}`;
}

function buildFirebaseDownloadUrl(
  bucket: string,
  path: string,
  token: string,
): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${encodeURIComponent(token)}`;
}

async function getFirebaseDownloadTokenUrl(
  bucketName: string,
  path: string,
): Promise<string | null> {
  try {
    const file = getStorage().bucket(bucketName).file(path);
    const [metadata] = await file.getMetadata();
    const rawTokenSource =
      metadata.metadata?.firebaseStorageDownloadTokens ??
      (metadata as { firebaseStorageDownloadTokens?: string })
        .firebaseStorageDownloadTokens;

    if (typeof rawTokenSource !== 'string' || !rawTokenSource.trim()) {
      return null;
    }

    const token = rawTokenSource.split(',')[0]?.trim();
    if (!token) {
      return null;
    }

    return buildFirebaseDownloadUrl(bucketName, path, token);
  } catch {
    return null;
  }
}

async function signStorageUrl(
  rawUrl: string | undefined,
  options: SignedUrlOptions = {},
): Promise<string> {
  const url = cleanVideoUrl(rawUrl);
  if (!url) return '';

  const storageRef = extractStorageReference(url);
  if (!storageRef) {
    return url;
  }

  const { bucket, path } = storageRef;
  const candidates = /\.(mp4|m4v|mov|webm|mp3|m4a|aac)$/i.test(path)
    ? [path]
    : [path, `${path}.mp4`];
  const bucketCandidates = getBucketCandidates(bucket);

  for (const bucketName of bucketCandidates) {
    const activeBucket =
      bucketName === adminBucket.name
        ? adminBucket
        : getStorage().bucket(bucketName);

    for (const candidatePath of candidates) {
      try {
        const [signedUrl] = await activeBucket
          .file(candidatePath)
          .getSignedUrl({
            action: 'read',
            expires: Date.now() + SIGNED_URL_TTL_MS,
          });
        return signedUrl;
      } catch {
        // Try the next candidate.
      }

      if (options.allowDownloadTokenFallback) {
        const downloadUrl = await getFirebaseDownloadTokenUrl(
          bucketName,
          candidatePath,
        );
        if (downloadUrl) {
          return downloadUrl;
        }
      }
    }
  }

  logger.warn('Failed to resolve storage asset URL', {
    bucketCandidates,
    candidates,
    rawUrl: sanitiseUrlForLog(url),
  });

  if (options.allowOriginalUrlOnFailure && /^https?:\/\//i.test(url)) {
    return canonicaliseFirebaseDownloadUrl(url);
  }

  return '';
}

async function mapVideo(
  video: FirestoreVideoData,
  fallbackId: string,
  fallbackType: string,
  tier: SubscriptionTier,
): Promise<Video | null> {
  if (!video.title) return null;

  const minTierLevel = normaliseMinTierLevel(video.minTierLevel);
  const isEntitled = canAccessContent(tier, minTierLevel);

  return {
    id: video.id ?? fallbackId,
    title: video.title,
    videoUrl: isEntitled
      ? await signStorageUrl(video.video, {
          allowOriginalUrlOnFailure: minTierLevel <= 1,
          allowDownloadTokenFallback: minTierLevel <= 1,
        })
      : '',
    thumbnailUrl: await signStorageUrl(video.thumbnail ?? video.image, {
      allowOriginalUrlOnFailure: true,
      allowDownloadTokenFallback: true,
    }),
    duration:
      typeof video.duration === 'number'
        ? `${video.duration} min`
        : video.duration,
    description: video.description,
    type: normaliseVideoType(video.type ?? fallbackType),
    date: video.date,
    minTierLevel,
  };
}

export const getCoachesCatalog = onCall({ region: REGION }, async (request) => {
  requireUid(request);

  const snapshot = await adminDb.collection('golfCenterCoaches').get();
  const coaches = await Promise.all(
    snapshot.docs.map(async (coachDoc) => {
      const data = coachDoc.data() as FirestoreCoachData;
      if (!data.name || data.live !== true) return null;

      const coach: Coach = {
        id: coachDoc.id,
        name: data.name,
        bio: data.bio ?? '',
        shortBio: data.shortBio ?? '',
        // Legacy coach docs often already store public download URLs, sometimes
        // from older buckets. Preserve those if re-signing is not possible.
        profilePic: await signStorageUrl(data.profilePic, {
          allowOriginalUrlOnFailure: true,
          allowDownloadTokenFallback: true,
        }),
        image: await signStorageUrl(data.image, {
          allowOriginalUrlOnFailure: true,
          allowDownloadTokenFallback: true,
        }),
        videoPitch: await signStorageUrl(data.videoPitch, {
          allowOriginalUrlOnFailure: true,
          allowDownloadTokenFallback: true,
        }),
        live: true,
        order: Number.isFinite(data.order) ? (data.order as number) : 999,
        stats: data.stats,
      };
      return coach;
    }),
  );

  return {
    coaches: coaches
      .filter((coach): coach is Coach => coach !== null)
      .sort((a, b) => a.order - b.order),
  };
});

export const getCoachCoursesCatalog = onCall(
  { region: REGION },
  async (request) => {
    const uid = requireUid(request);
    const coachId = (request.data as { coachId?: string } | undefined)?.coachId;
    if (!coachId) {
      throw new HttpsError('invalid-argument', 'coachId is required.');
    }

    const tier = await getUserTier(uid);
    const coachSnap = await adminDb
      .collection('golfCenterCoaches')
      .doc(coachId)
      .get();
    const coachName = (coachSnap.data()?.name as string | undefined) ?? '';
    const snapshot = await adminDb
      .collection('golfCenterCoaches')
      .doc(coachId)
      .collection('courses')
      .get();

    const courses = await Promise.all(
      snapshot.docs.map(async (courseDoc) => {
        const data = courseDoc.data() as FirestoreCourseData;
        if (!data.title) return null;

        const videos = await Promise.all(
          (data.videos ?? []).map((video, index) =>
            mapVideo(
              video,
              `${coachId}_${courseDoc.id}_${index}`,
              courseDoc.id,
              tier,
            ),
          ),
        );

        const course: Course = {
          id: courseDoc.id,
          title: data.title,
          image: await signStorageUrl(data.image, {
            allowOriginalUrlOnFailure: true,
            allowDownloadTokenFallback: true,
          }),
          coachId,
          coachName,
          videos: videos.filter((video): video is Video => video !== null),
          minTierLevel: normaliseMinTierLevel(data.minTierLevel),
        };
        return course;
      }),
    );

    return {
      courses: courses.filter((course): course is Course => course !== null),
    };
  },
);

export const getTipVideosCatalog = onCall(
  { region: REGION },
  async (request) => {
    const uid = requireUid(request);
    const tier = await getUserTier(uid);

    const [videosSnapshot, genresSnapshot] = await Promise.all([
      adminDb.collection('golfCenterVideos').get(),
      adminDb.collection('golfCenterVideoGenres').get(),
    ]);

    const genres = await Promise.all(
      genresSnapshot.docs.flatMap((genreDoc) => {
        const data = genreDoc.data() as FirestoreGenreData;
        return (data.genres ?? []).map(async (genre) => ({
          type: normaliseVideoType(genre.type),
          title: genre.title ?? '',
          image: await signStorageUrl(genre.image),
        }));
      }),
    );

    const tipsByCategory: Record<string, Video[]> = {};
    const tips: Video[] = [];

    for (const videosDoc of videosSnapshot.docs) {
      const data = videosDoc.data() as Record<
        string,
        FirestoreVideoData[] | undefined
      >;
      for (const key of TIP_KEYS) {
        const entries = data[key];
        if (!Array.isArray(entries)) continue;

        const mapped = await Promise.all(
          entries.map((video, index) =>
            mapVideo(video, `tip_${videosDoc.id}_${key}_${index}`, key, tier),
          ),
        );
        const normalisedKey = normaliseVideoType(key);
        const categoryVideos = mapped.filter(
          (video): video is Video => video !== null,
        );
        tipsByCategory[normalisedKey] = [
          ...(tipsByCategory[normalisedKey] ?? []),
          ...categoryVideos,
        ];
        tips.push(...categoryVideos);
      }
    }

    return {
      tips,
      tipsByCategory,
      genres: genres.filter((genre) => !!genre.title),
    };
  },
);

export const getDormyVideosCatalog = onCall(
  { region: REGION },
  async (request) => {
    const uid = requireUid(request);
    const tier = await getUserTier(uid);

    const [videosSnapshot, genresSnapshot] = await Promise.all([
      adminDb.collection('dormyVideos').get(),
      adminDb.collection('dormyVideoGenres').get(),
    ]);

    const genres = await Promise.all(
      genresSnapshot.docs.flatMap((genreDoc) => {
        const data = genreDoc.data() as FirestoreGenreData;
        return (data.genres ?? []).map(async (genre) => ({
          type: normaliseVideoType(genre.type),
          title: genre.title ?? '',
          image: await signStorageUrl(genre.image),
        }));
      }),
    );

    const videosByCategory: Record<string, Video[]> = {};
    const videos: Video[] = [];

    for (const videosDoc of videosSnapshot.docs) {
      const data = videosDoc.data() as Record<
        string,
        FirestoreVideoData[] | undefined
      >;
      for (const key of DORMY_KEYS) {
        const entries = data[key] ?? data[key.toLowerCase()];
        if (!Array.isArray(entries)) continue;

        const mapped = await Promise.all(
          entries.map((video, index) =>
            mapVideo(video, `dormy_${videosDoc.id}_${key}_${index}`, key, tier),
          ),
        );
        const normalisedKey = normaliseVideoType(key);
        const categoryVideos = mapped.filter(
          (video): video is Video => video !== null,
        );
        videosByCategory[normalisedKey] = [
          ...(videosByCategory[normalisedKey] ?? []),
          ...categoryVideos,
        ];
        videos.push(...categoryVideos);
      }
    }

    return {
      videos,
      videosByCategory,
      genres: genres.filter((genre) => !!genre.title),
    };
  },
);
