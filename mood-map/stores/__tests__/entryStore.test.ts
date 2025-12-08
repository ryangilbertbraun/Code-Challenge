/**
 * Unit tests for Entry Store
 *
 * These tests verify the basic functionality of the entry store,
 * including state management, optimistic UI, and analysis triggering.
 */

import { useEntryStore } from "../entryStore";
import { entryService } from "@/services/entryService";
import { aiService } from "@/services/aiService";
import { humeService } from "@/services/humeService";
import {
  EntryType,
  AnalysisStatus,
  Sentiment,
  TextEntry,
  VideoEntry,
} from "@/types/entry.types";

// Mock dependencies
jest.mock("@/services/entryService");
jest.mock("@/services/aiService");
jest.mock("@/services/humeService");
jest.mock("@/utils/retry", () => ({
  withRetry: jest.fn((fn) => fn()),
}));

describe("Entry Store", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset the store state
    const store = useEntryStore.getState();
    useEntryStore.setState({
      entries: [],
      isLoading: false,
      error: null,
    });
  });

  describe("fetchEntries", () => {
    it("should fetch entries and update state", async () => {
      const mockEntries: TextEntry[] = [
        {
          id: "1",
          userId: "user1",
          type: EntryType.TEXT,
          content: "Test entry",
          moodMetadata: null,
          analysisStatus: AnalysisStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (entryService.getEntries as jest.Mock).mockResolvedValue(mockEntries);

      const store = useEntryStore.getState();
      await store.fetchEntries();

      const state = useEntryStore.getState();
      expect(state.entries).toEqual(mockEntries);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should handle fetch errors", async () => {
      const mockError = {
        code: "NETWORK_ERROR",
        message: "Failed to fetch entries",
        retryable: true,
      };

      (entryService.getEntries as jest.Mock).mockRejectedValue(mockError);

      const store = useEntryStore.getState();

      await expect(store.fetchEntries()).rejects.toEqual(mockError);

      const state = useEntryStore.getState();
      expect(state.error).toBe("Failed to fetch entries");
      expect(state.isLoading).toBe(false);
    });
  });

  describe("createTextEntry", () => {
    it("should create text entry with optimistic UI", async () => {
      const mockEntry: TextEntry = {
        id: "1",
        userId: "user1",
        type: EntryType.TEXT,
        content: "Test entry",
        moodMetadata: null,
        analysisStatus: AnalysisStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (entryService.createTextEntry as jest.Mock).mockResolvedValue(mockEntry);

      const store = useEntryStore.getState();
      await store.createTextEntry("Test entry");

      const state = useEntryStore.getState();

      // Verify optimistic UI: entry added immediately with LOADING status
      expect(state.entries).toHaveLength(1);
      expect(state.entries[0].id).toBe("1");
      expect(state.entries[0].analysisStatus).toBe(AnalysisStatus.LOADING);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should handle creation errors", async () => {
      const mockError = {
        code: "ENTRY_EMPTY_CONTENT",
        message: "Entry content cannot be empty",
        retryable: false,
      };

      (entryService.createTextEntry as jest.Mock).mockRejectedValue(mockError);

      const store = useEntryStore.getState();

      await expect(store.createTextEntry("")).rejects.toEqual(mockError);

      const state = useEntryStore.getState();
      expect(state.error).toBe("Entry content cannot be empty");
      expect(state.entries).toHaveLength(0);
    });
  });

  describe("createVideoEntry", () => {
    it("should create video entry with optimistic UI", async () => {
      const mockEntry: VideoEntry = {
        id: "1",
        userId: "user1",
        type: EntryType.VIDEO,
        videoUrl: "https://example.com/video.mp4",
        thumbnailUrl: "https://example.com/thumb.jpg",
        duration: 60,
        humeEmotionData: null,
        analysisStatus: AnalysisStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockBlob = new Blob(["video data"], { type: "video/mp4" });

      (entryService.createVideoEntry as jest.Mock).mockResolvedValue(mockEntry);

      const store = useEntryStore.getState();
      await store.createVideoEntry(mockBlob);

      const state = useEntryStore.getState();

      // Verify optimistic UI: entry added immediately with LOADING status
      expect(state.entries).toHaveLength(1);
      expect(state.entries[0].id).toBe("1");
      expect(state.entries[0].analysisStatus).toBe(AnalysisStatus.LOADING);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("deleteEntry", () => {
    it("should delete entry from state", async () => {
      const mockEntry: TextEntry = {
        id: "1",
        userId: "user1",
        type: EntryType.TEXT,
        content: "Test entry",
        moodMetadata: null,
        analysisStatus: AnalysisStatus.SUCCESS,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set initial state with an entry
      useEntryStore.setState({ entries: [mockEntry] });

      (entryService.deleteEntry as jest.Mock).mockResolvedValue(undefined);

      const store = useEntryStore.getState();
      await store.deleteEntry("1");

      const state = useEntryStore.getState();
      expect(state.entries).toHaveLength(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("updateEntryAnalysis", () => {
    it("should update text entry with mood metadata", () => {
      const mockEntry: TextEntry = {
        id: "1",
        userId: "user1",
        type: EntryType.TEXT,
        content: "Test entry",
        moodMetadata: null,
        analysisStatus: AnalysisStatus.LOADING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMoodMetadata = {
        happiness: 0.8,
        fear: 0.1,
        sadness: 0.2,
        anger: 0.1,
        sentiment: Sentiment.POSITIVE,
      };

      // Set initial state
      useEntryStore.setState({ entries: [mockEntry] });

      const store = useEntryStore.getState();
      store.updateEntryAnalysis("1", mockMoodMetadata, AnalysisStatus.SUCCESS);

      const state = useEntryStore.getState();
      const updatedEntry = state.entries[0] as TextEntry;

      expect(updatedEntry.moodMetadata).toEqual(mockMoodMetadata);
      expect(updatedEntry.analysisStatus).toBe(AnalysisStatus.SUCCESS);
    });

    it("should update video entry with Hume emotion data", () => {
      const mockEntry: VideoEntry = {
        id: "1",
        userId: "user1",
        type: EntryType.VIDEO,
        videoUrl: "https://example.com/video.mp4",
        thumbnailUrl: "https://example.com/thumb.jpg",
        duration: 60,
        humeEmotionData: null,
        analysisStatus: AnalysisStatus.LOADING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockHumeData = {
        face: {
          emotions: [
            { name: "joy", score: 0.8 },
            { name: "sadness", score: 0.2 },
          ],
        },
      };

      // Set initial state
      useEntryStore.setState({ entries: [mockEntry] });

      const store = useEntryStore.getState();
      store.updateEntryAnalysis("1", mockHumeData, AnalysisStatus.SUCCESS);

      const state = useEntryStore.getState();
      const updatedEntry = state.entries[0] as VideoEntry;

      expect(updatedEntry.humeEmotionData).toEqual(mockHumeData);
      expect(updatedEntry.analysisStatus).toBe(AnalysisStatus.SUCCESS);
    });

    it("should set error status when analysis fails", () => {
      const mockEntry: TextEntry = {
        id: "1",
        userId: "user1",
        type: EntryType.TEXT,
        content: "Test entry",
        moodMetadata: null,
        analysisStatus: AnalysisStatus.LOADING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set initial state
      useEntryStore.setState({ entries: [mockEntry] });

      const store = useEntryStore.getState();
      store.updateEntryAnalysis("1", {} as any, AnalysisStatus.ERROR);

      const state = useEntryStore.getState();
      const updatedEntry = state.entries[0] as TextEntry;

      expect(updatedEntry.moodMetadata).toBeNull();
      expect(updatedEntry.analysisStatus).toBe(AnalysisStatus.ERROR);
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      // Set initial state with error
      useEntryStore.setState({ error: "Some error" });

      const store = useEntryStore.getState();
      store.clearError();

      const state = useEntryStore.getState();
      expect(state.error).toBeNull();
    });
  });
});
