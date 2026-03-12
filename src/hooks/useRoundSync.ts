import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { useRoundStore } from '@/stores/roundStore';
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

    pendingRoundRef.current = null;

    try {
      const roundRef = doc(
        db,
        COLLECTIONS.USERS,
        round.userId,
        'rounds',
        round.id,
      );
      await setDoc(roundRef, round, { merge: true });

      if (isMountedRef.current) {
        useRoundStore.getState().markSynced();
      }
    } catch {
      // Write failed — isDirty remains true, will retry on next change
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = useRoundStore.subscribe((state) => {
      if (!state.isDirty || !state.activeRound) return;

      pendingRoundRef.current = state.activeRound;

      // Clear previous timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // Debounce 3 seconds
      timerRef.current = setTimeout(() => {
        flush();
      }, 3000);
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
      flush();
    };
  }, [flush]);
}
