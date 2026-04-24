import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { useSettingsStore } from '../src/stores/useSettingsStore';
import { useAuthStore } from '../src/stores/useAuthStore';
import { COLOR_PROFILES } from '../src/theme/colors';
import { LoginScreen } from '../src/components/auth/LoginScreen';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorProfile = useSettingsStore((s) => s.colorProfile);
  const colors = COLOR_PROFILES[colorProfile];
  const { isAuthenticated, referralVerified } = useAuthStore();
  const [devSkipped, setDevSkipped] = useState(false);

  // Show login gate unless authenticated + referral verified (or dev skipped)
  const isGated = !devSkipped && (!isAuthenticated || !referralVerified);

  if (isGated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style={colorProfile === 'sealLight' || colorProfile === 'sepia' || colorProfile === 'mint' ? 'dark' : 'light'} />
        <LoginScreen onSkipAuth={() => setDevSkipped(true)} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={colorProfile === 'sealLight' || colorProfile === 'sepia' || colorProfile === 'mint' ? 'dark' : 'light'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
