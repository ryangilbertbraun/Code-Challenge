import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import {
  AuthSession,
  LoginCredentials,
  SignupCredentials,
} from "@/types/auth.types";
import { authService } from "@/services/authService";
import { AppError } from "@/types/error.types";

/**
 * Keys for storing tokens in SecureStore
 */
const SECURE_STORE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  USER_DATA: "auth_user_data",
  EXPIRES_AT: "auth_expires_at",
};

/**
 * Authentication store state interface
 */
interface AuthStore {
  // State
  session: AuthSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  setError: (error: string) => void;
  initializeSession: () => Promise<void>;
}

/**
 * Store session tokens in Expo SecureStore
 */
async function storeSessionTokens(session: AuthSession): Promise<void> {
  try {
    await Promise.all([
      SecureStore.setItemAsync(
        SECURE_STORE_KEYS.ACCESS_TOKEN,
        session.accessToken
      ),
      SecureStore.setItemAsync(
        SECURE_STORE_KEYS.REFRESH_TOKEN,
        session.refreshToken
      ),
      SecureStore.setItemAsync(
        SECURE_STORE_KEYS.USER_DATA,
        JSON.stringify(session.user)
      ),
      SecureStore.setItemAsync(
        SECURE_STORE_KEYS.EXPIRES_AT,
        session.expiresAt.toISOString()
      ),
    ]);
  } catch (error) {
    console.error("Failed to store session tokens:", error);
    throw error;
  }
}

/**
 * Retrieve session from Expo SecureStore
 */
async function retrieveStoredSession(): Promise<AuthSession | null> {
  try {
    const [accessToken, refreshToken, userData, expiresAt] = await Promise.all([
      SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(SECURE_STORE_KEYS.USER_DATA),
      SecureStore.getItemAsync(SECURE_STORE_KEYS.EXPIRES_AT),
    ]);

    if (!accessToken || !refreshToken || !userData || !expiresAt) {
      return null;
    }

    return {
      user: JSON.parse(userData),
      accessToken,
      refreshToken,
      expiresAt: new Date(expiresAt),
    };
  } catch (error) {
    console.error("Failed to retrieve stored session:", error);
    return null;
  }
}

/**
 * Clear session tokens from Expo SecureStore
 */
async function clearStoredSession(): Promise<void> {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_DATA),
      SecureStore.deleteItemAsync(SECURE_STORE_KEYS.EXPIRES_AT),
    ]);
  } catch (error) {
    console.error("Failed to clear stored session:", error);
    // Don't throw - we want to clear the in-memory session even if SecureStore fails
  }
}

/**
 * Authentication store implementation using Zustand
 */
export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  session: null,
  isLoading: false,
  error: null,

  /**
   * Initialize session from SecureStore on app start
   */
  initializeSession: async () => {
    set({ isLoading: true, error: null });

    try {
      // First, try to get the current session from Supabase
      const currentSession = await authService.getCurrentSession();

      if (currentSession) {
        // Store in SecureStore for persistence
        await storeSessionTokens(currentSession);
        set({ session: currentSession, isLoading: false });
        return;
      }

      // If no current session, try to retrieve from SecureStore
      const storedSession = await retrieveStoredSession();

      if (storedSession) {
        // Check if session is expired
        const now = new Date();
        if (storedSession.expiresAt > now) {
          set({ session: storedSession, isLoading: false });
        } else {
          // Session expired, try to refresh
          try {
            await get().refreshSession();
          } catch (error) {
            // Refresh failed, clear stored session
            await clearStoredSession();
            set({ session: null, isLoading: false });
          }
        }
      } else {
        set({ session: null, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to initialize session:", error);
      set({
        session: null,
        isLoading: false,
        error: "Failed to initialize session",
      });
    }
  },

  /**
   * Log in with email and password
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const session = await authService.login(credentials);

      // Store tokens in SecureStore
      await storeSessionTokens(session);

      set({ session, isLoading: false, error: null });
    } catch (error) {
      const appError = error as AppError;
      set({
        session: null,
        isLoading: false,
        error: appError.message || "Login failed",
      });
      throw error;
    }
  },

  /**
   * Sign up with email and password
   */
  signup: async (credentials: SignupCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const session = await authService.signup(credentials);

      // Store tokens in SecureStore
      await storeSessionTokens(session);

      set({ session, isLoading: false, error: null });
    } catch (error) {
      const appError = error as AppError;
      set({
        session: null,
        isLoading: false,
        error: appError.message || "Signup failed",
      });
      throw error;
    }
  },

  /**
   * Log out the current user
   */
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await authService.logout();

      // Clear tokens from SecureStore
      await clearStoredSession();

      set({ session: null, isLoading: false, error: null });
    } catch (error) {
      const appError = error as AppError;
      // Even if logout fails, clear local session
      await clearStoredSession();
      set({
        session: null,
        isLoading: false,
        error: appError.message || "Logout failed",
      });
    }
  },

  /**
   * Refresh the current session
   */
  refreshSession: async () => {
    set({ isLoading: true, error: null });

    try {
      const session = await authService.refreshSession();

      // Store refreshed tokens in SecureStore
      await storeSessionTokens(session);

      set({ session, isLoading: false, error: null });
    } catch (error) {
      const appError = error as AppError;
      // If refresh fails, clear session
      await clearStoredSession();
      set({
        session: null,
        isLoading: false,
        error: appError.message || "Session refresh failed",
      });
      throw error;
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Set error state
   */
  setError: (error: string) => {
    set({ error });
  },
}));
