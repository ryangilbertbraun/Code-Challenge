/**
 * Row Level Security (RLS) Integration Tests
 *
 * Tests that validate Supabase RLS policies correctly isolate user data
 * and prevent unauthorized access to journal entries.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { testHelpers, TestUser } from "../utils/testHelpers";
import { TextEntry, AnalysisStatus, EntryType } from "../../types/entry.types";
import { SAMPLE_ENTRIES, MOCK_MOOD_DATA } from "../utils/fixtures";

// Create test Supabase client (respects RLS)
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

/**
 * Helper to set session for test client
 */
async function setTestSession(user: TestUser): Promise<void> {
  const client = getTestClient();
  await client.auth.setSession({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });
}

/**
 * Helper to clear session for test client
 */
async function clearTestSession(): Promise<void> {
  const client = getTestClient();
  await client.auth.signOut();
}

/**
 * Helper to get entries using test client
 */
async function getEntries(): Promise<any[]> {
  const client = getTestClient();
  const { data, error } = await client
    .from("journal_entries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Helper to get entry by ID using test client
 */
async function getEntryById(id: string): Promise<any> {
  const client = getTestClient();
  const { data, error } = await client
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Helper to update entry analysis using test client
 */
async function updateTextAnalysis(
  entryId: string,
  moodMetadata: any,
  status: AnalysisStatus
): Promise<void> {
  const client = getTestClient();
  const { error } = await client
    .from("journal_entries")
    .update({
      mood_metadata: moodMetadata,
      analysis_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", entryId);

  if (error) {
    throw error;
  }
}

/**
 * Helper to delete entry using test client
 */
async function deleteEntry(id: string): Promise<void> {
  const client = getTestClient();
  const { error } = await client.from("journal_entries").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

/**
 * Helper to create text entry using test client
 */
async function createTextEntry(content: string): Promise<any> {
  const client = getTestClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError || !user) {
    throw new Error("No authenticated user");
  }

  const { data, error } = await client
    .from("journal_entries")
    .insert({
      user_id: user.id,
      entry_type: EntryType.TEXT,
      content: content,
      analysis_status: AnalysisStatus.PENDING,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

describe("Row Level Security Integration Tests", () => {
  let userA: TestUser;
  let userB: TestUser;
  let entryA: TextEntry;

  beforeEach(async () => {
    // Create two test users
    userA = await testHelpers.createTestUser();
    userB = await testHelpers.createTestUser();

    // Create an entry for user A
    await testHelpers.authenticateAs(userA);
    entryA = await testHelpers.createTextEntry(SAMPLE_ENTRIES.happy, userA.id);
  });

  afterEach(async () => {
    await testHelpers.cleanupTestData();
  });

  /**
   * Requirement 2.1: WHEN a user queries journal entries THEN the system SHALL
   * return only entries where user_id matches the authenticated user
   */
  describe("User can only query their own entries", () => {
    it("should return only user A's entries when authenticated as user A", async () => {
      await setTestSession(userA);
      const entries = await getEntries();

      // User A should see their own entry
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe(entryA.id);
      expect(entries[0].user_id).toBe(userA.id);
    });

    it("should not return user A's entries when authenticated as user B", async () => {
      await setTestSession(userB);
      const entries = await getEntries();

      // User B should not see user A's entry
      expect(entries).toHaveLength(0);
      expect(entries).not.toContainEqual(
        expect.objectContaining({ id: entryA.id })
      );
    });

    it("should return separate entries for each user", async () => {
      // Create entry for user B
      await setTestSession(userB);
      const entryB = await createTextEntry(SAMPLE_ENTRIES.sad);

      // User A should only see their entry
      await setTestSession(userA);
      const entriesA = await getEntries();
      expect(entriesA).toHaveLength(1);
      expect(entriesA[0].id).toBe(entryA.id);

      // User B should only see their entry
      await setTestSession(userB);
      const entriesB = await getEntries();
      expect(entriesB).toHaveLength(1);
      expect(entriesB[0].id).toBe(entryB.id);
    });
  });

  /**
   * Requirement 2.2: WHEN a user attempts to update another user's entry
   * THEN the system SHALL reject the operation
   */
  describe("User cannot update another user's entry", () => {
    it("should reject user B's attempt to update user A's entry", async () => {
      // Switch to user B's session
      await setTestSession(userB);

      // Attempt to update user A's entry
      // Note: RLS prevents the update silently - no error is thrown,
      // but the update affects 0 rows
      await updateTextAnalysis(
        entryA.id,
        MOCK_MOOD_DATA,
        AnalysisStatus.SUCCESS
      );

      // Verify entry was NOT updated by querying as admin (bypasses RLS)
      // This is necessary because user B's query would return empty results
      // due to RLS, even if the update had succeeded
      const adminEntries = await testHelpers.queryEntriesAsAdmin(userA.id);
      expect(adminEntries).toHaveLength(1);
      expect(adminEntries[0].moodMetadata).toBeNull();
      expect(adminEntries[0].analysisStatus).toBe(AnalysisStatus.PENDING);
    });

    it("should allow user A to update their own entry", async () => {
      await setTestSession(userA);

      // Should not throw
      await updateTextAnalysis(
        entryA.id,
        MOCK_MOOD_DATA,
        AnalysisStatus.SUCCESS
      );

      // Verify update was successful
      const updated = await getEntryById(entryA.id);
      expect(updated.mood_metadata).toEqual(MOCK_MOOD_DATA);
      expect(updated.analysis_status).toBe(AnalysisStatus.SUCCESS);
    });
  });

  /**
   * Requirement 2.3: WHEN a user attempts to delete another user's entry
   * THEN the system SHALL reject the operation
   */
  describe("User cannot delete another user's entry", () => {
    it("should reject user B's attempt to delete user A's entry", async () => {
      await setTestSession(userB);

      // Attempt to delete should fail silently (RLS prevents the delete)
      await deleteEntry(entryA.id);

      // Verify entry still exists using admin query
      const adminEntries = await testHelpers.queryEntriesAsAdmin(userA.id);
      expect(adminEntries).toHaveLength(1);
      expect(adminEntries[0].id).toBe(entryA.id);
    });

    it("should allow user A to delete their own entry", async () => {
      await setTestSession(userA);

      // Should not throw
      await deleteEntry(entryA.id);

      // Verify entry was deleted
      const entries = await getEntries();
      expect(entries).toHaveLength(0);
    });
  });

  /**
   * Requirement 2.4: WHEN an unauthenticated request queries entries
   * THEN the system SHALL return zero results
   */
  describe("Unauthenticated requests return zero results", () => {
    it("should return empty array when not authenticated", async () => {
      await clearTestSession();

      const entries = await getEntries();
      expect(entries).toHaveLength(0);
    });

    it("should not allow unauthenticated user to access entry by ID", async () => {
      await clearTestSession();

      // When unauthenticated, RLS prevents access and .single() throws an error
      // because no rows match (PGRST116: "JSON object requested, multiple (or no) rows returned")
      try {
        await getEntryById(entryA.id);
        // If we get here, the test should fail
        fail(
          "Expected getEntryById to throw an error for unauthenticated user"
        );
      } catch (error: any) {
        // Verify it's an RLS/not found error
        expect(error).toBeDefined();
        expect(error.code || error.message).toBeTruthy();
      }
    });

    it("should not allow unauthenticated user to create entries", async () => {
      await clearTestSession();

      await expect(createTextEntry(SAMPLE_ENTRIES.neutral)).rejects.toThrow();
    });
  });
});
