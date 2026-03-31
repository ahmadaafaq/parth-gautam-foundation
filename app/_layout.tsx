import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '../utils/tokenCache';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_bG9naWNhbC1idXJyby00Ni5jbGVyay5hY2NvdW50cy5kZXYk";

function RootLayoutNav() {
  const { loadUser, isAuthenticated, isLoaded, logout } = useAuthStore();
  const { isLoaded: isClerkLoaded, isSignedIn } = useAuth();
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const init = async () => {
      await loadUser();
      await loadLanguage();
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoaded || !isClerkLoaded) return;

    const handleNavigation = () => {
      const isRoot = !segments[0];
      const isAuthGateway = ['login', 'otp', 'onboarding'].includes(segments[0] as any);

      if (isSignedIn && isAuthenticated) {
        if (isRoot || isAuthGateway) {
          router.replace('/(tabs)' as any);
        }
      } else if (!isSignedIn && isClerkLoaded) {
        if (isAuthenticated && !isAuthGateway) {
          logout();
        }
        if (!isRoot && !isAuthGateway) {
          router.replace('/' as any);
        }
      }
    };

    // Use a small delay to ensure the navigator is mounted
    const timeout = setTimeout(handleNavigation, 1);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, isSignedIn, segments, isLoaded, isClerkLoaded]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="healthcare" />
      <Stack.Screen name="education" />
      <Stack.Screen name="health-summary" />
      <Stack.Screen name="book-appointment" />
      <Stack.Screen name="teleconsultation" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="survey" />
      <Stack.Screen name="survey/[id]" />
      <Stack.Screen name="weekly-call" />
      <Stack.Screen name="voter/index" />
      <Stack.Screen name="jobs" />
      <Stack.Screen name="report-issue" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <RootLayoutNav />
      </ClerkLoaded>
    </ClerkProvider>
  );
}