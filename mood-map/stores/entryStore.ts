import { create } from "zustand";
import {
  JournalEntry,
  TextEntry,
  VideoEntry,
  MoodMetadata,
  HumeEmotionData,
  AnalysisStatus,
  EntryType,
} from "@/types/entry.types";
import { entryService } from "@/services/entryService";
import { aiService } from "@/services/aiService";
import { humeService } from "@/services/humeService";
import { AppError } from "@/types/error.types";
import { withRetry } from "@/utils/retry";

/**
 * Entry store state interface
 */
interface EntryStore {
  // State
  entries: JournalEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEntries: () => Promise<void>;
  createTextEntry: (content: string) => Promise<void>;
  createVideoEntry: (videoBlob: Blob) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  updateEntryAnalysis: (
    id: string,
    analysis: MoodMetadata | HumeEmotionData,
    status: AnalysisStatus
  ) => void;
  clearError: () => void;
}

/**
 * Triggers AI mood analysis for a text entry
 * Updates the entry with analysis results or error status
 */
async function triggerTextAnalysis(
  entryId: string,
  content: string,
  updateFn: (
    id: string,
    analysis: MoodMetadata | HumeEmotionData,
    status: AnalysisStatus
  ) => void
): Promise<void> {
  try {
    // Attempt analysis with retry logic
    const moodMetadata = await withRetry(async () => {
      return await aiService.analyzeMood(content);
    });

    // Update entry with successful analysis
    updateFn(entryId, moodMetadata, AnalysisStatus.SUCCESS);
  } catch (error) {
    console.error("Failed to analyze text entry:", error);
    // Update entry with error status
    updateFn(entryId, {} as MoodMetadata, AnalysisStatus.ERROR);
  }
}

/**
 * Triggers Hume video analysis for a video entry
 * Updates the entry with analysis results or error status
 */
async function triggerVideoAnalysis(
  entryId: string,
  videoBlob: Blob,
  updateFn: (
    id: string,
    analysis: MoodMetadata | HumeEmotionData,
    status: AnalysisStatus
  ) => void
): Promise<void> {
  try {
    // Attempt analysis with retry logic
    const humeEmotionData = await withRetry(async () => {
      return await humeService.analyzeVideo(videoBlob);
    });

    // Update entry with successful analysis
    updateFn(entryId, humeEmotionData, AnalysisStatus.SUCCESS);
  } catch (error) {
    console.error("Failed to analyze video entry:", error);
    // Update entry with error status
    updateFn(entryId, {} as HumeEmotionData, AnalysisStatus.ERROR);
  }
}

/**
 * Entry store implementation using Zustand
 */
export const useEntryStore = create<EntryStore>((set, get) => ({
  // Initial state
  entries: [],
  isLoading: false,
  error: null,

  /**
   * Fetch all journal entries for the current user
   */
  fetchEntries: async () => {
    set({ isLoading: true, error: null });

    try {
      const entries = await entryService.getEntries();
      set({ entries, isLoading: false, error: null });
    } catch (error) {
      const appError = error as AppError;
      set({
        isLoading: false,
        error: appError.message || "Failed to fetch entries",
      });
      throw error;
    }
  },

  /**
   * Create a new text journal entry with optimistic UI
   * Immediately shows entry with loading status, then triggers AI analysis
   */
  createTextEntry: async (content: string) => {
    set({ isLoading: true, error: null });

    try {
      // Create entry in database
      const newEntry = await entryService.createTextEntry(content);

      // Optimistic UI: Add entry immediately with LOADING status
      const optimisticEntry: TextEntry = {
        ...newEntry,
        analysisStatus: AnalysisStatus.LOADING,
      };

      set((state) => ({
        entries: [optimisticEntry, ...state.entries],
        isLoading: false,
        error: null,
      }));

      // Trigger AI analysis in background (non-blocking)
      // Note: We don't have the videoBlob for text entries, so we pass the content
      triggerTextAnalysis(newEntry.id, content, get().updateEntryAnalysis);
    } catch (error) {
      const appError = error as AppError;
      set({
        isLoading: false,
        error: appError.message || "Failed to create text entry",
      });
      throw error;
    }
  },

  /**
   * Create a new video journal entry with optimistic UI
   * Immediately shows entry with loading status, then triggers Hume analysis
   */
  createVideoEntry: async (videoBlob: Blob) => {
    set({ isLoading: true, error: null });

    try {
      // Create entry in database
      const newEntry = await entryService.createVideoEntry(videoBlob);

      // Optimistic UI: Add entry immediately with LOADING status
      const optimisticEntry: VideoEntry = {
        ...newEntry,
        analysisStatus: AnalysisStatus.LOADING,
      };

      set((state) => ({
        entries: [optimisticEntry, ...state.entries],
        isLoading: false,
        error: null,
      }));

      // Trigger Hume analysis in background (non-blocking)
      triggerVideoAnalysis(newEntry.id, videoBlob, get().updateEntryAnalysis);
    } catch (error) {
      const appError = error as AppError;
      set({
        isLoading: false,
        error: appError.message || "Failed to create video entry",
      });
      throw error;
    }
  },

  /**
   * Delete a journal entry
   */
  deleteEntry: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await entryService.deleteEntry(id);

      // Remove entry from state
      set((state) => ({
        entries: state.entries.filter((entry) => entry.id !== id),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const appError = error as AppError;
      set({
        isLoading: false,
        error: appError.message || "Failed to delete entry",
      });
      throw error;
    }
  },

  /**
   * Update an entry with analysis results
   * Called after AI/Hume analysis completes
   */
  updateEntryAnalysis: (
    id: string,
    analysis: MoodMetadata | HumeEmotionData,
    status: AnalysisStatus
  ) => {
    set((state) => ({
      entries: state.entries.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        // Update text entry with mood metadata
        if (entry.type === EntryType.TEXT) {
          return {
            ...entry,
            moodMetadata:
              status === AnalysisStatus.SUCCESS
                ? (analysis as MoodMetadata)
                : null,
            analysisStatus: status,
          } as TextEntry;
        }

        // Update video entry with Hume emotion data
        if (entry.type === EntryType.VIDEO) {
          return {
            ...entry,
            humeEmotionData:
              status === AnalysisStatus.SUCCESS
                ? (analysis as HumeEmotionData)
                : null,
            analysisStatus: status,
          } as VideoEntry;
        }

        return entry;
      }),
    }));
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));
