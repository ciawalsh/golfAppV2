import { useState, useCallback, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import {
  GoogleSignin,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { UserProfile, DEFAULT_SUBSCRIPTION } from '@/types';

try {
  GoogleSignin.configure({
    webClientId:
      Constants.expoConfig?.extra?.googleSignInWebClientId ?? undefined,
    iosClientId:
      Constants.expoConfig?.extra?.googleSignInIosClientId ?? undefined,
  });
} catch (err) {
  if (__DEV__) {
    console.warn('GoogleSignin.configure failed:', err);
  }
}

/**
 * Build a UserProfile from the current Firebase Auth user.
 * Used by signUpWithEmail after reload() to capture the display name.
 */
async function createUserProfileFromCurrent(): Promise<UserProfile | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const fallback: UserProfile = {
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

  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        ...fallback,
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
      ...fallback,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    }).catch((err) => {
      if (__DEV__) console.warn('Failed to create user profile doc:', err);
    });

    return fallback;
  } catch (err) {
    if (__DEV__) {
      console.warn('Firestore profile fetch failed, using fallback:', err);
    }
    return fallback;
  }
}

/**
 * Auth action hooks — sign in, sign up, sign out.
 * Does NOT register any listeners. Use useAuthListener() in the root layout
 * for the onAuthStateChanged listener.
 */
export function useAuth() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, clearAuth } = useAuthStore();
  const isMountedRef = useRef(true);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign in failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { user } = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        // Set display name on Firebase Auth profile
        await updateProfile(user, { displayName });

        // The auth listener has already fired with a blank displayName.
        // Force a refresh: reload the current user and rebuild the profile.
        await auth.currentUser?.reload();
        if (isMountedRef.current) {
          const profile = await createUserProfileFromCurrent();
          if (profile && isMountedRef.current) {
            setUser(profile);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Sign up failed';
        setError(message);
        throw err;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [setUser],
  );

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        throw new Error('Google sign in was cancelled');
      }
      const idToken = response.data.idToken;
      if (!idToken) {
        throw new Error('No ID token from Google');
      }
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Google sign in failed';
      setError(message);
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = appleCredential;
      if (!identityToken) {
        throw new Error('No identity token from Apple');
      }

      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: identityToken,
      });
      await signInWithCredential(auth, credential);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Apple sign in failed';
      setError(message);
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      clearAuth();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [clearAuth]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithApple,
    signOut,
    clearError,
    isLoading,
    error,
  };
}
