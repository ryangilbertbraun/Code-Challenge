/**
 * Test Helper Utilities
 * Provides utilities for creating test users, managing authentication,
 * and querying data for integration tests
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  JournalEntry,
  TextEntry,
  EntryType,
  AnalysisStatus,
} from "../../types/entry.types";

/**
 * Test user interface
 */
export interface TestUser {
  id: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Test helpers interface
 */
export interface TestHelpers {
  // User management
  createTestUser(email?: string): Promise<TestUser>;
  authenticateAs(user: TestUser): Promise<void>;
  clearAuth(): Promise<void>;

  // Entry helpers
  createTextEntry(content: string, userId?: string): Promise<TextEntry>;

  // Admin queries (bypass RLS for assertions)
  queryEntriesAsAdmin(userId?: string): Promise<JournalEntry[]>;

  // Cleanup
  deleteTestUser(userId: string): Promise<void>;
  cleanupTestData(): Promise<void>;
}

// Supabase client with service role key (bypasses RLS)
let adminClient: SupabaseClient | null = null;

// Supabase client with anon key (respects RLS)
let anonClient: SupabaseClient | null = null;

/**
 * Get or create admin Supabase client
 */
function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    const url = process.env.TEST_SUPABASE_URL;
    const serviceRoleKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      throw new Error(
        "TEST_SUPABASE_URL and TEST_SUPABASE_SERVICE_ROLE_KEY must be set in .env.test"
      );
    }

    adminClient = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}

/**
 * Get or create anon Supabase client
 */
function getAnonClient(): SupabaseClient {
  if (!anonClient) {
    const url = process.env.TEST_SUPABASE_URL;
    const anonKey = process.env.TEST_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      throw new Error(
        "TEST_SUPABASE_URL and TEST_SUPABASE_ANON_KEY must be set in .env.test"
      );
    }

    anonClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return anonClient;
}

/**
 * Converts database row to TextEntry
 */
function toTextEntry(row: any): TextEntry {
  return {
    id: row.id,
    userId: row.user_id,
    type: EntryType.TEXT,
    content: row.content,
    moodMetadata: row.mood_metadata,
    analysisStatus: row.analysis_status as AnalysisStatus,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Converts database row to JournalEntry
 */
function toJournalEntry(row: any): JournalEntry {
  if (row.entry_type === EntryType.TEXT) {
    return toTextEntry(row);
  } else {
    // Video entry
    return {
      id: row.id,
      userId: row.user_id,
      type: EntryType.VIDEO,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      duration: row.duration,
      humeEmotionData: row.hume_emotion_data,
      humeJobId: row.hume_job_id,
      analysisStatus: row.analysis_status as AnalysisStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

/**
 * Test helpers implementation
 */
class TestHelpersImpl implements TestHelpers {
  /**
   * Create a test user using Supabase Admin API
   */
  async createTestUser(email?: string): Promise<TestUser> {
    const admin = getAdminClient();
    const userEmail = email || `test-${Date.now()}-${Math.random()}@test.com`;
    const password = "TestPassword123!";

    try {
      // Create user with admin API
      const { data: userData, error: createError } =
        await admin.auth.admin.createUser({
          email: userEmail,
          password: password,
          email_confirm: true, // Auto-confirm email for testing
        });

      if (createError || !userData.user) {
        throw new Error(
          `Failed to create test user: ${
            createError?.message || "Unknown error"
          }`
        );
      }

      // Sign in to get session tokens
      const anon = getAnonClient();
      const { data: sessionData, error: signInError } =
        await anon.auth.signInWithPassword({
          email: userEmail,
          password: password,
        });

      if (signInError || !sessionData.session) {
        throw new Error(
          `Failed to sign in test user: ${
            signInError?.message || "Unknown error"
          }`
        );
      }

      return {
        id: userData.user.id,
        email: userEmail,
        password: password,
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
      };
    } catch (error) {
      console.error("Error creating test user:", error);
      throw error;
    }
  }

  /**
   * Authenticate as a specific test user
   */
  async authenticateAs(user: TestUser): Promise<void> {
    const anon = getAnonClient();

    try {
      const { error } = await anon.auth.setSession({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
      });

      if (error) {
        throw new Error(`Failed to authenticate as user: ${error.message}`);
      }
    } catch (error) {
      console.error("Error authenticating as user:", error);
      throw error;
    }
  }

  /**
   * Clear authentication
   */
  async clearAuth(): Promise<void> {
    const anon = getAnonClient();

    try {
      await anon.auth.signOut();
    } catch (error) {
      console.error("Error clearing auth:", error);
      throw error;
    }
  }

  /**
   * Create a text entry (using admin client to bypass RLS if userId provided)
   */
  async createTextEntry(content: string, userId?: string): Promise<TextEntry> {
    const client = userId ? getAdminClient() : getAnonClient();

    try {
      // If userId not provided, get current user
      let targetUserId = userId;
      if (!targetUserId) {
        const {
          data: { user },
          error: userError,
        } = await getAnonClient().auth.getUser();

        if (userError || !user) {
          throw new Error("No authenticated user and no userId provided");
        }

        targetUserId = user.id;
      }

      const { data, error } = await client
        .from("journal_entries")
        .insert({
          user_id: targetUserId,
          entry_type: EntryType.TEXT,
          content: content,
          analysis_status: AnalysisStatus.PENDING,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create text entry: ${error.message}`);
      }

      if (!data) {
        throw new Error("Failed to create text entry: No data returned");
      }

      return toTextEntry(data);
    } catch (error) {
      console.error("Error creating text entry:", error);
      throw error;
    }
  }

  /**
   * Query entries as admin (bypasses RLS for assertions)
   */
  async queryEntriesAsAdmin(userId?: string): Promise<JournalEntry[]> {
    const admin = getAdminClient();

    try {
      let query = admin.from("journal_entries").select("*");

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) {
        throw new Error(`Failed to query entries: ${error.message}`);
      }

      return (data || []).map(toJournalEntry);
    } catch (error) {
      console.error("Error querying entries as admin:", error);
      throw error;
    }
  }

  /**
   * Delete a test user
   */
  async deleteTestUser(userId: string): Promise<void> {
    const admin = getAdminClient();

    try {
      const { error } = await admin.auth.admin.deleteUser(userId);

      if (error) {
        console.warn(
          `Warning: Failed to delete user ${userId}: ${error.message}`
        );
      }
    } catch (error) {
      console.warn("Warning: Error deleting test user:", error);
      // Don't throw - cleanup should be best-effort
    }
  }

  /**
   * Clean up all test data
   */
  async cleanupTestData(): Promise<void> {
    const admin = getAdminClient();

    try {
      // Delete all journal entries (cascading will handle related data)
      const { error: entriesError } = await admin
        .from("journal_entries")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all except impossible UUID

      if (entriesError) {
        console.warn(
          "Warning: Failed to delete entries:",
          entriesError.message
        );
      }

      // Delete all test users
      const { data: usersData, error: listError } =
        await admin.auth.admin.listUsers();

      if (listError) {
        console.warn("Warning: Failed to list users:", listError.message);
      } else if (usersData?.users) {
        // Delete users in parallel
        await Promise.all(
          usersData.users.map(async (user) => {
            try {
              await admin.auth.admin.deleteUser(user.id);
            } catch (error) {
              console.warn(`Warning: Failed to delete user ${user.id}`);
            }
          })
        );
      }

      // Clear auth session
      await this.clearAuth();
    } catch (error) {
      console.warn("Warning: Error during cleanup:", error);
      // Don't throw - cleanup should be best-effort
    }
  }
}

// Export singleton instance
export const testHelpers: TestHelpers = new TestHelpersImpl();
