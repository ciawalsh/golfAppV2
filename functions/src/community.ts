import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { adminDb } from './admin';

const REGION = 'europe-west2';

function requireUid(request: { auth?: { uid?: string } }): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'Authentication required.');
  }
  return uid;
}

interface CreateCommunityCommentRequest {
  postId?: string;
  text?: string;
}

export const createCommunityComment = onCall(
  { region: REGION },
  async (request) => {
    const uid = requireUid(request);
    const { postId, text } =
      (request.data as CreateCommunityCommentRequest | undefined) ?? {};

    if (!postId || typeof postId !== 'string') {
      throw new HttpsError('invalid-argument', 'postId is required.');
    }

    const trimmedText = typeof text === 'string' ? text.trim() : '';
    if (!trimmedText) {
      throw new HttpsError('invalid-argument', 'Comment text is required.');
    }

    const [postSnap, userSnap] = await Promise.all([
      adminDb.collection('communityPosts').doc(postId).get(),
      adminDb.collection('users').doc(uid).get(),
    ]);

    if (!postSnap.exists) {
      throw new HttpsError('not-found', 'Post not found.');
    }

    if (!userSnap.exists) {
      throw new HttpsError(
        'failed-precondition',
        'User profile must exist before commenting.',
      );
    }

    const profile = userSnap.data() ?? {};
    const commentRef = adminDb
      .collection('communityPosts')
      .doc(postId)
      .collection('comments')
      .doc();

    await adminDb.runTransaction(async (transaction) => {
      transaction.set(commentRef, {
        userId: uid,
        userName:
          typeof profile.displayName === 'string' ? profile.displayName : '',
        userAvatar:
          typeof profile.photoURL === 'string' ? profile.photoURL : null,
        text: trimmedText,
        createdAt: FieldValue.serverTimestamp(),
      });
      transaction.update(postSnap.ref, {
        commentCount: FieldValue.increment(1),
      });
    });

    return { commentId: commentRef.id };
  },
);
