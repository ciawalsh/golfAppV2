import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { useRoundStore } from '@/stores/roundStore';
import { persistRound } from '@/services/roundApi';
import { Round } from '@/types/golf';

/**
 * Debounced Firestore sync for the active round.
 * Writes the round document every 3 seconds after the last change.
 * Flushes immediately on app background or unmount.
 */
export function useRoundSync() {
  const isMountedRef = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRoundRef = useRef<Round | null>(null);

  const flush = useCallback(async () => {
    const round = pendingRoundRef.current;
    if (!round) return;

    // Bail if the round was completed or abandoned — prevents stale overwrites
    const { _syncCancelled } = useRoundStore.getState();
    if (_syncCancelled) {
      pendingRoundRef.current = null;
      return;
    }

    // Defensive: never write a completed round back via sync
    if (!round.inProgress) {
      pendingRoundRef.current = null;
      return;
    }

    pendingRoundRef.current = null;

    try {
      await persistRound(round);

      if (isMountedRef.current) {
        useRoundStore.getState().markSynced();
      }
    } catch {
      // Write failed — isDirty remains true, will retry on next change
    }
  }, []);

  const scheduleSync = useCallback(
    (round: Round, delayMs = 3000) => {
      pendingRoundRef.current = round;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        void flush();
      }, delayMs);
    },
    [flush],
  );

  useEffect(() => {
    isMountedRef.current = true;

    const currentState = useRoundStore.getState();
    if (
      currentState.isDirty &&
      currentState.activeRound &&
      currentState.activeRound.inProgress
    ) {
      scheduleSync(currentState.activeRound);
    }

    const unsubscribe = useRoundStore.subscribe((state) => {
      if (!state.isDirty || !state.activeRound) return;

      scheduleSync(state.activeRound);
    });

    // Flush on app background
    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        if (timerRef.current) clearTimeout(timerRef.current);
        flush();
      }
    });

    return () => {
      isMountedRef.current = false;
      unsubscribe();
      appStateSub.remove();

      // Flush on unmount
      if (timerRef.current) clearTimeout(timerRef.current);
      void flush();
    };
  }, [flush, scheduleSync]);
}
