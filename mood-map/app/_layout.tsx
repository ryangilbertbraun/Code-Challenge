import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/stores/authStore";
import { AuthGuard } from "@/navigation/AuthGuard";
import CustomSplashScreen from "@/components/SplashScreen";
import { AlertProvider } from "@/contexts/AlertContext";

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
  const { initializeSession, refreshSession, session } = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const appState = useRef(AppState.currentState);

  // Initialize session on app start
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Refresh session when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        // App has come to the foreground from background
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log("App came to foreground, checking session...");

          // Only refresh if we have a session
          if (session) {
            try {
              await refreshSession();
              console.log("Session refreshed successfully");
            } catch (error) {
              console.log("Session refresh failed:", error);
              // The auth state listener will handle logout if needed
            }
          }
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [refreshSession, session]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AlertProvider>
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
            <Stack.Screen
              name="entry-detail"
              options={{ headerShown: false }}
            />
          </Stack>
        </AuthGuard>
        <StatusBar style="auto" />
        {showSplash && <CustomSplashScreen onFinish={handleSplashFinish} />}
      </AlertProvider>
    </ThemeProvider>
  );
}
