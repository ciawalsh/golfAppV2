import { Timestamp } from 'firebase/firestore';

/** Comment on a video lesson — videoComments/{videoId}/comments/{commentId} */
export interface VideoComment {
  id: string;
  userId: string;
  text: string;
  likes: number;
  likedBy: string[];
  createdAt: number;
}

/** Firestore raw shape for video comments */
export interface FirestoreVideoCommentData {
  userId?: string;
  text?: string;
  likes?: number;
  likedBy?: string[];
  createdAt?: Timestamp;
}
