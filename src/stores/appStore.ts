import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  selectedInterests: string[];
  setOnboardingComplete: (complete: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setSelectedInterests: (interests: string[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      notificationsEnabled: false,
      selectedInterests: [],

      setOnboardingComplete: (hasCompletedOnboarding) =>
        set({ hasCompletedOnboarding }),

      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),

      setSelectedInterests: (selectedInterests) => set({ selectedInterests }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        notificationsEnabled: state.notificationsEnabled,
        selectedInterests: state.selectedInterests,
      }),
    },
  ),
);
