import { Stack } from "expo-router";

/**
 * RootNavigator component that defines the navigation structure
 *
 * This component sets up the navigation stack with:
 * - Auth stack (login/signup screens)
 * - Main stack (protected tabs and screens)
 *
 * Route protection is handled by AuthGuard component in _layout.tsx
 *
 * Requirements: 2.6, 2.7
 */
export function RootNavigator() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Index route - handles initial redirect */}
      <Stack.Screen name="index" />

      {/* Auth stack - login and signup */}
      <Stack.Screen name="auth" />

      {/* Main app stack - protected routes */}
      <Stack.Screen name="(tabs)" />

      {/* Modal screens */}
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
      <Stack.Screen
        name="create-entry"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
