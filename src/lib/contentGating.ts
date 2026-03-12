import { SubscriptionTier } from '@/types';
import { normaliseMinTierLevel } from '@/lib/normalise';

/**
 * Check whether a user can access content based on their subscription tier
 * and the content's minimum tier level.
 *
 * Legacy tier mapping:
 * - 0 = free (Spectator)
 * - 1 = Caddie (ad-supported, treat as free for V2)
 * - 3 = Golf Nerd
 * - 4+ = premium (Golf Junky, Green Jacket)
 *
 * V2 simplified: minTierLevel <= 1 is free, >= 4 is premium.
 */
export function canAccessContent(
  userTier: SubscriptionTier,
  rawMinTierLevel: number | string | undefined,
): boolean {
  const minTier = normaliseMinTierLevel(rawMinTierLevel);
  if (minTier <= 1) return true;
  return userTier !== 'free';
}

/** Returns true if content requires a premium subscription */
export function isPremiumContent(
  rawMinTierLevel: number | string | undefined,
): boolean {
  return normaliseMinTierLevel(rawMinTierLevel) >= 4;
}
