export type SubscriptionTier = 'free' | 'premium_monthly' | 'premium_annual';

// Re-export content types
export type {
  Coach,
  Course,
  Video,
  VideoGenre,
  Article,
  RssItem,
  ContentSection,
  VideoCategory,
} from './content';

// Re-export golf types
export type {
  GolfClub,
  GolfCourse,
  GolfTee,
  HoleInfo,
  HoleScore,
  Shot,
  ClubType,
  Round,
} from './golf';
export { CLUB_LABELS } from './golf';

// Re-export discussion types
export type { VideoComment, FirestoreVideoCommentData } from './community';

export type SubscriptionStatus =
  | 'active'
  | 'expired'
  | 'cancelled'
  | 'grace_period'
  | 'billing_retry'
  | 'revoked';

export interface SubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  productId: string | null;
  expiresAt: number;
  purchasedAt: number;
  platform: 'ios' | 'android' | null;
  originalTransactionId: string | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: number;
  lastLoginAt: number;
  subscription: SubscriptionState;
  handicap: number | null;
  homeCourse: string | null;
}

export interface AppPreferences {
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  selectedInterests: string[];
}

export const DEFAULT_SUBSCRIPTION: SubscriptionState = {
  tier: 'free',
  status: 'active',
  productId: null,
  expiresAt: 0,
  purchasedAt: 0,
  platform: null,
  originalTransactionId: null,
};
