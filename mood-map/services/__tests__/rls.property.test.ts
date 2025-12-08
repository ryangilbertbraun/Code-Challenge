/**
 * Property-Based Test for Row Level Security (RLS) Enforcement
 *
 * Feature: mindful-journal-app, Property 11.2: Row-level security enforcement
 *
 * This test verifies that Supabase Row Level Security policies correctly
 * enforce data isolation between users. Each user should only be able to
 * access their own journal entries.
 *
 * Validates: Requirements 11.5
 */

import fc from "fast-check";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { EntryType, AnalysisStatus } from "@/types/entry.types";
import "react-native-url-polyfill/auto";

// Test configuration
const NUM_RUNS = 100;
const TEST_TIMEOUT = 60000; // 60 seconds for integration tests

// Check if Supabase is configured with real values (not test placeholders)
const isSupabaseConfigured =
  process.env.EXPO_PUBLIC_SUPABASE_URL &&
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL.includes("your_") &&
  !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.includes("your_") &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL.includes("test.supabase.co") &&
  !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.includes("test-anon-key");

// Create Supabase client only if configured
let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );
}

// Arbitraries for generating test data
const entryTypeArbitrary = fc.constantFrom(EntryType.TEXT, EntryType.VIDEO);

const textContentArbitrary = fc
  .string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.trim().length > 0);

const analysisStatusArbitrary = fc.constantFrom(
  AnalysisStatus.PENDING,
  AnalysisStatus.LOADING,
  AnalysisStatus.SUCCESS,
  AnalysisStatus.ERROR
);

// Helper to create a test user
async function createTestUser(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  return data;
}

// Helper to sign in as a user
async function signInAsUser(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in: ${error.message}`);
  }

  return data;
}

// Helper to create a journal entry
async function createJournalEntry(
  entryType: EntryType,
  content: string,
  analysisStatus: AnalysisStatus
) {
  if (!supabase) throw new Error("Supabase not configured");

  // Get the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No authenticated user");
  }

  const entryData: any = {
    user_id: user.id, // Set user_id from authenticated user
    entry_type: entryType,
    analysis_status: analysisStatus,
  };

  if (entryType === EntryType.TEXT) {
    entryData.content = content;
  } else {
    // For video entries, we need minimal required fields
    entryData.video_url = `https://example.com/video/${Date.now()}.mp4`;
    entryData.thumbnail_url = `https://example.com/thumb/${Date.now()}.jpg`;
    entryData.duration = 60;
  }

  const { data, error } = await supabase
    .from("journal_entries")
    .insert(entryData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create entry: ${error.message}`);
  }

  return data;
}

// Helper to query entries
async function queryAllEntries() {
  if (!supabase) throw new Error("Supabase not configured");
  const { data, error } = await supabase.from("journal_entries").select("*");

  if (error) {
    throw new Error(`Failed to query entries: ${error.message}`);
  }

  return data || [];
}

// Helper to cleanup test data
async function cleanupTestUser(userId: string) {
  if (!supabase) return;
  try {
    // Delete all entries for this user (as admin)
    await supabase.from("journal_entries").delete().eq("user_id", userId);
  } catch (error) {
    console.warn("Cleanup warning:", error);
  }
}

describe("RLS Property Tests", () => {
  const describeOrSkip = isSupabaseConfigured ? describe : describe.skip;

  describeOrSkip("Property 11.2: Row-level security enforcement", () => {
    let testUsers: Array<{
      email: string;
      password: string;
      userId: string;
    }> = [];

    afterAll(async () => {
      if (!supabase) return;
      // Cleanup all test users
      for (const user of testUsers) {
        await cleanupTestUser(user.userId);
      }
      await supabase.auth.signOut();
    });

    it(
      "should enforce that users can only query their own entries",
      async () => {
        // Generate unique test user credentials
        const timestamp = Date.now();
        const userAEmail = `test_user_a_${timestamp}@example.com`;
        const userBEmail = `test_user_b_${timestamp}@example.com`;
        const password = "TestPassword123!";

        // Create two test users
        const userAData = await createTestUser(userAEmail, password);
        const userBData = await createTestUser(userBEmail, password);

        if (!userAData.user || !userBData.user) {
          throw new Error("Failed to create test users");
        }

        testUsers.push(
          { email: userAEmail, password, userId: userAData.user.id },
          { email: userBEmail, password, userId: userBData.user.id }
        );

        // Property test: For any entry created by User A, User B should not see it
        await fc.assert(
          fc.asyncProperty(
            entryTypeArbitrary,
            textContentArbitrary,
            analysisStatusArbitrary,
            async (entryType, content, analysisStatus) => {
              // Sign in as User A
              await signInAsUser(userAEmail, password);

              // User A creates an entry
              const userAEntry = await createJournalEntry(
                entryType,
                content,
                analysisStatus
              );

              // Verify User A can see their own entry
              const userAEntries = await queryAllEntries();
              const userACanSeeOwnEntry = userAEntries.some(
                (e) => e.id === userAEntry.id
              );

              expect(userACanSeeOwnEntry).toBe(true);

              // Sign out and sign in as User B
              await supabase.auth.signOut();
              await signInAsUser(userBEmail, password);

              // User B queries all entries
              const userBEntries = await queryAllEntries();

              // Property: User B should NOT see User A's entry
              const userBCanSeeUserAEntry = userBEntries.some(
                (e) => e.id === userAEntry.id
              );

              expect(userBCanSeeUserAEntry).toBe(false);

              // Property: All entries User B sees should belong to User B
              const allEntriesBelongToUserB = userBEntries.every(
                (e) => e.user_id === userBData.user!.id
              );

              expect(allEntriesBelongToUserB).toBe(true);

              // Cleanup: Delete the entry as User A
              await supabase.auth.signOut();
              await signInAsUser(userAEmail, password);
              await supabase
                .from("journal_entries")
                .delete()
                .eq("id", userAEntry.id);
            }
          ),
          {
            numRuns: 5, // Reduced runs for integration test
            timeout: TEST_TIMEOUT,
          }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should prevent users from inserting entries with another user's ID",
      async () => {
        // Generate unique test user credentials
        const timestamp = Date.now();
        const userAEmail = `test_user_insert_a_${timestamp}@example.com`;
        const userBEmail = `test_user_insert_b_${timestamp}@example.com`;
        const password = "TestPassword123!";

        // Create two test users
        const userAData = await createTestUser(userAEmail, password);
        const userBData = await createTestUser(userBEmail, password);

        if (!userAData.user || !userBData.user) {
          throw new Error("Failed to create test users");
        }

        testUsers.push(
          { email: userAEmail, password, userId: userAData.user.id },
          { email: userBEmail, password, userId: userBData.user.id }
        );

        // Sign in as User B
        await signInAsUser(userBEmail, password);

        // Try to insert an entry with User A's ID (should fail or be rejected by RLS)
        const { data, error } = await supabase
          .from("journal_entries")
          .insert({
            user_id: userAData.user.id, // Trying to insert with User A's ID
            entry_type: EntryType.TEXT,
            content: "Malicious entry",
            analysis_status: AnalysisStatus.SUCCESS,
          })
          .select();

        // Property: Either the insert should fail, or if it succeeds,
        // the user_id should be automatically set to User B's ID (not User A's)
        if (data && data.length > 0) {
          expect(data[0].user_id).toBe(userBData.user.id);
          // Cleanup
          await supabase.from("journal_entries").delete().eq("id", data[0].id);
        } else {
          // Insert failed, which is also acceptable
          expect(error).toBeTruthy();
        }
      },
      TEST_TIMEOUT
    );

    it(
      "should prevent users from updating another user's entries",
      async () => {
        // Generate unique test user credentials
        const timestamp = Date.now();
        const userAEmail = `test_user_update_a_${timestamp}@example.com`;
        const userBEmail = `test_user_update_b_${timestamp}@example.com`;
        const password = "TestPassword123!";

        // Create two test users
        const userAData = await createTestUser(userAEmail, password);
        const userBData = await createTestUser(userBEmail, password);

        if (!userAData.user || !userBData.user) {
          throw new Error("Failed to create test users");
        }

        testUsers.push(
          { email: userAEmail, password, userId: userAData.user.id },
          { email: userBEmail, password, userId: userBData.user.id }
        );

        // Sign in as User A and create an entry
        await signInAsUser(userAEmail, password);
        const userAEntry = await createJournalEntry(
          EntryType.TEXT,
          "User A's private entry",
          AnalysisStatus.SUCCESS
        );

        // Sign out and sign in as User B
        await supabase.auth.signOut();
        await signInAsUser(userBEmail, password);

        // Try to update User A's entry
        const { data, error } = await supabase
          .from("journal_entries")
          .update({ content: "User B trying to modify" })
          .eq("id", userAEntry.id)
          .select();

        // Property: Update should fail or return no rows
        expect(data?.length || 0).toBe(0);

        // Verify the entry wasn't modified
        await supabase.auth.signOut();
        await signInAsUser(userAEmail, password);
        const { data: verifyData } = await supabase
          .from("journal_entries")
          .select("content")
          .eq("id", userAEntry.id)
          .single();

        expect(verifyData?.content).toBe("User A's private entry");

        // Cleanup
        await supabase.from("journal_entries").delete().eq("id", userAEntry.id);
      },
      TEST_TIMEOUT
    );

    it(
      "should prevent users from deleting another user's entries",
      async () => {
        // Generate unique test user credentials
        const timestamp = Date.now();
        const userAEmail = `test_user_delete_a_${timestamp}@example.com`;
        const userBEmail = `test_user_delete_b_${timestamp}@example.com`;
        const password = "TestPassword123!";

        // Create two test users
        const userAData = await createTestUser(userAEmail, password);
        const userBData = await createTestUser(userBEmail, password);

        if (!userAData.user || !userBData.user) {
          throw new Error("Failed to create test users");
        }

        testUsers.push(
          { email: userAEmail, password, userId: userAData.user.id },
          { email: userBEmail, password, userId: userBData.user.id }
        );

        // Sign in as User A and create an entry
        await signInAsUser(userAEmail, password);
        const userAEntry = await createJournalEntry(
          EntryType.TEXT,
          "User A's entry to protect",
          AnalysisStatus.SUCCESS
        );

        // Sign out and sign in as User B
        await supabase.auth.signOut();
        await signInAsUser(userBEmail, password);

        // Try to delete User A's entry
        const { data, error } = await supabase
          .from("journal_entries")
          .delete()
          .eq("id", userAEntry.id)
          .select();

        // Property: Delete should fail or return no rows
        expect(data?.length || 0).toBe(0);

        // Verify the entry still exists
        await supabase.auth.signOut();
        await signInAsUser(userAEmail, password);
        const { data: verifyData } = await supabase
          .from("journal_entries")
          .select("id")
          .eq("id", userAEntry.id);

        expect(verifyData?.length).toBe(1);

        // Cleanup
        await supabase.from("journal_entries").delete().eq("id", userAEntry.id);
      },
      TEST_TIMEOUT
    );
  });

  if (!isSupabaseConfigured) {
    it("should skip RLS tests when Supabase is not configured", () => {
      console.warn("⚠️  Supabase is not configured. RLS tests are skipped.");
      console.warn(
        "   To run these tests, configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
      );
      expect(true).toBe(true);
    });
  }
});
