/**
 * Property-Based Test for Session Persistence
 *
 * Feature: mindful-journal-app, Property 2.2: Session persistence
 *
 * This test verifies that authenticated sessions persist across app restarts.
 * When a user successfully logs in, their session should be stored in SecureStore
 * and restored when the app is reopened, without requiring re-authentication.
 *
 * Validates: Requirements 2.3, 2.5
 */

import fc from "fast-check";
import { useAuthStore } from "../authStore";
import * as SecureStore from "expo-secure-store";
import { authService } from "@/services/authService";
import { AuthSession } from "@/types/auth.types";

// Mock dependencies
jest.mock("expo-secure-store");
jest.mock("@/services/authService");

// Test configuration
const NUM_RUNS = 100;
const TEST_TIMEOUT = 30000;

// Arbitraries for generating test data
const emailArbitrary = fc
  .tuple(
    fc.stringMatching(/^[a-z0-9]+$/),
    fc.stringMatching(/^[a-z0-9]+$/),
    fc.constantFrom("com", "org", "net", "io")
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

const passwordArbitrary = fc.string({ minLength: 8, maxLength: 50 });

const userIdArbitrary = fc.uuid();

const dateArbitrary = fc
  .integer({ min: Date.now(), max: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  .map((timestamp) => new Date(timestamp));

const authSessionArbitrary: fc.Arbitrary<AuthSession> = fc.record({
  user: fc.record({
    id: userIdArbitrary,
    email: emailArbitrary,
    createdAt: dateArbitrary,
  }),
  accessToken: fc
    .string({ minLength: 20, maxLength: 100 })
    .filter((s) => s.trim().length > 0),
  refreshToken: fc
    .string({ minLength: 20, maxLength: 100 })
    .filter((s) => s.trim().length > 0),
  expiresAt: dateArbitrary,
});

describe("Auth Store Property Tests", () => {
  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset the store state by calling logout
    const store = useAuthStore.getState();
    await store.logout().catch(() => {
      // Ignore errors during cleanup
    });
  });

  describe("Property 2.2: Session persistence", () => {
    it(
      "should persist session to SecureStore after successful login",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            emailArbitrary,
            passwordArbitrary,
            authSessionArbitrary,
            async (email, password, mockSession) => {
              // Mock authService.login to return the generated session
              (authService.login as jest.Mock).mockResolvedValue(mockSession);

              // Mock SecureStore.setItemAsync to succeed
              (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(
                undefined
              );

              // Get the store
              const store = useAuthStore.getState();

              // Act: Login
              await store.login({ email, password });

              // Get updated state
              const state = useAuthStore.getState();

              // Property: Session should be stored in SecureStore
              expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "auth_access_token",
                mockSession.accessToken
              );
              expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "auth_refresh_token",
                mockSession.refreshToken
              );
              expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "auth_user_data",
                JSON.stringify(mockSession.user)
              );
              expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "auth_expires_at",
                mockSession.expiresAt.toISOString()
              );

              // Property: In-memory session should match the mock session
              expect(state.session).toEqual(mockSession);
            }
          ),
          { numRuns: NUM_RUNS, timeout: TEST_TIMEOUT }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should restore session from SecureStore on app restart (initializeSession)",
      async () => {
        await fc.assert(
          fc.asyncProperty(authSessionArbitrary, async (storedSession) => {
            // Ensure the session is not expired for this test
            const nonExpiredSession = {
              ...storedSession,
              expiresAt: new Date(Date.now() + 3600000), // 1 hour in the future
            };

            // Mock authService.getCurrentSession to return null (no active Supabase session)
            (authService.getCurrentSession as jest.Mock).mockResolvedValue(
              null
            );

            // Mock SecureStore.getItemAsync to return stored session data
            (SecureStore.getItemAsync as jest.Mock).mockImplementation(
              async (key: string) => {
                switch (key) {
                  case "auth_access_token":
                    return nonExpiredSession.accessToken;
                  case "auth_refresh_token":
                    return nonExpiredSession.refreshToken;
                  case "auth_user_data":
                    return JSON.stringify(nonExpiredSession.user);
                  case "auth_expires_at":
                    return nonExpiredSession.expiresAt.toISOString();
                  default:
                    return null;
                }
              }
            );

            // Get the store
            const store = useAuthStore.getState();

            // Act: Initialize session (simulating app restart)
            await store.initializeSession();

            // Get updated state
            const state = useAuthStore.getState();

            // Property: Session should be restored from SecureStore
            expect(state.session).not.toBeNull();
            expect(state.session?.accessToken).toBe(
              nonExpiredSession.accessToken
            );
            expect(state.session?.refreshToken).toBe(
              nonExpiredSession.refreshToken
            );
            expect(state.session?.user.id).toBe(nonExpiredSession.user.id);
            expect(state.session?.user.email).toBe(
              nonExpiredSession.user.email
            );

            // Property: SecureStore should have been queried for all session data
            expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
              "auth_access_token"
            );
            expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
              "auth_refresh_token"
            );
            expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
              "auth_user_data"
            );
            expect(SecureStore.getItemAsync).toHaveBeenCalledWith(
              "auth_expires_at"
            );
          }),
          { numRuns: NUM_RUNS, timeout: TEST_TIMEOUT }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should handle missing SecureStore data gracefully",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.constantFrom(
              "auth_access_token",
              "auth_refresh_token",
              "auth_user_data",
              "auth_expires_at"
            ),
            async (missingKey) => {
              // Mock authService.getCurrentSession to return null
              (authService.getCurrentSession as jest.Mock).mockResolvedValue(
                null
              );

              // Mock SecureStore.getItemAsync to return null for the missing key
              (SecureStore.getItemAsync as jest.Mock).mockImplementation(
                async (key: string) => {
                  if (key === missingKey) {
                    return null;
                  }
                  // Return dummy data for other keys
                  switch (key) {
                    case "auth_access_token":
                      return "dummy_access_token";
                    case "auth_refresh_token":
                      return "dummy_refresh_token";
                    case "auth_user_data":
                      return JSON.stringify({
                        id: "dummy_id",
                        email: "dummy@example.com",
                        createdAt: new Date().toISOString(),
                      });
                    case "auth_expires_at":
                      return new Date(Date.now() + 3600000).toISOString();
                    default:
                      return null;
                  }
                }
              );

              // Get the store
              const store = useAuthStore.getState();

              // Act: Initialize session
              await store.initializeSession();

              // Get updated state
              const state = useAuthStore.getState();

              // Property: Session should be null when any required data is missing
              expect(state.session).toBeNull();
            }
          ),
          { numRuns: NUM_RUNS, timeout: TEST_TIMEOUT }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should refresh expired session on initialization",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            authSessionArbitrary,
            authSessionArbitrary,
            async (expiredSession, refreshedSession) => {
              // Create an expired session (in the past)
              const expiredSessionWithPastDate = {
                ...expiredSession,
                expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
              };

              // Mock authService.getCurrentSession to return null
              (authService.getCurrentSession as jest.Mock).mockResolvedValue(
                null
              );

              // Mock SecureStore to return expired session
              (SecureStore.getItemAsync as jest.Mock).mockImplementation(
                async (key: string) => {
                  switch (key) {
                    case "auth_access_token":
                      return expiredSessionWithPastDate.accessToken;
                    case "auth_refresh_token":
                      return expiredSessionWithPastDate.refreshToken;
                    case "auth_user_data":
                      return JSON.stringify(expiredSessionWithPastDate.user);
                    case "auth_expires_at":
                      return expiredSessionWithPastDate.expiresAt.toISOString();
                    default:
                      return null;
                  }
                }
              );

              // Mock authService.refreshSession to return new session
              (authService.refreshSession as jest.Mock).mockResolvedValue(
                refreshedSession
              );

              // Mock SecureStore.setItemAsync for storing refreshed session
              (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(
                undefined
              );

              // Get the store
              const store = useAuthStore.getState();

              // Act: Initialize session
              await store.initializeSession();

              // Get updated state
              const state = useAuthStore.getState();

              // Property: Expired session should trigger refresh
              expect(authService.refreshSession).toHaveBeenCalled();

              // Property: Refreshed session should be stored
              expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                "auth_access_token",
                refreshedSession.accessToken
              );

              // Property: Current session should be the refreshed session
              expect(state.session?.accessToken).toBe(
                refreshedSession.accessToken
              );
            }
          ),
          { numRuns: NUM_RUNS, timeout: TEST_TIMEOUT }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should clear session from SecureStore on logout",
      async () => {
        await fc.assert(
          fc.asyncProperty(authSessionArbitrary, async (mockSession) => {
            // Mock authService.login to return session
            (authService.login as jest.Mock).mockResolvedValue(mockSession);

            // Mock authService.logout to succeed
            (authService.logout as jest.Mock).mockResolvedValue(undefined);

            // Mock SecureStore operations
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(
              undefined
            );
            (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(
              undefined
            );

            // Get the store
            const store = useAuthStore.getState();

            // Act: Login first
            await store.login({
              email: mockSession.user.email,
              password: "password123",
            });

            // Verify login succeeded
            let state = useAuthStore.getState();
            expect(state.session).not.toBeNull();

            // Act: Logout
            await store.logout();

            // Get updated state
            state = useAuthStore.getState();

            // Property: All session data should be deleted from SecureStore
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_access_token"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_refresh_token"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_user_data"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_expires_at"
            );

            // Property: In-memory session should be null
            expect(state.session).toBeNull();
          }),
          { numRuns: NUM_RUNS, timeout: TEST_TIMEOUT }
        );
      },
      TEST_TIMEOUT
    );
  });

  /**
   * Property 2.3: Logout clears session
   *
   * Feature: mindful-journal-app, Property 2.3: Logout clears session
   *
   * This test verifies that logging out clears the session completely.
   * For any authenticated session, logging out should:
   * 1. Clear the in-memory session state
   * 2. Remove all session data from SecureStore
   * 3. Call the authService.logout method
   *
   * Validates: Requirements 2.4
   */
  describe("Property 2.3: Logout clears session", () => {
    it(
      "should clear in-memory session and SecureStore data for any authenticated session",
      async () => {
        await fc.assert(
          fc.asyncProperty(authSessionArbitrary, async (mockSession) => {
            // Arrange: Mock authService methods
            (authService.login as jest.Mock).mockResolvedValue(mockSession);
            (authService.logout as jest.Mock).mockResolvedValue(undefined);

            // Mock SecureStore operations
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(
              undefined
            );
            (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(
              undefined
            );

            // Get the store
            const store = useAuthStore.getState();

            // Arrange: Login to establish a session
            await store.login({
              email: mockSession.user.email,
              password: "password123",
            });

            // Verify session exists before logout
            const stateBeforeLogout = useAuthStore.getState();
            expect(stateBeforeLogout.session).not.toBeNull();
            expect(stateBeforeLogout.session?.accessToken).toBe(
              mockSession.accessToken
            );

            // Act: Logout
            await store.logout();

            // Assert: Get updated state after logout
            const stateAfterLogout = useAuthStore.getState();

            // Property 1: In-memory session should be cleared (null)
            expect(stateAfterLogout.session).toBeNull();

            // Property 2: authService.logout should be called
            expect(authService.logout).toHaveBeenCalled();

            // Property 3: All session data should be deleted from SecureStore
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_access_token"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_refresh_token"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_user_data"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_expires_at"
            );

            // Property 4: Loading state should be false after logout completes
            expect(stateAfterLogout.isLoading).toBe(false);
          }),
          { numRuns: NUM_RUNS, timeout: TEST_TIMEOUT }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should clear session even when authService.logout fails",
      async () => {
        await fc.assert(
          fc.asyncProperty(authSessionArbitrary, async (mockSession) => {
            // Arrange: Mock authService methods
            (authService.login as jest.Mock).mockResolvedValue(mockSession);
            (authService.logout as jest.Mock).mockRejectedValue(
              new Error("Logout service error")
            );

            // Mock SecureStore operations
            (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(
              undefined
            );
            (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(
              undefined
            );

            // Get the store
            const store = useAuthStore.getState();

            // Arrange: Login to establish a session
            await store.login({
              email: mockSession.user.email,
              password: "password123",
            });

            // Verify session exists before logout
            const stateBeforeLogout = useAuthStore.getState();
            expect(stateBeforeLogout.session).not.toBeNull();

            // Act: Logout (should not throw even if service fails)
            await store.logout();

            // Assert: Get updated state after logout
            const stateAfterLogout = useAuthStore.getState();

            // Property: Session should still be cleared even if service fails
            expect(stateAfterLogout.session).toBeNull();

            // Property: SecureStore should still be cleared
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_access_token"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_refresh_token"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_user_data"
            );
            expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
              "auth_expires_at"
            );
          }),
          { numRuns: NUM_RUNS, timeout: TEST_TIMEOUT }
        );
      },
      TEST_TIMEOUT
    );
  });
});
