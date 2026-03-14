import { FieldValue } from 'firebase-admin/firestore';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { adminDb } from './admin';
import { createCommunityComment } from './community';
import {
  getCoachCoursesCatalog,
  getCoachesCatalog,
  getDormyVideosCatalog,
  getTipVideosCatalog,
} from './content';

const REGION = 'europe-west2';

interface UserDocumentData {
  displayName?: unknown;
  photoURL?: unknown;
  handicap?: unknown;
  subscription?: {
    tier?: unknown;
  } | null;
}

function buildPublicProfile(data: UserDocumentData) {
  const tier = data.subscription?.tier;
  const isPremium = tier === 'premium_monthly' || tier === 'premium_annual';

  return {
    displayName:
      typeof data.displayName === 'string' && data.displayName.trim()
        ? data.displayName
        : 'Anonymous',
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    handicap:
      typeof data.handicap === 'number' && Number.isFinite(data.handicap)
        ? data.handicap
        : null,
    isPremium,
    updatedAt: FieldValue.serverTimestamp(),
  };
}

export const healthCheck = onRequest({ region: REGION }, (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export const syncPublicProfile = onDocumentWritten(
  {
    document: 'users/{userId}',
    region: REGION,
  },
  async (event) => {
    const userId = event.params.userId;
    const after = event.data?.after?.data() as UserDocumentData | undefined;

    if (!after) {
      await adminDb.collection('publicProfiles').doc(userId).delete();
      return;
    }

    await adminDb
      .collection('publicProfiles')
      .doc(userId)
      .set(buildPublicProfile(after));
  },
);

export {
  createCommunityComment,
  getCoachesCatalog,
  getCoachCoursesCatalog,
  getTipVideosCatalog,
  getDormyVideosCatalog,
};
