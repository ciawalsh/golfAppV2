import { onRequest } from 'firebase-functions/v2/https';
import { createCommunityComment } from './community';
import {
  getCoachCoursesCatalog,
  getCoachesCatalog,
  getDormyVideosCatalog,
  getTipVideosCatalog,
} from './content';

export const healthCheck = onRequest(
  { region: 'europe-west2' },
  (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  },
);

export {
  createCommunityComment,
  getCoachesCatalog,
  getCoachCoursesCatalog,
  getTipVideosCatalog,
  getDormyVideosCatalog,
};
