/**
 * Authentication Integration Tests
 *
 * Tests that validate the complete authentication flow including signup,
 * login, logout, and session management with Supabase.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { testHelpers, TestUser } from "../utils/testHelpers";

// Create test Supabase client
let testClient: SupabaseClient;

function getTestClient(): SupabaseClient {
  if (!testClient) {
    const url = process.env.TEST_SUPABASE_URL;
    const anonKey = process.env.TEST_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        "TEST_SUPABASE_URL and TEST_SUPABASE_ANON_KEY must be set in .env.test"
      );
    }

    testClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return testClient;
}

describe("Authentication Integration Tests", () => {
  afterEach(async () => {
    // Clean up all test data after each test
    await testHelpers.cleanupTestData();
  });

  /**
   * WHEN a new user signs up with valid credentials
   * THEN the system SHALL create a user record and return a valid session token
   */
  describe("Signup creates user and returns valid session", () => {
    it("should create a new user and return valid session with all required fields", async () => {
      const client = getTestClient();
      const email = `test-${Date.now()}@test.com`;
      const password = "TestPassword123!";

      const { data, error } = await client.auth.signUp({
        email,
        password,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.session).toBeDefined();

      // Verify user structure
      expect(data.user?.id).toBeDefined();
      expect(data.user?.email).toBe(email);
      expect(data.user?.created_at).toBeDefined();

      // Verify session tokens
      expect(data.session?.access_token).toBeDefined();
      expect(data.session?.access_token).not.toBe("");
      expect(data.session?.refresh_token).toBeDefined();
      expect(data.session?.refresh_token).not.toBe("");

      // Verify expiration
      expect(data.session?.expires_at).toBeDefined();
      expect(data.session?.expires_at).toBeGreaterThan(Date.now() / 1000);
    });

    it("should create a user that can be authenticated", async () => {
      const client = getTestClient();
      const email = `test-${Date.now()}@test.com`;
      const password = "TestPassword123!";

      const { data: signupData, error: signupError } = await client.auth.signUp(
        {
          email,
          password,
        }
      );

      expect(signupError).toBeNull();
      expect(signupData.session).toBeDefined();

      // Verify we can authenticate with the created user
      const { error: setSessionError } = await client.auth.setSession({
        access_token: signupData.session!.access_token,
        refresh_token: signupData.session!.refresh_token,
      });

      expect(setSessionError).toBeNull();

      // Verify we can get the user
      const {
        data: { user },
      } = await client.auth.getUser();
      expect(user).toBeDefined();
      expect(user?.id).toBe(signupData.user?.id);
      expect(user?.email).toBe(email);
    });

    it("should reject signup with weak password", async () => {
      const client = getTestClient();
      const email = `test-${Date.now()}@test.com`;
      const password = "weak";

      const { data, error } = await client.auth.signUp({
        email,
        password,
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain("Password");
    });

    it("should reject signup with invalid email", async () => {
      const client = getTestClient();
      const email = "not-an-email";
      const password = "TestPassword123!";

      const { data, error } = await client.auth.signUp({
        email,
        password,
      });

      expect(error).toBeDefined();
      expect(error?.message).toBeTruthy();
    });
  });

  /**
   * Requirement 3.2: WHEN a user logs in with correct credentials
   * THEN the system SHALL return a valid session token
   */
  describe("Login with correct credentials returns valid token", () => {
    let testUser: TestUser;

    beforeEach(async () => {
      // Create a test user for login tests
      testUser = await testHelpers.createTestUser();
    });

    it("should login with correct credentials and return valid session", async () => {
      const client = getTestClient();

      const { data, error } = await client.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.session).toBeDefined();

      // Verify user structure
      expect(data.user.id).toBe(testUser.id);
      expect(data.user.email).toBe(testUser.email);
      expect(data.user.created_at).toBeDefined();

      // Verify session tokens
      expect(data.session?.access_token).toBeDefined();
      expect(data.session?.access_token).not.toBe("");
      expect(data.session?.refresh_token).toBeDefined();
      expect(data.session?.refresh_token).not.toBe("");

      // Verify expiration
      expect(data.session?.expires_at).toBeDefined();
      expect(data.session?.expires_at).toBeGreaterThan(Date.now() / 1000);
    });

    it("should reject login with incorrect password", async () => {
      const client = getTestClient();

      const { data, error } = await client.auth.signInWithPassword({
        email: testUser.email,
        password: "WrongPassword123!",
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain("Invalid");
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    it("should reject login with non-existent email", async () => {
      const client = getTestClient();

      const { data, error } = await client.auth.signInWithPassword({
        email: "nonexistent@test.com",
        password: "TestPassword123!",
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain("Invalid");
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    it("should allow multiple logins for the same user", async () => {
      const client = getTestClient();

      // First login
      const { data: data1, error: error1 } =
        await client.auth.signInWithPassword({
          email: testUser.email,
          password: testUser.password,
        });

      expect(error1).toBeNull();
      expect(data1.user?.id).toBe(testUser.id);
      expect(data1.session?.access_token).toBeDefined();

      // Second login
      const { data: data2, error: error2 } =
        await client.auth.signInWithPassword({
          email: testUser.email,
          password: testUser.password,
        });

      expect(error2).toBeNull();
      expect(data2.user?.id).toBe(testUser.id);
      expect(data2.session?.access_token).toBeDefined();

      // Both sessions should be valid
      expect(data1.session?.access_token).not.toBe(data2.session?.access_token);
    });
  });

  /**
   * Requirement 3.3: WHEN a user attempts to sign up with an existing email
   * THEN the system SHALL reject the operation with a duplicate email error
   */
  describe("Duplicate email signup is rejected", () => {
    let existingUser: TestUser;

    beforeEach(async () => {
      // Create an existing user
      existingUser = await testHelpers.createTestUser();
    });

    it("should reject signup with existing email", async () => {
      const client = getTestClient();

      const { data, error } = await client.auth.signUp({
        email: existingUser.email,
        password: "DifferentPassword123!",
      });

      expect(error).toBeDefined();
      expect(error?.message).toContain("already");
    });

    it("should reject signup with existing email regardless of case", async () => {
      const client = getTestClient();

      const { data, error } = await client.auth.signUp({
        email: existingUser.email.toUpperCase(),
        password: "DifferentPassword123!",
      });

      // Supabase treats emails as case-insensitive
      expect(error).toBeDefined();
      expect(error?.message).toContain("already");
    });
  });

  /**
   * Requirement 3.4: WHEN a user logs out
   * THEN the system SHALL invalidate the session token
   */
  describe("Logout invalidates session token", () => {
    let testUser: TestUser;

    beforeEach(async () => {
      // Create and authenticate a test user
      testUser = await testHelpers.createTestUser();
      await testHelpers.authenticateAs(testUser);
    });

    it("should invalidate session after logout", async () => {
      const client = getTestClient();

      // Set the session for the test client
      await client.auth.setSession({
        access_token: testUser.accessToken,
        refresh_token: testUser.refreshToken,
      });

      // Verify user is authenticated before logout
      const {
        data: { session: sessionBefore },
      } = await client.auth.getSession();
      expect(sessionBefore).not.toBeNull();
      expect(sessionBefore?.user.id).toBe(testUser.id);

      // Logout
      const { error } = await client.auth.signOut();
      expect(error).toBeNull();

      // Verify session is invalidated
      const {
        data: { session: sessionAfter },
      } = await client.auth.getSession();
      expect(sessionAfter).toBeNull();
    });

    it("should prevent access to protected resources after logout", async () => {
      const client = getTestClient();

      // Logout
      await client.auth.signOut();

      // Try to get user (should be null because no auth)
      const {
        data: { user },
      } = await client.auth.getUser();

      expect(user).toBeNull();
    });

    it("should allow login again after logout", async () => {
      const client = getTestClient();

      // Logout
      await client.auth.signOut();

      // Verify logged out
      const {
        data: { session: sessionAfterLogout },
      } = await client.auth.getSession();
      expect(sessionAfterLogout).toBeNull();

      // Login again
      const { data, error } = await client.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password,
      });

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.user?.id).toBe(testUser.id);
    });

    it("should handle logout when already logged out gracefully", async () => {
      const client = getTestClient();

      // Logout once
      await client.auth.signOut();

      // Logout again (should not throw)
      const { error } = await client.auth.signOut();
      expect(error).toBeNull();
    });
  });
});
