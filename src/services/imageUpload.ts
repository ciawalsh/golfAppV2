import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Upload a local image to Firebase Storage and return the download URL.
 *
 * @param localUri - Local file URI from expo-image-picker
 * @param storagePath - Firebase Storage path (e.g. "community/posts/{id}/image.jpg")
 */
export async function uploadImage(
  localUri: string,
  storagePath: string,
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const storageRef = ref(storage, storagePath);

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, blob);

    uploadTask.on(
      'state_changed',
      null,
      (error) => reject(error),
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}
