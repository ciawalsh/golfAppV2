import { useAuthStore } from '@/stores/authStore';
import { SubscriptionTier } from '@/types';

interface SubscriptionInfo {
  tier: SubscriptionTier;
  isPremium: boolean;
  isFreeTier: boolean;
}

/**
 * Derives subscription state from the auth store.
 * Used by content screens to gate premium content.
 */
export function useSubscription(): SubscriptionInfo {
  const tier = useAuthStore((s) => s.user?.subscription.tier) ?? 'free';

  return {
    tier,
    isPremium: tier !== 'free',
    isFreeTier: tier === 'free',
  };
}
