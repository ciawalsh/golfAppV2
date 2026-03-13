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
      const profilePatch: Record<string, unknown> = {};
      const persistedProfile = { ...data };

      if (
        fallbackProfile.displayName &&
        data.displayName !== fallbackProfile.displayName
      ) {
        profilePatch.displayName = fallbackProfile.displayName;
      }
      if (fallbackProfile.email && data.email !== fallbackProfile.email) {
        profilePatch.email = fallbackProfile.email;
      }
      if (
        fallbackProfile.photoURL &&
        data.photoURL !== fallbackProfile.photoURL
      ) {
        profilePatch.photoURL = fallbackProfile.photoURL;
      }

      if (Object.keys(profilePatch).length > 0) {
        try {
          await setDoc(
            userRef,
            {
              ...profilePatch,
              lastLoginAt: serverTimestamp(),
            },
            { merge: true },
          );
          Object.assign(persistedProfile, profilePatch);
        } catch (err) {
          if (__DEV__)
            console.warn('Failed to update user profile metadata:', err);
        }
      } else {
        setDoc(
          userRef,
          { lastLoginAt: serverTimestamp() },
          { merge: true },
        ).catch((err) => {
          if (__DEV__) console.warn('Failed to update last login:', err);
        });
      }

      return {
        ...fallbackProfile,
        displayName:
          typeof persistedProfile.displayName === 'string' &&
          persistedProfile.displayName.trim()
            ? persistedProfile.displayName
            : fallbackProfile.displayName,
        photoURL:
          typeof persistedProfile.photoURL === 'string' &&
          persistedProfile.photoURL
            ? persistedProfile.photoURL
            : fallbackProfile.photoURL,
        createdAt: Number.isFinite(persistedProfile.createdAt?.toMillis?.())
          ? persistedProfile.createdAt.toMillis()
          : 0,
        subscription: persistedProfile.subscription ?? DEFAULT_SUBSCRIPTION,
        handicap:
          typeof persistedProfile.handicap === 'number' &&
          Number.isFinite(persistedProfile.handicap)
            ? persistedProfile.handicap
            : null,
        homeCourse:
          typeof persistedProfile.homeCourse === 'string'
            ? persistedProfile.homeCourse
            : null,
      };
    }

    // New user — create the profile doc before returning so downstream
    // rules that depend on it can succeed immediately.
    // Subscription is omitted here; only privileged backends should write it.
    await setDoc(userRef, {
      uid: fallbackProfile.uid,
      email: fallbackProfile.email,
      displayName: fallbackProfile.displayName,
      photoURL: fallbackProfile.photoURL,
      handicap: fallbackProfile.handicap,
      homeCourse: fallbackProfile.homeCourse,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
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
