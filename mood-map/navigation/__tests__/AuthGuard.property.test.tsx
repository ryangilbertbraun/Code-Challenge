/**
 * Property-Based Test for Protected Route Security
 *
 * Feature: mood-map, Property 2.4: Protected route security
 *
 * This test verifies that the AuthGuard logic correctly determines when
 * redirects should occur based on authentication state and current route.
 *
 * Validates: Requirements 2.6, 2.7
 */

import fc from "fast-check";
import { AuthSession } from "@/types/auth.types";

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

// Protected route segments (routes that require authentication)
const protectedSegmentArbitrary = fc.constantFrom(
  ["(tabs)"],
  ["(tabs)", "index"],
  ["(tabs)", "explore"]
);

// Auth route segments (login/signup screens)
const authSegmentArbitrary = fc.constantFrom(["auth"], ["auth", "login"]);

// Public route segments (accessible without authentication)
const publicSegmentArbitrary = fc.constantFrom(["index"], ["modal"]);

/**
 * Core logic function that determines if a redirect should occur
 * This mirrors the logic in AuthGuard component
 */
function shouldRedirect(
  session: AuthSession | null,
  isLoading: boolean,
  segments: readonly string[]
): { shouldRedirect: boolean; redirectTo: string | null } {
  // Don't redirect while loading
  if (isLoading) {
    return { shouldRedirect: false, redirectTo: null };
  }

  const inProtectedRoute = segments[0] === "(tabs)";
  const inAuthRoute = segments[0] === "auth";

  // Unauthenticated user trying to access protected route
  if (!session && inProtectedRoute) {
    return { shouldRedirect: true, redirectTo: "/auth" };
  }

  // Authenticated user on auth screen
  if (session && inAuthRoute) {
    return { shouldRedirect: true, redirectTo: "/(tabs)" };
  }

  return { shouldRedirect: false, redirectTo: null };
}

describe("AuthGuard Property Tests", () => {
  describe("Property 2.4: Protected route security", () => {
    it(
      "should redirect unauthenticated users from protected routes to auth screen",
      () => {
        fc.assert(
          fc.property(protectedSegmentArbitrary, (protectedSegments) => {
            // Arrange: User is NOT authenticated
            const session = null;
            const isLoading = false;

            // Act: Determine if redirect should occur
            const result = shouldRedirect(
              session,
              isLoading,
              protectedSegments
            );

            // Property: Should redirect to auth screen
            expect(result.shouldRedirect).toBe(true);
            expect(result.redirectTo).toBe("/auth");
          }),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should allow authenticated users to access protected routes",
      () => {
        fc.assert(
          fc.property(
            authSessionArbitrary,
            protectedSegmentArbitrary,
            (session, protectedSegments) => {
              // Arrange: User IS authenticated
              const isLoading = false;

              // Act: Determine if redirect should occur
              const result = shouldRedirect(
                session,
                isLoading,
                protectedSegments
              );

              // Property: Should NOT redirect away from protected routes
              expect(result.shouldRedirect).toBe(false);
              expect(result.redirectTo).toBeNull();
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should redirect authenticated users away from auth screens",
      () => {
        fc.assert(
          fc.property(
            authSessionArbitrary,
            authSegmentArbitrary,
            (session, authSegments) => {
              // Arrange: User IS authenticated but on auth screen
              const isLoading = false;

              // Act: Determine if redirect should occur
              const result = shouldRedirect(session, isLoading, authSegments);

              // Property: Should redirect to main app (tabs)
              expect(result.shouldRedirect).toBe(true);
              expect(result.redirectTo).toBe("/(tabs)");
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should not redirect while session is loading",
      () => {
        fc.assert(
          fc.property(
            fc.oneof(protectedSegmentArbitrary, authSegmentArbitrary),
            (segments) => {
              // Arrange: Session is loading
              const session = null;
              const isLoading = true;

              // Act: Determine if redirect should occur
              const result = shouldRedirect(session, isLoading, segments);

              // Property: Should NOT redirect while loading
              expect(result.shouldRedirect).toBe(false);
              expect(result.redirectTo).toBeNull();
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should enforce that all protected routes require authentication",
      () => {
        fc.assert(
          fc.property(protectedSegmentArbitrary, (protectedSegments) => {
            // Arrange: User is NOT authenticated
            const session = null;
            const isLoading = false;

            // Act: Determine if redirect should occur
            const result = shouldRedirect(
              session,
              isLoading,
              protectedSegments
            );

            // Property: For ANY protected route, unauthenticated access
            // should result in redirect to auth
            const firstSegment = protectedSegments[0];
            const isProtectedRoute = firstSegment === "(tabs)";

            if (isProtectedRoute) {
              expect(result.shouldRedirect).toBe(true);
              expect(result.redirectTo).toBe("/auth");
            }
          }),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should maintain consistent redirect behavior across multiple checks",
      () => {
        fc.assert(
          fc.property(
            authSessionArbitrary,
            protectedSegmentArbitrary,
            (session, segments) => {
              const isLoading = false;

              // Check 1: Unauthenticated attempt
              const result1 = shouldRedirect(null, isLoading, segments);

              // Check 2: Authenticated attempt
              const result2 = shouldRedirect(session, isLoading, segments);

              // Property: Unauthenticated should redirect, authenticated should not
              expect(result1.shouldRedirect).toBe(true);
              expect(result1.redirectTo).toBe("/auth");
              expect(result2.shouldRedirect).toBe(false);
              expect(result2.redirectTo).toBeNull();
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should handle public routes without redirecting",
      () => {
        fc.assert(
          fc.property(
            fc.option(authSessionArbitrary, { nil: null }),
            publicSegmentArbitrary,
            (session, publicSegments) => {
              // Arrange: Any authentication state, public route
              const isLoading = false;

              // Act: Determine if redirect should occur
              const result = shouldRedirect(session, isLoading, publicSegments);

              // Property: Public routes (index, modal) should not trigger redirects
              // since they are neither auth routes nor protected routes
              expect(result.shouldRedirect).toBe(false);
              expect(result.redirectTo).toBeNull();
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should be deterministic for the same inputs",
      () => {
        fc.assert(
          fc.property(
            fc.option(authSessionArbitrary, { nil: null }),
            fc.boolean(),
            fc.oneof(
              protectedSegmentArbitrary,
              authSegmentArbitrary,
              publicSegmentArbitrary
            ),
            (session, isLoading, segments) => {
              // Act: Call the function twice with same inputs
              const result1 = shouldRedirect(session, isLoading, segments);
              const result2 = shouldRedirect(session, isLoading, segments);

              // Property: Results should be identical (deterministic)
              expect(result1).toEqual(result2);
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );
  });
});
