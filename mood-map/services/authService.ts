import { supabase } from "@/utils/supabaseClient";
import {
  User,
  AuthSession,
  LoginCredentials,
  SignupCredentials,
} from "@/types/auth.types";
import { AppError, ErrorCode } from "@/types/error.types";
import { AuthError } from "@supabase/supabase-js";

/**
 * Authentication service interface
 */
export interface IAuthService {
  signup(credentials: SignupCredentials): Promise<AuthSession>;
  login(credentials: LoginCredentials): Promise<AuthSession>;
  logout(): Promise<void>;
  getCurrentSession(): Promise<AuthSession | null>;
  refreshSession(): Promise<AuthSession>;
  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): () => void;
}

/**
 * Validates email format using a standard email regex pattern
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password meets minimum length requirement
 */
export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Maps Supabase auth errors to application errors
 */
function mapAuthError(error: AuthError): AppError {
  // Check for specific error messages from Supabase
  const message = error.message.toLowerCase();

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return {
      code: ErrorCode.AUTH_INVALID_CREDENTIALS,
      message: "Invalid email or password",
      details: error,
      retryable: false,
    };
  }

  if (
    message.includes("user already registered") ||
    message.includes("already registered")
  ) {
    return {
      code: ErrorCode.AUTH_EMAIL_EXISTS,
      message: "An account with this email already exists",
      details: error,
      retryable: false,
    };
  }

  if (message.includes("password") && message.includes("short")) {
    return {
      code: ErrorCode.AUTH_WEAK_PASSWORD,
      message: "Password must be at least 8 characters long",
      details: error,
      retryable: false,
    };
  }

  if (
    message.includes("session") &&
    (message.includes("expired") || message.includes("invalid"))
  ) {
    return {
      code: ErrorCode.AUTH_SESSION_EXPIRED,
      message: "Your session has expired. Please log in again",
      details: error,
      retryable: false,
    };
  }

  // Default network/server error
  return {
    code: ErrorCode.NETWORK_SERVER_ERROR,
    message: error.message || "An authentication error occurred",
    details: error,
    retryable: true,
  };
}

/**
 * Converts Supabase auth response to application AuthSession
 */
function toAuthSession(
  supabaseUser: any,
  accessToken: string,
  refreshToken: string,
  expiresAt: number
): AuthSession {
  return {
    user: {
      id: supabaseUser.id,
      email: supabaseUser.email,
      createdAt: new Date(supabaseUser.created_at),
    },
    accessToken,
    refreshToken,
    expiresAt: new Date(expiresAt * 1000), // Convert Unix timestamp to Date
  };
}

/**
 * Authentication service implementation
 */
class AuthService implements IAuthService {
  /**
   * Sign up a new user with email and password
   */
  async signup(credentials: SignupCredentials): Promise<AuthSession> {
    // Validate email format
    if (!validateEmail(credentials.email)) {
      throw {
        code: ErrorCode.AUTH_INVALID_EMAIL,
        message: "Please enter a valid email address",
        retryable: false,
      } as AppError;
    }

    // Validate password length
    if (!validatePassword(credentials.password)) {
      throw {
        code: ErrorCode.AUTH_WEAK_PASSWORD,
        message: "Password must be at least 8 characters long",
        retryable: false,
      } as AppError;
    }

    // Validate password confirmation matches
    if (credentials.password !== credentials.confirmPassword) {
      throw {
        code: ErrorCode.VALIDATION_FAILED,
        message: "Passwords do not match",
        retryable: false,
      } as AppError;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw mapAuthError(error);
      }

      if (!data.user || !data.session) {
        throw {
          code: ErrorCode.NETWORK_SERVER_ERROR,
          message: "Failed to create account. Please try again",
          retryable: true,
        } as AppError;
      }

      return toAuthSession(
        data.user,
        data.session.access_token,
        data.session.refresh_token,
        data.session.expires_at || Date.now() / 1000 + 3600
      );
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred during signup",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Log in an existing user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    // Validate email format
    if (!validateEmail(credentials.email)) {
      throw {
        code: ErrorCode.AUTH_INVALID_EMAIL,
        message: "Please enter a valid email address",
        retryable: false,
      } as AppError;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw mapAuthError(error);
      }

      if (!data.user || !data.session) {
        throw {
          code: ErrorCode.AUTH_INVALID_CREDENTIALS,
          message: "Invalid email or password",
          retryable: false,
        } as AppError;
      }

      return toAuthSession(
        data.user,
        data.session.access_token,
        data.session.refresh_token,
        data.session.expires_at || Date.now() / 1000 + 3600
      );
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred during login",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw mapAuthError(error);
      }
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred during logout",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Get the current authenticated session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        throw mapAuthError(error);
      }

      if (!data.session || !data.session.user) {
        return null;
      }

      return toAuthSession(
        data.session.user,
        data.session.access_token,
        data.session.refresh_token,
        data.session.expires_at || Date.now() / 1000 + 3600
      );
    } catch (error) {
      // If session is expired or invalid, return null instead of throwing
      if ((error as AppError).code === ErrorCode.AUTH_SESSION_EXPIRED) {
        return null;
      }

      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred while checking session",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthSession> {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        throw mapAuthError(error);
      }

      if (!data.session || !data.session.user) {
        throw {
          code: ErrorCode.AUTH_SESSION_EXPIRED,
          message: "Session has expired. Please log in again",
          retryable: false,
        } as AppError;
      }

      return toAuthSession(
        data.session.user,
        data.session.access_token,
        data.session.refresh_token,
        data.session.expires_at || Date.now() / 1000 + 3600
      );
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Otherwise, wrap it
      throw {
        code: ErrorCode.NETWORK_SERVER_ERROR,
        message: "An unexpected error occurred while refreshing session",
        details: error,
        retryable: true,
      } as AppError;
    }
  }

  /**
   * Listen to auth state changes (sign in, sign out, token refresh, etc.)
   * Returns an unsubscribe function
   */
  onAuthStateChange(
    callback: (session: AuthSession | null) => void
  ): () => void {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      console.log("Supabase auth event:", event);

      if (supabaseSession && supabaseSession.user) {
        // Convert Supabase session to our AuthSession format
        const authSession = toAuthSession(
          supabaseSession.user,
          supabaseSession.access_token,
          supabaseSession.refresh_token,
          supabaseSession.expires_at || Date.now() / 1000 + 3600
        );
        callback(authSession);
      } else {
        // Session expired or user signed out
        callback(null);
      }
    });

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
}

// Export singleton instance
export const authService = new AuthService();
