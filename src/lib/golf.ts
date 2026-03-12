import { DocumentData } from 'firebase/firestore';
import { GolfClub, GolfCourse, GolfTee, HoleInfo } from '@/types/golf';
import { colors } from '@/constants/colors';

/**
 * Haversine distance between two coordinates in yards.
 */
export function haversineDistanceYards(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const metres = R * c;

  return Math.round(metres * 1.09361); // metres to yards
}

/**
 * Haversine distance between two coordinates in miles.
 */
export function haversineDistanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const yards = haversineDistanceYards(lat1, lng1, lat2, lng2);
  return yards / 1760;
}

/**
 * Safely parse a Firestore string value to number.
 * Returns null for "N/D", empty strings, NaN, non-finite.
 */
export function parseFirestoreNumber(
  val: string | number | undefined | null,
): number | null {
  if (val == null || val === '') return null;
  if (typeof val === 'string' && val.trim().toUpperCase() === 'N/D')
    return null;
  // Handle comma decimals (e.g. "51,123" → "51.123")
  const cleaned = typeof val === 'string' ? val.replace(',', '.') : val;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

/**
 * Parse "Yes"/"No" string to boolean.
 */
export function parseAmenity(val: unknown): boolean {
  return String(val).toLowerCase() === 'yes';
}

/**
 * Normalize a raw golfClubs Firestore document to GolfClub.
 * Returns null if essential data is missing.
 *
 * NOTE: The club_name field may not exist in Firestore.
 * We try multiple field names and fall back to deriving from doc ID.
 */
export function normalizeClub(
  docId: string,
  data: DocumentData,
): GolfClub | null {
  const lat = parseFirestoreNumber(data.latitude);
  const lng = parseFirestoreNumber(data.longitude);

  // Try multiple possible field names for club name
  const clubName =
    data.club_name ?? data.clubName ?? data.name ?? data.course_name ?? '';

  if (!lat || !lng) return null;

  return {
    id: docId,
    clubName:
      typeof clubName === 'string' && clubName.trim() ? clubName.trim() : docId, // Fall back to doc ID if no name field
    city: data.city ?? '',
    state: data.state ?? '',
    country: data.country ?? '',
    latitude: lat,
    longitude: lng,
    phone: data.phone ?? '',
    website: data.website ?? '',
    amenities: {
      drivingRange: parseAmenity(data.driving_range),
      puttingGreen: parseAmenity(data.putting_green),
      motorCart: parseAmenity(data.motor_cart),
      clubRental: parseAmenity(data.golf_clubs_rental),
      lodging: parseAmenity(data.lodging_on_site),
      practiceBunker: parseAmenity(data.practice_bunker),
    },
  };
}

/**
 * Normalize a raw golfCourses Firestore document to GolfCourse.
 */
export function normalizeCourse(
  docId: string,
  data: DocumentData,
): GolfCourse | null {
  const par = parseFirestoreNumber(data.par);

  return {
    id: docId,
    courseId: data.course_id ?? data._id ?? docId,
    clubId: data.club_id ?? '',
    courseName: data.course_name ?? '',
    par: par ?? 72,
    courseType: data.course_type ?? '',
    guestPolicy: data.guest_policy ?? '',
    courseArchitect: data.course_architect ?? '',
    weekdayPrice: data.weekday_price ?? '',
    weekendPrice: data.weekend_price ?? '',
    twilightPrice: data.twilight_price ?? '',
  };
}

/**
 * Parse flat tee hole fields (hole1, hole1_par, hole1_handicap, ...)
 * into a structured HoleInfo array.
 */
function parseTeeHoles(tee: Record<string, unknown>): HoleInfo[] {
  const holes: HoleInfo[] = [];
  for (let i = 1; i <= 18; i++) {
    const yardage = parseFirestoreNumber(tee[`hole${i}`] as string);
    const par = parseFirestoreNumber(tee[`hole${i}_par`] as string);
    const strokeIndex = parseFirestoreNumber(
      tee[`hole${i}_handicap`] as string,
    );
    if (yardage != null && yardage > 0 && par != null && par > 0) {
      holes.push({
        holeNumber: i,
        yardage,
        par,
        strokeIndex: strokeIndex ?? i,
      });
    }
  }
  return holes;
}

/**
 * Normalize raw golfTees Firestore document to GolfTee[].
 * Each doc has a `tees` array with flat hole fields.
 */
export function normalizeTees(data: DocumentData): GolfTee[] {
  const rawTees = data.tees;
  if (!Array.isArray(rawTees)) return [];

  return rawTees
    .map((tee: Record<string, unknown>): GolfTee | null => {
      const holes = parseTeeHoles(tee);
      if (holes.length === 0) return null;

      const rating = parseFirestoreNumber(tee.rating as string);
      const slope = parseFirestoreNumber(tee.slope as string);
      const totalYardage = holes.reduce((sum, h) => sum + h.yardage, 0);

      return {
        teeColor: (tee.tee_color as string) ?? 'Unknown',
        teeName:
          (tee.tee_name as string) ?? (tee.tee_color as string) ?? 'Unknown',
        rating,
        slope,
        totalYardage,
        holes,
      };
    })
    .filter((t): t is GolfTee => t !== null);
}

/**
 * Get the theme color for a score relative to par.
 */
export function getScoreColor(toPar: number | null): string {
  if (toPar == null) return colors.scoreUnplayed;
  if (toPar <= -2) return colors.scoreEagle;
  if (toPar === -1) return colors.scoreBirdie;
  if (toPar === 0) return colors.scorePar;
  if (toPar === 1) return colors.scoreBogey;
  return colors.scoreDouble;
}

/**
 * Format a score-to-par number as a display string.
 * E.g. 0 → "E", +3 → "+3", -2 → "-2"
 */
export function formatToPar(toPar: number): string {
  if (toPar === 0) return 'E';
  return toPar > 0 ? `+${toPar}` : `${toPar}`;
}

/**
 * Calculate round stats from holes array.
 */
export function calculateRoundStats(
  holes: { score: number | null; par: number }[],
): { totalScore: number; toPar: number; through: number } {
  let totalScore = 0;
  let totalPar = 0;
  let through = 0;

  for (const hole of holes) {
    if (hole.score != null && Number.isFinite(hole.score)) {
      totalScore += hole.score;
      totalPar += hole.par;
      through++;
    }
  }

  return {
    totalScore,
    toPar: totalScore - totalPar,
    through,
  };
}
