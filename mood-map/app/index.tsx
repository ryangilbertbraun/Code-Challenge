import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { View, ActivityIndicator } from "react-native";
import { ENABLE_STORYBOOK } from "../storybook.config";
import StorybookUIRoot from "../.storybook/Storybook";

/**
 * Index route that handles initial navigation
 *
 * Redirects users based on authentication state:
 * - Authenticated users -> main app (tabs)
 * - Unauthenticated users -> auth screen
 *
 * Shows loading indicator while session is being initialized
 *
 * Requirements: 2.6, 2.7
 */
export default function Index() {
  // Enable Storybook mode for component development
  if (ENABLE_STORYBOOK) {
    return <StorybookUIRoot />;
  }

  const { session, isLoading } = useAuthStore();

  // Show loading indicator while initializing session
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Redirect based on auth state
  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth" />;
}
