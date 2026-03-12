import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GolfClub, GolfCourse, GolfTee, Round, Shot } from '@/types/golf';
import { calculateRoundStats } from '@/lib/golf';

interface RoundState {
  // Setup flow (NOT persisted — ephemeral)
  selectedClub: GolfClub | null;
  selectedCourse: GolfCourse | null;
  selectedTee: GolfTee | null;

  // Active round (persisted)
  activeRound: Round | null;
  currentHoleIndex: number;
  isDirty: boolean;

  // Sync cancellation flag (NOT persisted — ephemeral runtime state)
  _syncCancelled: boolean;

  // Actions — setup
  setSelectedClub: (club: GolfClub | null) => void;
  setSelectedCourse: (course: GolfCourse | null) => void;
  setSelectedTee: (tee: GolfTee | null) => void;
  resetSetup: () => void;

  // Actions — round
  startRound: (round: Round) => void;
  setScore: (holeIndex: number, score: number) => void;
  clearScore: (holeIndex: number) => void;
  setPutts: (holeIndex: number, putts: number | null) => void;
  goToHole: (holeIndex: number) => void;
  nextHole: () => void;
  prevHole: () => void;
  completeRound: () => Round | null;
  abandonRound: () => void;
  markSynced: () => void;

  // Actions — shots
  addShot: (shot: Shot) => void;
  removeShot: (shotId: string) => void;
}

function recalculate(round: Round): Round {
  const stats = calculateRoundStats(round.holes);
  return {
    ...round,
    totalScore: stats.totalScore,
    toPar: stats.toPar,
    through: stats.through,
  };
}

export const useRoundStore = create<RoundState>()(
  persist(
    (set, get) => ({
      // Setup state
      selectedClub: null,
      selectedCourse: null,
      selectedTee: null,

      // Round state
      activeRound: null,
      currentHoleIndex: 0,
      isDirty: false,
      _syncCancelled: false,

      // Setup actions
      setSelectedClub: (club) => set({ selectedClub: club }),
      setSelectedCourse: (course) => set({ selectedCourse: course }),
      setSelectedTee: (tee) => set({ selectedTee: tee }),
      resetSetup: () =>
        set({
          selectedClub: null,
          selectedCourse: null,
          selectedTee: null,
        }),

      // Round actions
      startRound: (round) =>
        set({
          activeRound: round,
          currentHoleIndex: 0,
          isDirty: true,
          _syncCancelled: false,
        }),

      setScore: (holeIndex, score) => {
        const { activeRound } = get();
        if (!activeRound) return;

        const holes = activeRound.holes.map((h, i) =>
          i === holeIndex ? { ...h, score } : h,
        );
        const updated = recalculate({ ...activeRound, holes });

        set({ activeRound: updated, isDirty: true });
      },

      clearScore: (holeIndex) => {
        const { activeRound } = get();
        if (!activeRound) return;

        const holes = activeRound.holes.map((h, i) =>
          i === holeIndex ? { ...h, score: null, putts: null } : h,
        );
        const updated = recalculate({ ...activeRound, holes });

        set({ activeRound: updated, isDirty: true });
      },

      setPutts: (holeIndex, putts) => {
        const { activeRound } = get();
        if (!activeRound) return;

        const holes = activeRound.holes.map((h, i) =>
          i === holeIndex ? { ...h, putts } : h,
        );
        set({ activeRound: { ...activeRound, holes }, isDirty: true });
      },

      goToHole: (holeIndex) => {
        const { activeRound } = get();
        if (!activeRound) return;

        const maxIndex = activeRound.holes.length - 1;
        const clamped = Math.max(0, Math.min(holeIndex, maxIndex));
        set({ currentHoleIndex: clamped });
      },

      nextHole: () => {
        const { activeRound, currentHoleIndex } = get();
        if (!activeRound) return;

        const maxIndex = activeRound.holes.length - 1;
        if (currentHoleIndex < maxIndex) {
          set({ currentHoleIndex: currentHoleIndex + 1 });
        }
      },

      prevHole: () => {
        const { currentHoleIndex } = get();
        if (currentHoleIndex > 0) {
          set({ currentHoleIndex: currentHoleIndex - 1 });
        }
      },

      completeRound: () => {
        const { activeRound } = get();
        if (!activeRound) return null;

        const completed: Round = {
          ...activeRound,
          inProgress: false,
          completedAt: Date.now(),
        };

        set({
          activeRound: null,
          currentHoleIndex: 0,
          isDirty: false,
          _syncCancelled: true,
        });

        return completed;
      },

      abandonRound: () =>
        set({
          activeRound: null,
          currentHoleIndex: 0,
          isDirty: false,
          _syncCancelled: true,
          selectedClub: null,
          selectedCourse: null,
          selectedTee: null,
        }),

      markSynced: () => set({ isDirty: false }),

      // Shot actions
      addShot: (shot) => {
        const { activeRound } = get();
        if (!activeRound) return;

        set({
          activeRound: {
            ...activeRound,
            shots: [...activeRound.shots, shot],
          },
          isDirty: true,
        });
      },

      removeShot: (shotId) => {
        const { activeRound } = get();
        if (!activeRound) return;

        set({
          activeRound: {
            ...activeRound,
            shots: activeRound.shots.filter((s) => s.id !== shotId),
          },
          isDirty: true,
        });
      },
    }),
    {
      name: 'round-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the active round state — setup selections are ephemeral
      partialize: (state) => ({
        activeRound: state.activeRound,
        currentHoleIndex: state.currentHoleIndex,
        isDirty: state.isDirty,
      }),
    },
  ),
);
