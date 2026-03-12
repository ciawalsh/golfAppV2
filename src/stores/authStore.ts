import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types';
import { useRoundStore } from '@/stores/roundStore';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: user !== null,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      clearAuth: () => {
        // Clear active round to prevent cross-user data leakage
        useRoundStore.getState().abandonRound();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // isLoading intentionally excluded — must be true on restart
      // so splash screen waits for onAuthStateChanged to fire
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
