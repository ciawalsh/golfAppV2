import * as Sentry from '@sentry/react-native';

export function initSentry(): void {
  if (__DEV__) {
    return;
  }

  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    enableNativeFramesTracking: true,
  });
}
