/**
 * Property-Based Test for Text Entry Creation
 *
 * Feature: mood-map, Property 3.1: Text entry creation
 *
 * This test verifies that for any non-empty text content, creating a text entry
 * should persist it with type "text", timestamp, and user_id.
 *
 * Validates: Requirements 3.1, 3.3
 */

import fc from "fast-check";
import { entryService } from "../entryService";
import { EntryType, AnalysisStatus } from "@/types/entry.types";
import { supabase } from "@/utils/supabaseClient";

// Mock Supabase client
jest.mock("@/utils/supabaseClient", () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Test configuration
const NUM_RUNS = 100;
const TEST_TIMEOUT = 60000;

// Arbitraries for generating test data

/**
 * Generate non-empty text content
 * Ensures content is not just whitespace
 */
const nonEmptyTextArbitrary = fc
  .string({ minLength: 1, maxLength: 1000 })
  .filter((s) => s.trim().length > 0);

/**
 * Generate various types of valid text content
 */
const validTextContentArbitrary = fc.oneof(
  // Simple text
  fc
    .string({ minLength: 1, maxLength: 500 })
    .filter((s) => s.trim().length > 0),
  // Text with special characters
  fc
    .stringMatching(/^[a-zA-Z0-9\s.,!?'"()-]+$/, {
      minLength: 1,
      maxLength: 500,
    })
    .filter((s) => s.trim().length > 0),
  // Multi-line text
  fc
    .array(fc.string({ minLength: 1, maxLength: 100 }), {
      minLength: 1,
      maxLength: 10,
    })
    .map((lines) => lines.join("\n"))
    .filter((s) => s.trim().length > 0),
  // Text with emojis
  fc
    .tuple(
      fc.string({ minLength: 1, maxLength: 100 }),
      fc.constantFrom("😊", "😢", "😡", "😨", "❤️", "🎉")
    )
    .map(([text, emoji]) => `${text} ${emoji}`)
    .filter((s) => s.trim().length > 0)
);

/**
 * Generate user ID
 */
const userIdArbitrary = fc.uuid();

/**
 * Generate entry ID
 */
const entryIdArbitrary = fc.uuid();

/**
 * Generate timestamp
 */
const timestampArbitrary = fc
  .integer({ min: Date.now() - 86400000, max: Date.now() })
  .map((timestamp) => new Date(timestamp).toISOString());

describe("EntryService Property Tests", () => {
  describe("Property 3.1: Text entry creation", () => {
    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();
    });

    it(
      "should persist text entries with type TEXT for any non-empty content",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            nonEmptyTextArbitrary,
            userIdArbitrary,
            entryIdArbitrary,
            timestampArbitrary,
            async (content, userId, entryId, timestamp) => {
              // Arrange: Mock authenticated user
              (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
              });

              // Arrange: Mock database insert
              const mockDbEntry = {
                id: entryId,
                user_id: userId,
                entry_type: EntryType.TEXT,
                content: content,
                analysis_status: AnalysisStatus.PENDING,
                created_at: timestamp,
                updated_at: timestamp,
                mood_metadata: null,
              };

              (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: mockDbEntry,
                      error: null,
                    }),
                  }),
                }),
              });

              // Act: Create text entry
              const entry = await entryService.createTextEntry(content);

              // Property: Entry should have type TEXT
              expect(entry.type).toBe(EntryType.TEXT);
              expect(entry.content).toBe(content);
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should assign user_id to created text entries",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            nonEmptyTextArbitrary,
            userIdArbitrary,
            entryIdArbitrary,
            timestampArbitrary,
            async (content, userId, entryId, timestamp) => {
              // Arrange: Mock authenticated user
              (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
              });

              // Arrange: Mock database insert
              const mockDbEntry = {
                id: entryId,
                user_id: userId,
                entry_type: EntryType.TEXT,
                content: content,
                analysis_status: AnalysisStatus.PENDING,
                created_at: timestamp,
                updated_at: timestamp,
                mood_metadata: null,
              };

              (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: mockDbEntry,
                      error: null,
                    }),
                  }),
                }),
              });

              // Act: Create text entry
              const entry = await entryService.createTextEntry(content);

              // Property: Entry should have the authenticated user's ID
              expect(entry.userId).toBe(userId);
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should assign timestamps to created text entries",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            nonEmptyTextArbitrary,
            userIdArbitrary,
            entryIdArbitrary,
            timestampArbitrary,
            async (content, userId, entryId, timestamp) => {
              // Arrange: Mock authenticated user
              (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
              });

              // Arrange: Mock database insert
              const mockDbEntry = {
                id: entryId,
                user_id: userId,
                entry_type: EntryType.TEXT,
                content: content,
                analysis_status: AnalysisStatus.PENDING,
                created_at: timestamp,
                updated_at: timestamp,
                mood_metadata: null,
              };

              (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: mockDbEntry,
                      error: null,
                    }),
                  }),
                }),
              });

              // Act: Create text entry
              const entry = await entryService.createTextEntry(content);

              // Property: Entry should have valid timestamps
              expect(entry.createdAt).toBeInstanceOf(Date);
              expect(entry.updatedAt).toBeInstanceOf(Date);

              // Timestamps should be valid dates
              expect(entry.createdAt.getTime()).toBeGreaterThan(0);
              expect(entry.updatedAt.getTime()).toBeGreaterThan(0);
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should initialize analysis status as PENDING",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            nonEmptyTextArbitrary,
            userIdArbitrary,
            entryIdArbitrary,
            timestampArbitrary,
            async (content, userId, entryId, timestamp) => {
              // Arrange: Mock authenticated user
              (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
              });

              // Arrange: Mock database insert
              const mockDbEntry = {
                id: entryId,
                user_id: userId,
                entry_type: EntryType.TEXT,
                content: content,
                analysis_status: AnalysisStatus.PENDING,
                created_at: timestamp,
                updated_at: timestamp,
                mood_metadata: null,
              };

              (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: mockDbEntry,
                      error: null,
                    }),
                  }),
                }),
              });

              // Act: Create text entry
              const entry = await entryService.createTextEntry(content);

              // Property: Entry should have PENDING analysis status
              expect(entry.analysisStatus).toBe(AnalysisStatus.PENDING);
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should handle various text content formats",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            validTextContentArbitrary,
            userIdArbitrary,
            entryIdArbitrary,
            timestampArbitrary,
            async (content, userId, entryId, timestamp) => {
              // Arrange: Mock authenticated user
              (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
              });

              // Arrange: Mock database insert
              const mockDbEntry = {
                id: entryId,
                user_id: userId,
                entry_type: EntryType.TEXT,
                content: content,
                analysis_status: AnalysisStatus.PENDING,
                created_at: timestamp,
                updated_at: timestamp,
                mood_metadata: null,
              };

              (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: mockDbEntry,
                      error: null,
                    }),
                  }),
                }),
              });

              // Act: Create text entry
              const entry = await entryService.createTextEntry(content);

              // Property: Entry should preserve content exactly
              expect(entry.type).toBe(EntryType.TEXT);
              expect(entry.content).toBe(content);
              expect(entry.userId).toBe(userId);
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should call database insert with correct parameters",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            nonEmptyTextArbitrary,
            userIdArbitrary,
            entryIdArbitrary,
            timestampArbitrary,
            async (content, userId, entryId, timestamp) => {
              // Arrange: Mock authenticated user
              (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
              });

              // Arrange: Mock database insert
              const mockDbEntry = {
                id: entryId,
                user_id: userId,
                entry_type: EntryType.TEXT,
                content: content,
                analysis_status: AnalysisStatus.PENDING,
                created_at: timestamp,
                updated_at: timestamp,
                mood_metadata: null,
              };

              const mockInsert = jest.fn().mockReturnValue({
                select: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({
                    data: mockDbEntry,
                    error: null,
                  }),
                }),
              });

              (supabase.from as jest.Mock).mockReturnValue({
                insert: mockInsert,
              });

              // Act: Create text entry
              await entryService.createTextEntry(content);

              // Property: Database insert should be called with correct parameters
              expect(supabase.from).toHaveBeenCalledWith("journal_entries");
              expect(mockInsert).toHaveBeenCalledWith({
                user_id: userId,
                entry_type: EntryType.TEXT,
                content: content,
                analysis_status: AnalysisStatus.PENDING,
              });
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );

    it(
      "should preserve content integrity (no modification)",
      async () => {
        await fc.assert(
          fc.asyncProperty(
            nonEmptyTextArbitrary,
            userIdArbitrary,
            entryIdArbitrary,
            timestampArbitrary,
            async (content, userId, entryId, timestamp) => {
              // Arrange: Mock authenticated user
              (supabase.auth.getUser as jest.Mock).mockResolvedValue({
                data: { user: { id: userId } },
                error: null,
              });

              // Arrange: Mock database insert
              const mockDbEntry = {
                id: entryId,
                user_id: userId,
                entry_type: EntryType.TEXT,
                content: content,
                analysis_status: AnalysisStatus.PENDING,
                created_at: timestamp,
                updated_at: timestamp,
                mood_metadata: null,
              };

              (supabase.from as jest.Mock).mockReturnValue({
                insert: jest.fn().mockReturnValue({
                  select: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: mockDbEntry,
                      error: null,
                    }),
                  }),
                }),
              });

              // Act: Create text entry
              const entry = await entryService.createTextEntry(content);

              // Property: Content should be preserved exactly (no trimming, no modification)
              expect(entry.content).toBe(content);
              expect(entry.content.length).toBe(content.length);
            }
          ),
          { numRuns: NUM_RUNS }
        );
      },
      TEST_TIMEOUT
    );
  });
});
