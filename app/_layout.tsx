import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';

export default function RootLayout() {
  const { loadUser, isAuthenticated, isLoaded } = useAuthStore(); // ← add isLoaded
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
    if (!isLoaded) return; // ← CRITICAL: wait for AsyncStorage

    const inTabsGroup = segments[0] === '(tabs)';

    if (isAuthenticated && !inTabsGroup) {
      router.replace('/(tabs)' as any);
    } else if (!isAuthenticated && inTabsGroup) {
      router.replace('/' as any);
    }
  }, [isAuthenticated, segments, isLoaded]); // ← add isLoaded

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="healthcare" />
      <Stack.Screen name="education" />
      <Stack.Screen name="community" />
      <Stack.Screen name="health-summary" />
      <Stack.Screen name="book-appointment" />
      <Stack.Screen name="teleconsultation" />
      <Stack.Screen name="health-camps/index" />
    </Stack>
  );
}