/**
 * Normalise minTierLevel from Firestore.
 * The legacy data stores this inconsistently as number or string.
 * Returns a safe number (0 if missing/invalid).
 */
export function normaliseMinTierLevel(
  val: number | string | undefined | null,
): number {
  if (val == null) return 0;
  const num = typeof val === 'string' ? Number(val) : val;
  return Number.isFinite(num) ? num : 0;
}

/**
 * Normalise video type strings from Firestore.
 * Handles known typos and inconsistencies:
 * - Escaped quotes: "\"drivers\"" → "drivers"
 * - Singular/plural: "driver" → "drivers"
 * - Case variants: "caddyHour" → "caddieHour"
 */
export function normaliseVideoType(type: string | undefined): string {
  if (!type) return 'unknown';

  let normalised = type
    .replace(/['"\\]/g, '')
    .trim()
    .toLowerCase();

  const typeMap: Record<string, string> = {
    driver: 'drivers',
    caddyhour: 'caddieHour',
    caddiehour: 'caddieHour',
    chatshow: 'chatShow',
    greenjacket: 'greenJacket',
  };

  return typeMap[normalised] ?? normalised;
}

/**
 * Clean a video URL string.
 * Trims whitespace, removes surrounding quotes if present.
 */
export function cleanVideoUrl(url: string | undefined): string {
  if (!url) return '';
  return url.replace(/^['"]|['"]$/g, '').trim();
}
