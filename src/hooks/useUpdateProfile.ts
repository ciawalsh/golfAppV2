import { useMutation } from '@tanstack/react-query';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { COLLECTIONS } from '@/constants/collections';
import { useAuthStore } from '@/stores/authStore';
import { uploadImage } from '@/services/imageUpload';

interface ProfileUpdate {
  displayName?: string;
  handicap?: number | null;
  homeCourse?: string | null;
  avatarUri?: string | null;
}

export function useUpdateProfile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (update: ProfileUpdate) => {
      if (!user) throw new Error('Not authenticated');

      let photoURL = user.photoURL;

      // Upload avatar if changed
      if (update.avatarUri) {
        photoURL = await uploadImage(
          update.avatarUri,
          `users/${user.uid}/avatar.jpg`,
        );
      }

      // Build Firestore update
      const firestoreUpdate: Record<string, unknown> = {};
      if (update.displayName !== undefined) {
        firestoreUpdate.displayName = update.displayName;
      }
      if (update.handicap !== undefined) {
        firestoreUpdate.handicap = update.handicap;
      }
      if (update.homeCourse !== undefined) {
        firestoreUpdate.homeCourse = update.homeCourse;
      }
      if (photoURL !== user.photoURL) {
        firestoreUpdate.photoURL = photoURL;
      }

      // Write to Firestore
      if (Object.keys(firestoreUpdate).length > 0) {
        const userRef = doc(db, COLLECTIONS.USERS, user.uid);
        await updateDoc(userRef, firestoreUpdate);
      }

      // Update Firebase Auth profile if name or photo changed
      const currentUser = auth.currentUser;
      if (currentUser) {
        const authUpdate: { displayName?: string; photoURL?: string } = {};
        if (update.displayName && update.displayName !== user.displayName) {
          authUpdate.displayName = update.displayName;
        }
        if (photoURL && photoURL !== user.photoURL) {
          authUpdate.photoURL = photoURL;
        }
        if (Object.keys(authUpdate).length > 0) {
          await updateProfile(currentUser, authUpdate);
        }
      }

      // Update Zustand store
      setUser({
        ...user,
        displayName: update.displayName ?? user.displayName,
        handicap:
          update.handicap !== undefined ? update.handicap : user.handicap,
        homeCourse:
          update.homeCourse !== undefined ? update.homeCourse : user.homeCourse,
        photoURL: photoURL ?? user.photoURL,
      });
    },
  });
}
