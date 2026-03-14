import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';

export default function RootLayout() {
  const loadUser = useAuthStore((state) => state.loadUser);
  const loadLanguage = useLanguageStore((state) => state.loadLanguage);

  useEffect(() => {
    loadUser();
    loadLanguage();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="healthcare" />
      <Stack.Screen name="education" />
      <Stack.Screen name="community" />
    </Stack>
  );
}
