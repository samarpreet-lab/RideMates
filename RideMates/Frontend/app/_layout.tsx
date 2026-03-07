import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlertProvider } from '@/components/ui/AlertContext';
import { getToken } from '@/services/api';

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

  const checkAuth = async () => {
    const token = await getToken();
    const inAuthGroup = segments[0] === '(tabs)' && segments[1] === 'login';
    const inTabsGroup = segments[0] === '(tabs)';

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
    setAuthChecked(true);
  };

  // Run on mount
  useEffect(() => { checkAuth(); }, []);

  // Re-run whenever segments change (user navigates)
  useEffect(() => {
    if (authChecked) checkAuth();
  }, [segments.join('/')]);

  // Re-run when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') checkAuth();
    });
    return () => sub.remove();
  }, [authChecked]);

  return <>{children}</>;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
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
  );
}
