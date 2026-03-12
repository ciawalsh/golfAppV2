/** Normalized golf club (from golfClubs collection) */
export interface GolfClub {
  id: string;
  clubName: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  website: string;
  amenities: {
    drivingRange: boolean;
    puttingGreen: boolean;
    motorCart: boolean;
    clubRental: boolean;
    lodging: boolean;
    practiceBunker: boolean;
  };
}

/** Normalized golf course (from golfCourses collection) */
export interface GolfCourse {
  id: string;
  courseId: string;
  clubId: string;
  courseName: string;
  par: number;
  courseType: string;
  guestPolicy: string;
  courseArchitect: string;
  weekdayPrice: string;
  weekendPrice: string;
  twilightPrice: string;
}

/** Per-hole static info from tee data */
export interface HoleInfo {
  holeNumber: number;
  yardage: number;
  par: number;
  strokeIndex: number;
}

/** A single tee option with per-hole data */
export interface GolfTee {
  teeColor: string;
  teeName: string;
  rating: number | null;
  slope: number | null;
  totalYardage: number;
  holes: HoleInfo[];
}

/** Score entry for a single hole in a round */
export interface HoleScore {
  holeNumber: number;
  par: number;
  yardage: number;
  strokeIndex: number;
  score: number | null;
  putts: number | null;
}

/** A shot logged on the shot tracker */
export interface Shot {
  id: string;
  holeNumber: number;
  shotNumber: number;
  club: ClubType;
  latitude: number;
  longitude: number;
  distanceYards: number | null;
  timestamp: number;
}

/** Club types for shot tracker */
export type ClubType =
  | 'driver'
  | '3wood'
  | '5wood'
  | '7wood'
  | '2iron'
  | '3iron'
  | '4iron'
  | '5iron'
  | '6iron'
  | '7iron'
  | '8iron'
  | '9iron'
  | 'pw'
  | 'gw'
  | 'sw'
  | 'lw'
  | 'putter';

/** Display labels for club types */
export const CLUB_LABELS: Record<ClubType, string> = {
  driver: 'Driver',
  '3wood': '3W',
  '5wood': '5W',
  '7wood': '7W',
  '2iron': '2i',
  '3iron': '3i',
  '4iron': '4i',
  '5iron': '5i',
  '6iron': '6i',
  '7iron': '7i',
  '8iron': '8i',
  '9iron': '9i',
  pw: 'PW',
  gw: 'GW',
  sw: 'SW',
  lw: 'LW',
  putter: 'Putter',
};

/** A complete round (Firestore document shape) */
export interface Round {
  id: string;
  userId: string;
  clubId: string;
  courseId: string;
  courseName: string;
  clubName: string;
  teeColor: string;
  teeName: string;
  holeCount: 9 | 18;
  coursePar: number;
  rating: number | null;
  slope: number | null;
  totalScore: number;
  toPar: number;
  through: number;
  inProgress: boolean;
  startedAt: number;
  completedAt: number;
  holes: HoleScore[];
  shots: Shot[];
}
