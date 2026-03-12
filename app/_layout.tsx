import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { queryClient } from '@/lib/queryClient';
import { initSentry } from '@/lib/sentry';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();
initSentry();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const segments = useSegments();
  const router = useRouter();

  // Initialize auth listener
  useAuth();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (hasCompletedOnboarding) {
        router.replace('/(tabs)/learn');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  }, [isAuthenticated, isLoading, hasCompletedOnboarding, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'NunitoSans-Light': require('../assets/fonts/NunitoSans-Light.ttf'),
    'NunitoSans-Regular': require('../assets/fonts/NunitoSans-Regular.ttf'),
    'NunitoSans-SemiBold': require('../assets/fonts/NunitoSans-SemiBold.ttf'),
    'NunitoSans-Bold': require('../assets/fonts/NunitoSans-Bold.ttf'),
    'NunitoSans-ExtraBold': require('../assets/fonts/NunitoSans-ExtraBold.ttf'),
  });
  const isLoading = useAuthStore((s) => s.isLoading);
  const splashHidden = useRef(false);

  // Safety timeout: if auth never resolves, hide splash after 5s anyway
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!splashHidden.current) {
        if (__DEV__) {
          console.warn(
            '[RootLayout] Auth loading timed out after 5s, hiding splash',
          );
        }
        useAuthStore.getState().setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading && !splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, isLoading]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="player"
              options={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
          <StatusBar style="auto" />
        </AuthGate>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
