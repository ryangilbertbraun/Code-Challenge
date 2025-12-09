import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { AppError, ErrorCode } from "@/types/error.types";

/**
 * Hook to handle authentication errors globally
 * Automatically logs out and redirects to auth screen when session expires
 */
export function useAuthErrorHandler() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleError = useCallback(
    async (error: unknown) => {
      const appError = error as AppError;

      // Check if it's a session expiration error
      if (appError.code === ErrorCode.AUTH_SESSION_EXPIRED) {
        console.log("Session expired, logging out...");

        // Clear the session
        await logout();

        // Redirect to auth screen
        router.replace("/auth");

        return true; // Indicates error was handled
      }

      return false; // Error was not handled
    },
    [logout, router]
  );

  return { handleError };
}
