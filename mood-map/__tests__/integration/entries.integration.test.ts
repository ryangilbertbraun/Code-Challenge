/**
 * Entry Creation Integration Tests
 *
 * Tests that validate the complete entry creation workflow including
 * text entry creation, persistence, retrieval, and access control.
 *
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { testHelpers, TestUser } from "../utils/testHelpers";
import { SAMPLE_ENTRIES } from "../utils/fixtures";
import { EntryType, AnalysisStatus } from "../../types/entry.types";

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
 * Helper to create text entry using test client
 */
async function createTextEntry(content: string): Promise<any> {
  const client = getTestClient();

  // Validate content
  if (!content || content.trim().length === 0) {
    throw {
      code: "ENTRY_EMPTY_CONTENT",
      message: "Entry content cannot be empty",
    };
  }

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

describe("Entry Creation Integration Tests", () => {
  let user: TestUser;

  beforeEach(async () => {
    // Create and authenticate a test user before each test
    user = await testHelpers.createTestUser();
    await setTestSession(user);
  });

  afterEach(async () => {
    // Clean up all test data after each test
    await testHelpers.cleanupTestData();
  });

  /**
   * Requirement 4.1: WHEN a text entry is created
   * THEN the system SHALL persist the entry with the correct user_id and entry type
   */
  describe("Text entry creation persists with correct data", () => {
    it("should create text entry and persist to database with correct user_id", async () => {
      const content = SAMPLE_ENTRIES.happy;

      const entry = await createTextEntry(content);

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
      expect(entry.user_id).toBe(user.id);
      expect(entry.entry_type).toBe(EntryType.TEXT);
      expect(entry.content).toBe(content);
      expect(entry.analysis_status).toBe(AnalysisStatus.PENDING);

      // Verify entry was persisted by querying as admin
      const adminEntries = await testHelpers.queryEntriesAsAdmin(user.id);
      expect(adminEntries).toHaveLength(1);
      expect(adminEntries[0].id).toBe(entry.id);
      expect(adminEntries[0].userId).toBe(user.id);
    });

    it("should create text entry with correct entry type", async () => {
      const content = SAMPLE_ENTRIES.neutral;

      const entry = await createTextEntry(content);

      expect(entry.entry_type).toBe(EntryType.TEXT);
      expect(entry.content).toBe(content);

      // Verify in database
      const adminEntries = await testHelpers.queryEntriesAsAdmin(user.id);
      expect(adminEntries[0].type).toBe(EntryType.TEXT);
    });

    it("should create multiple entries for the same user", async () => {
      const entry1 = await createTextEntry(SAMPLE_ENTRIES.happy);
      const entry2 = await createTextEntry(SAMPLE_ENTRIES.sad);
      const entry3 = await createTextEntry(SAMPLE_ENTRIES.neutral);

      expect(entry1.id).not.toBe(entry2.id);
      expect(entry2.id).not.toBe(entry3.id);
      expect(entry1.user_id).toBe(user.id);
      expect(entry2.user_id).toBe(user.id);
      expect(entry3.user_id).toBe(user.id);

      // Verify all entries were persisted
      const adminEntries = await testHelpers.queryEntriesAsAdmin(user.id);
      expect(adminEntries).toHaveLength(3);
    });

    it("should set analysis status to PENDING on creation", async () => {
      const entry = await createTextEntry(SAMPLE_ENTRIES.happy);

      expect(entry.analysis_status).toBe(AnalysisStatus.PENDING);
      expect(entry.mood_metadata).toBeNull();
    });
  });

  /**
   * Requirement 4.2: WHEN a text entry is created
   * THEN the system SHALL set created_at and updated_at timestamps automatically
   */
  describe("Entry has automatic timestamps", () => {
    it("should set created_at timestamp automatically", async () => {
      const beforeCreation = new Date();

      const entry = await createTextEntry(SAMPLE_ENTRIES.happy);

      const afterCreation = new Date();

      expect(entry.created_at).toBeDefined();
      const createdAt = new Date(entry.created_at);
      expect(createdAt).toBeInstanceOf(Date);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime() - 1000
      ); // Allow 1s tolerance
      expect(createdAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime() + 1000
      ); // Allow 1s tolerance
    });

    it("should set updated_at timestamp automatically", async () => {
      const beforeCreation = new Date();

      const entry = await createTextEntry(SAMPLE_ENTRIES.happy);

      const afterCreation = new Date();

      expect(entry.updated_at).toBeDefined();
      const updatedAt = new Date(entry.updated_at);
      expect(updatedAt).toBeInstanceOf(Date);
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreation.getTime() - 1000
      ); // Allow 1s tolerance
      expect(updatedAt.getTime()).toBeLessThanOrEqual(
        afterCreation.getTime() + 1000
      ); // Allow 1s tolerance
    });

    it("should set created_at and updated_at to approximately the same time on creation", async () => {
      const entry = await createTextEntry(SAMPLE_ENTRIES.happy);

      const createdAt = new Date(entry.created_at);
      const updatedAt = new Date(entry.updated_at);
      const timeDifference = Math.abs(
        updatedAt.getTime() - createdAt.getTime()
      );

      // Timestamps should be within 1 second of each other
      expect(timeDifference).toBeLessThan(1000);
    });

    it("should maintain timestamp consistency across multiple entries", async () => {
      const entry1 = await createTextEntry(SAMPLE_ENTRIES.happy);

      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 100));

      const entry2 = await createTextEntry(SAMPLE_ENTRIES.sad);

      const createdAt1 = new Date(entry1.created_at);
      const createdAt2 = new Date(entry2.created_at);
      expect(createdAt1).toBeDefined();
      expect(createdAt2).toBeDefined();
      expect(createdAt2.getTime()).toBeGreaterThan(createdAt1.getTime());
    });
  });

  /**
   * Requirement 4.3: WHEN an entry is created
   * THEN the system SHALL be retrievable by the same user
   */
  describe("User can retrieve their own entry", () => {
    it("should allow user to retrieve entry by ID", async () => {
      const content = SAMPLE_ENTRIES.happy;
      const created = await createTextEntry(content);

      const retrieved = await getEntryById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.user_id).toBe(user.id);
      expect(retrieved.content).toBe(content);
      expect(retrieved.entry_type).toBe(EntryType.TEXT);
    });

    it("should allow user to retrieve entry in list of all entries", async () => {
      const created = await createTextEntry(SAMPLE_ENTRIES.happy);

      const entries = await getEntries();

      expect(entries).toBeDefined();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe(created.id);
      expect(entries[0].user_id).toBe(user.id);
    });

    it("should retrieve multiple entries for the same user", async () => {
      const entry1 = await createTextEntry(SAMPLE_ENTRIES.happy);
      const entry2 = await createTextEntry(SAMPLE_ENTRIES.sad);
      const entry3 = await createTextEntry(SAMPLE_ENTRIES.neutral);

      const entries = await getEntries();

      expect(entries).toHaveLength(3);
      const entryIds = entries.map((e) => e.id);
      expect(entryIds).toContain(entry1.id);
      expect(entryIds).toContain(entry2.id);
      expect(entryIds).toContain(entry3.id);
    });

    it("should preserve all entry data when retrieving", async () => {
      const content = SAMPLE_ENTRIES.excited;
      const created = await createTextEntry(content);

      const retrieved = await getEntryById(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.user_id).toBe(created.user_id);
      expect(retrieved.entry_type).toBe(created.entry_type);
      expect(retrieved.content).toBe(created.content);
      expect(retrieved.analysis_status).toBe(created.analysis_status);
      expect(new Date(retrieved.created_at).getTime()).toBe(
        new Date(created.created_at).getTime()
      );
      expect(new Date(retrieved.updated_at).getTime()).toBe(
        new Date(created.updated_at).getTime()
      );
    });
  });

  /**
   * Requirement 4.4: WHEN an entry is created
   * THEN the system SHALL not be accessible by other users
   */
  describe("User cannot access other user's entries", () => {
    let userA: TestUser;
    let userB: TestUser;

    beforeEach(async () => {
      // Create two separate users
      userA = await testHelpers.createTestUser();
      userB = await testHelpers.createTestUser();
    });

    it("should prevent user B from retrieving user A's entry by ID", async () => {
      // User A creates an entry
      await setTestSession(userA);
      const entryA = await createTextEntry(SAMPLE_ENTRIES.happy);

      // User B tries to retrieve it
      await setTestSession(userB);

      // RLS will prevent access and .single() will throw an error
      try {
        await getEntryById(entryA.id);
        // If we get here, the test should fail
        fail("Expected getEntryById to throw an error for unauthorized user");
      } catch (error: any) {
        // Verify it's an RLS/not found error
        expect(error).toBeDefined();
        expect(error.code || error.message).toBeTruthy();
      }
    });

    it("should not include other user's entries in getEntries list", async () => {
      // User A creates entries
      await setTestSession(userA);
      const entryA1 = await createTextEntry(SAMPLE_ENTRIES.happy);
      const entryA2 = await createTextEntry(SAMPLE_ENTRIES.sad);

      // User B creates entries
      await setTestSession(userB);
      const entryB1 = await createTextEntry(SAMPLE_ENTRIES.neutral);

      // User B should only see their own entry
      const entriesB = await getEntries();
      expect(entriesB).toHaveLength(1);
      expect(entriesB[0].id).toBe(entryB1.id);
      expect(entriesB[0].user_id).toBe(userB.id);

      // Verify User A's entries are not in the list
      const entryBIds = entriesB.map((e) => e.id);
      expect(entryBIds).not.toContain(entryA1.id);
      expect(entryBIds).not.toContain(entryA2.id);

      // User A should only see their own entries
      await setTestSession(userA);
      const entriesA = await getEntries();
      expect(entriesA).toHaveLength(2);
      const entryAIds = entriesA.map((e) => e.id);
      expect(entryAIds).toContain(entryA1.id);
      expect(entryAIds).toContain(entryA2.id);
      expect(entryAIds).not.toContain(entryB1.id);
    });

    it("should enforce RLS even with valid entry ID from another user", async () => {
      // User A creates an entry
      await setTestSession(userA);
      const entryA = await createTextEntry(SAMPLE_ENTRIES.happy);

      // Verify entry exists in database (admin check)
      const adminEntries = await testHelpers.queryEntriesAsAdmin(userA.id);
      expect(adminEntries).toHaveLength(1);
      expect(adminEntries[0].id).toBe(entryA.id);

      // User B tries to access it with the valid ID
      await setTestSession(userB);

      // RLS will prevent access and .single() will throw an error
      try {
        await getEntryById(entryA.id);
        // If we get here, the test should fail
        fail("Expected getEntryById to throw an error for unauthorized user");
      } catch (error: any) {
        // Verify it's an RLS/not found error
        expect(error).toBeDefined();
        expect(error.code || error.message).toBeTruthy();
      }
    });

    it("should return empty list when user has no entries", async () => {
      // User A creates entries
      await setTestSession(userA);
      await createTextEntry(SAMPLE_ENTRIES.happy);

      // User B has no entries
      await setTestSession(userB);
      const entriesB = await getEntries();

      expect(entriesB).toBeDefined();
      expect(entriesB).toHaveLength(0);
    });
  });

  /**
   * Requirement 4.5: WHEN an empty text entry is attempted
   * THEN the system SHALL reject it with a validation error
   */
  describe("Empty text entry is rejected", () => {
    it("should reject empty string entry", async () => {
      await expect(createTextEntry("")).rejects.toMatchObject({
        code: "ENTRY_EMPTY_CONTENT",
      });
    });

    it("should reject whitespace-only entry", async () => {
      await expect(createTextEntry("   ")).rejects.toMatchObject({
        code: "ENTRY_EMPTY_CONTENT",
      });
    });

    it("should reject entry with tabs and newlines only", async () => {
      await expect(createTextEntry("\t\n\r  \n")).rejects.toMatchObject({
        code: "ENTRY_EMPTY_CONTENT",
      });
    });

    it("should not create entry in database when validation fails", async () => {
      const entriesBefore = await testHelpers.queryEntriesAsAdmin(user.id);
      expect(entriesBefore).toHaveLength(0);

      try {
        await createTextEntry("   ");
      } catch (error) {
        // Expected to fail
      }

      const entriesAfter = await testHelpers.queryEntriesAsAdmin(user.id);
      expect(entriesAfter).toHaveLength(0);
    });

    it("should accept entry with valid content after whitespace", async () => {
      const content = "  Valid content with leading spaces";

      const entry = await createTextEntry(content);

      expect(entry).toBeDefined();
      expect(entry.content).toBe(content);
    });

    it("should accept very long entries", async () => {
      const longContent = SAMPLE_ENTRIES.long;

      const entry = await createTextEntry(longContent);

      expect(entry).toBeDefined();
      expect(entry.content).toBe(longContent);
      expect(entry.content.length).toBeGreaterThan(100);
    });
  });

  /**
   * Data Consistency Tests
   * Tests that validate referential integrity and data consistency
   */
  describe("Data Consistency Tests", () => {
    /**
     * Requirement 6.1: WHEN a user is deleted
     * THEN the system SHALL cascade delete all associated journal entries
     */
    describe("User deletion cascades to entries", () => {
      it("should delete all entries when user is deleted", async () => {
        // Create a user and multiple entries
        const testUser = await testHelpers.createTestUser();
        await setTestSession(testUser);

        const entry1 = await createTextEntry(SAMPLE_ENTRIES.happy);
        const entry2 = await createTextEntry(SAMPLE_ENTRIES.sad);
        const entry3 = await createTextEntry(SAMPLE_ENTRIES.neutral);

        // Verify entries exist
        const entriesBefore = await testHelpers.queryEntriesAsAdmin(
          testUser.id
        );
        expect(entriesBefore).toHaveLength(3);
        expect(entriesBefore.map((e) => e.id)).toContain(entry1.id);
        expect(entriesBefore.map((e) => e.id)).toContain(entry2.id);
        expect(entriesBefore.map((e) => e.id)).toContain(entry3.id);

        // Delete the user
        await testHelpers.deleteTestUser(testUser.id);

        // Verify entries are also deleted (cascade)
        const entriesAfter = await testHelpers.queryEntriesAsAdmin(testUser.id);
        expect(entriesAfter).toHaveLength(0);
      });

      it("should only delete entries for the deleted user, not other users", async () => {
        // Create two users with entries
        const userA = await testHelpers.createTestUser();
        const userB = await testHelpers.createTestUser();

        // User A creates entries
        await setTestSession(userA);
        const entryA1 = await createTextEntry(SAMPLE_ENTRIES.happy);
        const entryA2 = await createTextEntry(SAMPLE_ENTRIES.sad);

        // User B creates entries
        await setTestSession(userB);
        const entryB1 = await createTextEntry(SAMPLE_ENTRIES.neutral);
        const entryB2 = await createTextEntry(SAMPLE_ENTRIES.excited);

        // Verify both users have entries
        const entriesA = await testHelpers.queryEntriesAsAdmin(userA.id);
        const entriesB = await testHelpers.queryEntriesAsAdmin(userB.id);
        expect(entriesA).toHaveLength(2);
        expect(entriesB).toHaveLength(2);

        // Delete user A
        await testHelpers.deleteTestUser(userA.id);

        // Verify user A's entries are deleted
        const entriesAAfter = await testHelpers.queryEntriesAsAdmin(userA.id);
        expect(entriesAAfter).toHaveLength(0);

        // Verify user B's entries still exist
        const entriesBAfter = await testHelpers.queryEntriesAsAdmin(userB.id);
        expect(entriesBAfter).toHaveLength(2);
        expect(entriesBAfter.map((e) => e.id)).toContain(entryB1.id);
        expect(entriesBAfter.map((e) => e.id)).toContain(entryB2.id);

        // Clean up user B
        await testHelpers.deleteTestUser(userB.id);
      });

      it("should handle deletion of user with no entries", async () => {
        // Create a user without entries
        const testUser = await testHelpers.createTestUser();

        // Verify no entries exist
        const entriesBefore = await testHelpers.queryEntriesAsAdmin(
          testUser.id
        );
        expect(entriesBefore).toHaveLength(0);

        // Delete the user (should not throw error)
        await testHelpers.deleteTestUser(testUser.id);

        // Verify still no entries
        const entriesAfter = await testHelpers.queryEntriesAsAdmin(testUser.id);
        expect(entriesAfter).toHaveLength(0);
      });
    });

    /**
     * Requirement 6.2: WHEN an entry is updated
     * THEN the system SHALL update the updated_at timestamp automatically
     */
    describe("Entry update refreshes updated_at timestamp", () => {
      it("should update updated_at timestamp when entry is modified", async () => {
        // Create an entry
        const entry = await createTextEntry(SAMPLE_ENTRIES.happy);
        const originalUpdatedAt = new Date(entry.updated_at);

        // Wait a bit to ensure timestamp difference
        await new Promise((resolve) => setTimeout(resolve, 1100));

        // Update the entry
        const client = getTestClient();
        const { data: updatedEntry, error } = await client
          .from("journal_entries")
          .update({ content: "Updated content" })
          .eq("id", entry.id)
          .select()
          .single();

        expect(error).toBeNull();
        expect(updatedEntry).toBeDefined();

        const newUpdatedAt = new Date(updatedEntry.updated_at);

        // Verify updated_at has changed
        expect(newUpdatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );
        expect(
          newUpdatedAt.getTime() - originalUpdatedAt.getTime()
        ).toBeGreaterThanOrEqual(1000); // At least 1 second difference
      });

      it("should not change created_at when entry is updated", async () => {
        // Create an entry
        const entry = await createTextEntry(SAMPLE_ENTRIES.happy);
        const originalCreatedAt = new Date(entry.created_at);

        // Wait a bit
        await new Promise((resolve) => setTimeout(resolve, 1100));

        // Update the entry
        const client = getTestClient();
        const { data: updatedEntry, error } = await client
          .from("journal_entries")
          .update({ content: "Updated content" })
          .eq("id", entry.id)
          .select()
          .single();

        expect(error).toBeNull();
        expect(updatedEntry).toBeDefined();

        const newCreatedAt = new Date(updatedEntry.created_at);

        // Verify created_at has NOT changed
        expect(newCreatedAt.getTime()).toBe(originalCreatedAt.getTime());
      });

      it("should update updated_at when mood metadata is added", async () => {
        // Create an entry
        const entry = await createTextEntry(SAMPLE_ENTRIES.happy);
        const originalUpdatedAt = new Date(entry.updated_at);

        // Wait a bit
        await new Promise((resolve) => setTimeout(resolve, 1100));

        // Update with mood metadata
        const client = getTestClient();
        const moodData = {
          happiness: 0.8,
          fear: 0.1,
          sadness: 0.2,
          anger: 0.1,
          sentiment: "POSITIVE",
        };

        const { data: updatedEntry, error } = await client
          .from("journal_entries")
          .update({
            mood_metadata: moodData,
            analysis_status: AnalysisStatus.SUCCESS,
          })
          .eq("id", entry.id)
          .select()
          .single();

        expect(error).toBeNull();
        expect(updatedEntry).toBeDefined();

        const newUpdatedAt = new Date(updatedEntry.updated_at);

        // Verify updated_at has changed
        expect(newUpdatedAt.getTime()).toBeGreaterThan(
          originalUpdatedAt.getTime()
        );
      });

      it("should update updated_at for each subsequent update", async () => {
        // Create an entry
        const entry = await createTextEntry(SAMPLE_ENTRIES.happy);
        const timestamps: number[] = [new Date(entry.updated_at).getTime()];

        const client = getTestClient();

        // Perform multiple updates
        for (let i = 1; i <= 3; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1100));

          const { data: updatedEntry } = await client
            .from("journal_entries")
            .update({ content: `Update ${i}` })
            .eq("id", entry.id)
            .select()
            .single();

          timestamps.push(new Date(updatedEntry.updated_at).getTime());
        }

        // Verify each timestamp is greater than the previous
        for (let i = 1; i < timestamps.length; i++) {
          expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
        }
      });
    });

    /**
     * Requirement 6.3: WHEN multiple entries are created
     * THEN the system SHALL maintain correct ordering by created_at
     */
    describe("Multiple entries maintain correct ordering", () => {
      it("should return entries in descending order by created_at", async () => {
        // Create multiple entries with delays
        const entry1 = await createTextEntry("First entry");
        await new Promise((resolve) => setTimeout(resolve, 100));

        const entry2 = await createTextEntry("Second entry");
        await new Promise((resolve) => setTimeout(resolve, 100));

        const entry3 = await createTextEntry("Third entry");
        await new Promise((resolve) => setTimeout(resolve, 100));

        const entry4 = await createTextEntry("Fourth entry");

        // Get entries (should be ordered by created_at descending)
        const entries = await getEntries();

        expect(entries).toHaveLength(4);

        // Verify order: newest first
        expect(entries[0].id).toBe(entry4.id);
        expect(entries[1].id).toBe(entry3.id);
        expect(entries[2].id).toBe(entry2.id);
        expect(entries[3].id).toBe(entry1.id);

        // Verify timestamps are in descending order
        for (let i = 0; i < entries.length - 1; i++) {
          const currentTime = new Date(entries[i].created_at).getTime();
          const nextTime = new Date(entries[i + 1].created_at).getTime();
          expect(currentTime).toBeGreaterThanOrEqual(nextTime);
        }
      });

      it("should maintain ordering across different users", async () => {
        // Create two users
        const userA = await testHelpers.createTestUser();
        const userB = await testHelpers.createTestUser();

        // User A creates entries
        await setTestSession(userA);
        const entryA1 = await createTextEntry("User A - Entry 1");
        await new Promise((resolve) => setTimeout(resolve, 100));

        // User B creates entries
        await setTestSession(userB);
        const entryB1 = await createTextEntry("User B - Entry 1");
        await new Promise((resolve) => setTimeout(resolve, 100));

        // User A creates another entry
        await setTestSession(userA);
        const entryA2 = await createTextEntry("User A - Entry 2");

        // Check User A's entries are ordered correctly
        await setTestSession(userA);
        const entriesA = await getEntries();
        expect(entriesA).toHaveLength(2);
        expect(entriesA[0].id).toBe(entryA2.id); // Newest first
        expect(entriesA[1].id).toBe(entryA1.id);

        // Check User B's entries
        await setTestSession(userB);
        const entriesB = await getEntries();
        expect(entriesB).toHaveLength(1);
        expect(entriesB[0].id).toBe(entryB1.id);

        // Clean up
        await testHelpers.deleteTestUser(userA.id);
        await testHelpers.deleteTestUser(userB.id);
      });

      it("should maintain ordering with many entries", async () => {
        // Create many entries
        const entryIds: string[] = [];
        for (let i = 0; i < 10; i++) {
          const entry = await createTextEntry(`Entry ${i}`);
          entryIds.push(entry.id);
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Get all entries
        const entries = await getEntries();

        expect(entries).toHaveLength(10);

        // Verify they are in reverse order (newest first)
        for (let i = 0; i < 10; i++) {
          expect(entries[i].id).toBe(entryIds[9 - i]);
        }

        // Verify timestamps are strictly descending
        for (let i = 0; i < entries.length - 1; i++) {
          const currentTime = new Date(entries[i].created_at).getTime();
          const nextTime = new Date(entries[i + 1].created_at).getTime();
          expect(currentTime).toBeGreaterThanOrEqual(nextTime);
        }
      });

      it("should preserve ordering after updates", async () => {
        // Create entries
        const entry1 = await createTextEntry("First");
        await new Promise((resolve) => setTimeout(resolve, 100));

        const entry2 = await createTextEntry("Second");
        await new Promise((resolve) => setTimeout(resolve, 100));

        const entry3 = await createTextEntry("Third");

        // Update the first entry (should not change created_at order)
        const client = getTestClient();
        await client
          .from("journal_entries")
          .update({ content: "First - Updated" })
          .eq("id", entry1.id);

        // Get entries
        const entries = await getEntries();

        expect(entries).toHaveLength(3);

        // Order should still be by created_at (not updated_at)
        expect(entries[0].id).toBe(entry3.id);
        expect(entries[1].id).toBe(entry2.id);
        expect(entries[2].id).toBe(entry1.id);
      });
    });
  });
});
