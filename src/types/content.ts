/** Coach profile from golfCenterCoaches collection */
export interface Coach {
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

/** Course from a coach's courses subcollection */
export interface Course {
  id: string;
  title: string;
  image?: string;
  coachId: string;
  coachName: string;
  videos: Video[];
  minTierLevel: number;
}

/** Individual video/lesson */
export interface Video {
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

/** Genre/category metadata */
export interface VideoGenre {
  type: string;
  title: string;
  image: string;
}

/** Article from the articles collection */
export interface Article {
  id: string;
  title: string;
  description?: string;
  image?: string;
  date: string;
  type: string;
  link?: string;
  minTierLevel: number;
  location?: string;
}

/** RSS feed item (normalised from parsed RSS) */
export interface RssItem {
  id: string;
  title: string;
  link: string;
  description?: string;
  imageUrl?: string;
  publishedDate: string;
  source: string;
}

export type ContentSection = 'courses' | 'tips' | 'dormy';

/** Canonical video category types after normalisation */
export type VideoCategory =
  | 'drivers'
  | 'irons'
  | 'wedges'
  | 'putting'
  | 'greenJacket'
  | 'chatShow'
  | 'caddieHour';
