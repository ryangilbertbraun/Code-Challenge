import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/stores/authStore";
import { AuthGuard } from "@/navigation/AuthGuard";
import CustomSplashScreen from "@/components/SplashScreen";

/**
 * Root layout component with navigation and route protection
 *
 * This component:
 * - Initializes the authentication session on app start
 * - Sets up the navigation stack (auth and main stacks)
 * - Wraps the app with AuthGuard for route protection
 *
 * Requirements: 2.6, 2.7
 */
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { initializeSession } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);

  // Initialize session on app start
  useEffect(() => {
    initializeSession();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
          <Stack.Screen
            name="create-entry"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen name="entry-detail" options={{ headerShown: false }} />
        </Stack>
      </AuthGuard>
      <StatusBar style="auto" />
      {showSplash && <CustomSplashScreen onFinish={handleSplashFinish} />}
    </ThemeProvider>
  );
}
