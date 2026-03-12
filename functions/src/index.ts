import { onRequest } from 'firebase-functions/v2/https';

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
