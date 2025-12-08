// Unit tests for filtering pipeline
// Tests deterministic order and filtering logic

import {
  applyFilterPipeline,
  applyEmotionFilters,
  applySearchFilter,
  applyEntryTypeFilter,
  sortDescending,
} from "../filterPipeline";
import {
  JournalEntry,
  TextEntry,
  VideoEntry,
  EntryType,
  AnalysisStatus,
  Sentiment,
} from "../../types/entry.types";
import { FilterState, DEFAULT_FILTER_STATE } from "../../types/filter.types";

describe("filterPipeline", () => {
  // Helper to create test text entry
  const createTextEntry = (
    id: string,
    content: string,
    happiness: number,
    fear: number,
    sadness: number,
    anger: number,
    createdAt: Date
  ): TextEntry => ({
    id,
    userId: "user1",
    type: EntryType.TEXT,
    content,
    moodMetadata: {
      happiness,
      fear,
      sadness,
      anger,
      sentiment: Sentiment.NEUTRAL,
    },
    analysisStatus: AnalysisStatus.SUCCESS,
    createdAt,
    updatedAt: createdAt,
  });

  // Helper to create test video entry
  const createVideoEntry = (
    id: string,
    happiness: number,
    fear: number,
    sadness: number,
    anger: number,
    createdAt: Date
  ): VideoEntry => ({
    id,
    userId: "user1",
    type: EntryType.VIDEO,
    videoUrl: "https://example.com/video.mp4",
    thumbnailUrl: "https://example.com/thumb.jpg",
    duration: 60,
    humeEmotionData: {
      face: {
        emotions: [
          { name: "happiness", score: happiness },
          { name: "fear", score: fear },
          { name: "sadness", score: sadness },
          { name: "anger", score: anger },
        ],
      },
    },
    analysisStatus: AnalysisStatus.SUCCESS,
    createdAt,
    updatedAt: createdAt,
  });

  describe("sortDescending", () => {
    it("should sort entries in descending chronological order", () => {
      const entries: JournalEntry[] = [
        createTextEntry(
          "1",
          "oldest",
          0.5,
          0.5,
          0.5,
          0.5,
          new Date("2024-01-01")
        ),
        createTextEntry(
          "2",
          "newest",
          0.5,
          0.5,
          0.5,
          0.5,
          new Date("2024-01-03")
        ),
        createTextEntry(
          "3",
          "middle",
          0.5,
          0.5,
          0.5,
          0.5,
          new Date("2024-01-02")
        ),
      ];

      const sorted = sortDescending(entries);

      expect(sorted[0].id).toBe("2"); // newest
      expect(sorted[1].id).toBe("3"); // middle
      expect(sorted[2].id).toBe("1"); // oldest
    });
  });

  describe("applyEmotionFilters", () => {
    it("should filter text entries by happiness range", () => {
      const entries: JournalEntry[] = [
        createTextEntry("1", "happy", 0.8, 0.2, 0.1, 0.1, new Date()),
        createTextEntry("2", "sad", 0.2, 0.1, 0.8, 0.1, new Date()),
      ];

      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        happiness: { min: 0.5, max: 1.0 },
      };

      const filtered = applyEmotionFilters(entries, filters);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should use AND logic for multiple emotion filters", () => {
      const entries: JournalEntry[] = [
        createTextEntry("1", "happy and calm", 0.8, 0.1, 0.1, 0.1, new Date()),
        createTextEntry(
          "2",
          "happy but fearful",
          0.8,
          0.8,
          0.1,
          0.1,
          new Date()
        ),
        createTextEntry("3", "sad and fearful", 0.2, 0.8, 0.8, 0.1, new Date()),
      ];

      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        happiness: { min: 0.5, max: 1.0 },
        fear: { min: 0.0, max: 0.3 },
      };

      const filtered = applyEmotionFilters(entries, filters);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1"); // Only entry with high happiness AND low fear
    });

    it("should filter video entries by emotion ranges", () => {
      const entries: JournalEntry[] = [
        createVideoEntry("1", 0.8, 0.2, 0.1, 0.1, new Date()),
        createVideoEntry("2", 0.2, 0.1, 0.8, 0.1, new Date()),
      ];

      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        happiness: { min: 0.5, max: 1.0 },
      };

      const filtered = applyEmotionFilters(entries, filters);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should exclude entries without analysis", () => {
      const entryWithoutAnalysis: TextEntry = {
        id: "1",
        userId: "user1",
        type: EntryType.TEXT,
        content: "test",
        moodMetadata: null,
        analysisStatus: AnalysisStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const entries: JournalEntry[] = [
        entryWithoutAnalysis,
        createTextEntry("2", "analyzed", 0.8, 0.2, 0.1, 0.1, new Date()),
      ];

      const filtered = applyEmotionFilters(entries, DEFAULT_FILTER_STATE);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("2");
    });
  });

  describe("applySearchFilter", () => {
    it("should filter text entries by search text", () => {
      const entries: JournalEntry[] = [
        createTextEntry(
          "1",
          "I had a great day today",
          0.8,
          0.2,
          0.1,
          0.1,
          new Date()
        ),
        createTextEntry(
          "2",
          "Feeling sad and lonely",
          0.2,
          0.1,
          0.8,
          0.1,
          new Date()
        ),
      ];

      const filtered = applySearchFilter(entries, "great");

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe("1");
    });

    it("should be case-insensitive", () => {
      const entries: JournalEntry[] = [
        createTextEntry(
          "1",
          "I had a GREAT day",
          0.8,
          0.2,
          0.1,
          0.1,
          new Date()
        ),
      ];

      const filtered = applySearchFilter(entries, "great");

      expect(filtered).toHaveLength(1);
    });

    it("should exclude video entries from search", () => {
      const entries: JournalEntry[] = [
        createTextEntry("1", "great day", 0.8, 0.2, 0.1, 0.1, new Date()),
        createVideoEntry("2", 0.8, 0.2, 0.1, 0.1, new Date()),
      ];

      const filtered = applySearchFilter(entries, "great");

      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe(EntryType.TEXT);
    });

    it("should return all entries when search text is empty", () => {
      const entries: JournalEntry[] = [
        createTextEntry("1", "test", 0.8, 0.2, 0.1, 0.1, new Date()),
        createVideoEntry("2", 0.8, 0.2, 0.1, 0.1, new Date()),
      ];

      const filtered = applySearchFilter(entries, "");

      expect(filtered).toHaveLength(2);
    });
  });

  describe("applyEntryTypeFilter", () => {
    it("should filter by text entries only", () => {
      const entries: JournalEntry[] = [
        createTextEntry("1", "text", 0.8, 0.2, 0.1, 0.1, new Date()),
        createVideoEntry("2", 0.8, 0.2, 0.1, 0.1, new Date()),
      ];

      const filtered = applyEntryTypeFilter(entries, [EntryType.TEXT]);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe(EntryType.TEXT);
    });

    it("should filter by video entries only", () => {
      const entries: JournalEntry[] = [
        createTextEntry("1", "text", 0.8, 0.2, 0.1, 0.1, new Date()),
        createVideoEntry("2", 0.8, 0.2, 0.1, 0.1, new Date()),
      ];

      const filtered = applyEntryTypeFilter(entries, [EntryType.VIDEO]);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe(EntryType.VIDEO);
    });

    it("should return all entries when both types selected", () => {
      const entries: JournalEntry[] = [
        createTextEntry("1", "text", 0.8, 0.2, 0.1, 0.1, new Date()),
        createVideoEntry("2", 0.8, 0.2, 0.1, 0.1, new Date()),
      ];

      const filtered = applyEntryTypeFilter(entries, [
        EntryType.TEXT,
        EntryType.VIDEO,
      ]);

      expect(filtered).toHaveLength(2);
    });
  });

  describe("applyFilterPipeline", () => {
    it("should apply filters in deterministic order", () => {
      const entries: JournalEntry[] = [
        createTextEntry(
          "1",
          "happy day",
          0.8,
          0.2,
          0.1,
          0.1,
          new Date("2024-01-01")
        ),
        createTextEntry(
          "2",
          "sad day",
          0.2,
          0.1,
          0.8,
          0.1,
          new Date("2024-01-02")
        ),
        createTextEntry(
          "3",
          "great happy day",
          0.9,
          0.1,
          0.1,
          0.1,
          new Date("2024-01-03")
        ),
      ];

      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        happiness: { min: 0.5, max: 1.0 },
        searchText: "happy",
      };

      const filtered = applyFilterPipeline(entries, filters);

      // Should filter by emotion first (entries 1 and 3)
      // Then by search text (entries 1 and 3 both contain "happy")
      // Then sort descending (entry 3 first, then entry 1)
      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe("3"); // newest
      expect(filtered[1].id).toBe("1"); // older
    });

    it("should produce identical results on multiple runs (deterministic)", () => {
      const entries: JournalEntry[] = [
        createTextEntry(
          "1",
          "test",
          0.8,
          0.2,
          0.1,
          0.1,
          new Date("2024-01-01")
        ),
        createTextEntry(
          "2",
          "test",
          0.7,
          0.3,
          0.2,
          0.1,
          new Date("2024-01-02")
        ),
      ];

      const filters: FilterState = {
        ...DEFAULT_FILTER_STATE,
        happiness: { min: 0.5, max: 1.0 },
      };

      const result1 = applyFilterPipeline(entries, filters);
      const result2 = applyFilterPipeline(entries, filters);

      expect(result1).toEqual(result2);
    });
  });
});
