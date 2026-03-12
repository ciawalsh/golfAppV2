import { useEffect, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { UserProfile, DEFAULT_SUBSCRIPTION } from '@/types';

function buildProfileFromFirebaseUser(firebaseUser: User): UserProfile {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    displayName: firebaseUser.displayName ?? '',
    photoURL: firebaseUser.photoURL ?? null,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    subscription: DEFAULT_SUBSCRIPTION,
    handicap: null,
    homeCourse: null,
  };
}

async function createUserProfile(firebaseUser: User): Promise<UserProfile> {
  const fallbackProfile = buildProfileFromFirebaseUser(firebaseUser);

  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      // Best-effort update lastLoginAt — don't block auth on failure
      setDoc(
        userRef,
        { lastLoginAt: serverTimestamp() },
        { merge: true },
      ).catch((err) => {
        if (__DEV__) console.warn('Failed to update lastLoginAt:', err);
      });
      return {
        ...fallbackProfile,
        createdAt: Number.isFinite(data.createdAt?.toMillis?.())
          ? data.createdAt.toMillis()
          : 0,
        subscription: data.subscription ?? DEFAULT_SUBSCRIPTION,
        handicap:
          typeof data.handicap === 'number' && Number.isFinite(data.handicap)
            ? data.handicap
            : null,
        homeCourse:
          typeof data.homeCourse === 'string' ? data.homeCourse : null,
      };
    }

    // New user — create Firestore doc (best-effort)
    setDoc(userRef, {
      ...fallbackProfile,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    }).catch((err) => {
      if (__DEV__) console.warn('Failed to create user profile doc:', err);
    });

    return fallbackProfile;
  } catch (err) {
    // Firestore read failed (permissions, network) — still allow auth
    if (__DEV__) {
      console.warn('Firestore profile fetch failed, using fallback:', err);
    }
    return fallbackProfile;
  }
}

/**
 * App-level auth state listener.
 * Call this ONCE in the root layout (AuthGate).
 * Do NOT call from any other component.
 */
export function useAuthListener() {
  const { setUser, clearAuth } = useAuthStore();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let unsubscribe: (() => void) | undefined;

    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[useAuthListener] Registering onAuthStateChanged listener');
    }

    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMountedRef.current) return;

        if (firebaseUser) {
          try {
            const profile = await createUserProfile(firebaseUser);
            if (isMountedRef.current) {
              setUser(profile);
            }
          } catch (err) {
            if (__DEV__) {
              console.error('Error creating user profile:', err);
            }
            if (isMountedRef.current) {
              clearAuth();
            }
          }
        } else {
          clearAuth();
        }
      });
    } catch (err) {
      if (__DEV__) {
        console.error('Firebase auth listener failed to initialize:', err);
      }
      clearAuth();
    }

    return () => {
      isMountedRef.current = false;
      unsubscribe?.();
    };
  }, [setUser, clearAuth]);
}
