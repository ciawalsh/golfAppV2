import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { cleanVideoUrl } from '@/lib/normalise';

/** Module-level cache for resolved URLs */
const urlCache = new Map<string, string>();

/** Firebase Storage REST API URL pattern */
const FIREBASE_STORAGE_RE =
  /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/(.+?)(\?|$)/;

/**
 * Check if a path has a media file extension.
 */
function hasMediaExtension(path: string): boolean {
  return /\.(mp4|m4v|mov|webm|mp3|m4a|aac)$/i.test(path);
}

/**
 * Extract the Storage path from a pre-resolved Firebase Storage download URL.
 * Returns the decoded path or null if the URL is not a Firebase Storage URL.
 *
 * Example:
 *   "https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?alt=media&token=..."
 *   → "path/to/file"
 */
function extractPathFromFirebaseUrl(url: string): string | null {
  const match = url.match(FIREBASE_STORAGE_RE);
  if (!match?.[1]) return null;
  return decodeURIComponent(match[1]);
}

/**
 * Extract the Storage path from a gs:// URL.
 * Returns the path after the bucket, or null if invalid.
 */
function extractPathFromGsUrl(url: string): string | null {
  const withoutScheme = url.replace('gs://', '');
  const slashIdx = withoutScheme.indexOf('/');
  if (slashIdx === -1) return null;
  return withoutScheme.substring(slashIdx + 1);
}

/**
 * Try getDownloadURL for a given Storage path.
 * Returns the download URL or null if it fails.
 */
async function tryGetDownloadUrl(path: string): Promise<string | null> {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch {
    return null;
  }
}

/**
 * Try resolving a Storage path, with .mp4 fallback if it has no extension.
 */
async function resolvePathWithFallback(path: string): Promise<string | null> {
  // 1. Try exact path
  const directUrl = await tryGetDownloadUrl(path);
  if (directUrl) return directUrl;

  // 2. If no extension, try with .mp4
  if (!hasMediaExtension(path)) {
    const mp4Url = await tryGetDownloadUrl(path + '.mp4');
    if (mp4Url) return mp4Url;
  }

  return null;
}

/**
 * Resolves a video/image URL to a fresh, signed download URL.
 *
 * Handles three input formats:
 * 1. **gs:// URLs** → resolved via Firebase Storage SDK
 * 2. **Pre-resolved Firebase Storage URLs** (https://firebasestorage.googleapis.com/...)
 *    → path extracted and RE-resolved via SDK for a fresh token
 * 3. **Other https:// URLs** → returned as-is
 *
 * For paths without a file extension, also tries appending .mp4.
 */
export async function resolveStorageUrl(
  rawUrl: string | undefined,
): Promise<string | null> {
  const url = cleanVideoUrl(rawUrl);
  if (!url) return null;

  // Check cache first
  const cached = urlCache.get(url);
  if (cached) return cached;

  let storagePath: string | null = null;

  if (url.startsWith('gs://')) {
    storagePath = extractPathFromGsUrl(url);
  } else if (url.startsWith('https://') || url.startsWith('http://')) {
    // Check if this is a pre-resolved Firebase Storage URL with a (possibly stale) token
    storagePath = extractPathFromFirebaseUrl(url);
    if (!storagePath) {
      // Not a Firebase Storage URL — return as-is (e.g. Flickr thumbnail)
      return url;
    }
  } else {
    return null;
  }

  if (!storagePath) return null;

  // Resolve via SDK (with .mp4 fallback)
  const resolved = await resolvePathWithFallback(storagePath);
  if (resolved) {
    urlCache.set(url, resolved);
    return resolved;
  }

  return null;
}

/** Clear the URL cache (useful for retries) */
export function clearUrlCache(): void {
  urlCache.clear();
}
