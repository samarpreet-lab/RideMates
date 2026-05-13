import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlertProvider } from '@/components/ui/AlertContext';
import { getToken, onAuthExpired } from '@/services/api';

// =============================================================================
// AuthGatekeeper
// =============================================================================
// Sits above all routes and enforces auth state:
//   - No token  → replace to /login
//   - Has token → replace to /(tabs)/explore (if still on an auth screen)
// Rechecks whenever the app comes back to the foreground so an expired
// session is caught immediately.
// =============================================================================
function AuthGatekeeper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [authChecked, setAuthChecked] = useState(false);
  
  // FIX: Use ref to track segments without causing re-renders
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  // FIX: Memoize checkAuth to prevent stale closures
  const checkAuth = useCallback(async () => {
    try {
      const token = await getToken();
      const currentSegments = segmentsRef.current;
      const seg1 = currentSegments[1] as string | undefined;
      const inAuthGroup = currentSegments[0] === '(tabs)' && (!seg1 || seg1 === 'index' || seg1 === 'login');

      if (!token) {
        // Not logged in — lock to login screen
        if (!inAuthGroup) {
          router.replace('/(tabs)/login');
        }
      } else {
        // Logged in — kick out of login screen
        if (inAuthGroup) {
          router.replace('/(tabs)/explore');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setAuthChecked(true);
    }
  }, [router]);

  // Run on mount
  useEffect(() => { checkAuth(); }, [checkAuth]);

  // FIX: Re-run whenever segments change (use stable dependency)
  const segmentKey = segments.join('/');
  useEffect(() => {
    if (authChecked) checkAuth();
  }, [segmentKey, authChecked, checkAuth]);

  // FIX: Re-run when app returns to foreground (empty deps - register once)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') checkAuth();
    });
    return () => sub.remove();
  }, [checkAuth]);

  // FIX: Listen for auth expiry events from API interceptor (401 responses)
  useEffect(() => {
    const unsubscribe = onAuthExpired(() => {
      checkAuth();
    });
    return unsubscribe;
  }, [checkAuth]);

  return <>{children}</>;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AlertProvider>
          <AuthGatekeeper>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </AuthGatekeeper>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
