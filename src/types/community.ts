import { Timestamp } from 'firebase/firestore';

/** Community post document from communityPosts/{postId} */
export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userHandicap: number | null;
  text: string;
  imageUrl: string | null;
  likes: number;
  commentCount: number;
  likedBy: string[];
  createdAt: number;
}

/** Comment document from communityPosts/{postId}/comments/{commentId} */
export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  text: string;
  createdAt: number;
}

/** Firestore raw shape for safe casting from doc.data() */
export interface FirestoreCommunityPostData {
  userId?: string;
  userName?: string;
  userAvatar?: string;
  userHandicap?: number | null;
  text?: string;
  imageUrl?: string;
  likes?: number;
  commentCount?: number;
  likedBy?: string[];
  createdAt?: Timestamp;
}

/** Firestore raw shape for comments */
export interface FirestoreCommentData {
  userId?: string;
  userName?: string;
  userAvatar?: string;
  text?: string;
  createdAt?: Timestamp;
}

/** Input for creating a new post */
export interface CreatePostInput {
  text: string;
  imageUri: string | null;
}
