import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

/**
 * AuthGuard component that protects routes and redirects unauthenticated users
 *
 * This component monitors authentication state and navigation segments to ensure
 * that unauthenticated users are redirected to the login screen, and authenticated
 * users are redirected away from auth screens.
 *
 * Requirements: 2.6, 2.7
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while loading session
    if (isLoading) {
      return;
    }

    // Check if we're in a protected route (tabs)
    const inProtectedRoute = segments[0] === "(tabs)";
    // Check if we're in auth route
    const inAuthRoute = segments[0] === "auth";

    if (!session && inProtectedRoute) {
      // User is not authenticated but trying to access protected route
      // Redirect to auth screen
      router.replace("/auth");
    } else if (session && inAuthRoute) {
      // User is authenticated but on auth screen
      // Redirect to main app
      router.replace("/(tabs)");
    }
  }, [session, segments, isLoading, router]);

  return <>{children}</>;
}
