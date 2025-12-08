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
  createVideoEntry: (videoUri: string, duration?: number) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  checkVideoAnalysis: (
    entryId: string
  ) => Promise<{ success: boolean; message: string } | null>;
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
 * Checks Hume video analysis status for a video entry
 * Called on-demand when user views the entry
 * Updates the entry with analysis results if complete
 */
async function checkVideoAnalysisStatus(
  entryId: string,
  humeJobId: string,
  updateFn: (
    id: string,
    analysis: MoodMetadata | HumeEmotionData,
    status: AnalysisStatus
  ) => void
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await humeService.checkJobStatus(humeJobId);

    if (result) {
      // Analysis complete - update entry with results
      updateFn(entryId, result, AnalysisStatus.SUCCESS);
      return {
        success: true,
        message: "Analysis complete! Emotion data is now available.",
      };
    } else {
      // Still processing - keep LOADING status
      return {
        success: false,
        message: "Analysis is still processing. Please check back in a minute.",
      };
    }
  } catch (error) {
    console.error("Failed to check Hume job status:", error);
    return {
      success: false,
      message: "Unable to check status. Please try again.",
    };
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
  createVideoEntry: async (videoUri: string, duration?: number) => {
    set({ isLoading: true, error: null });

    try {
      // Create entry in database
      const newEntry = await entryService.createVideoEntry(videoUri, duration);

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

      // Note: Hume analysis status will be checked on-demand when user views the entry
      // No automatic polling to save resources
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
   * Check video analysis status for a specific entry
   * Called when user views a video entry to get latest analysis results
   * Returns a result object with success status and message
   */
  checkVideoAnalysis: async (
    entryId: string
  ): Promise<{ success: boolean; message: string } | null> => {
    const entry = get().entries.find((e) => e.id === entryId);

    if (!entry || entry.type !== EntryType.VIDEO) {
      console.warn("Entry not found or not a video entry:", entryId);
      return null;
    }

    // Only check if we have a job ID and status is LOADING or PENDING
    if (
      entry.humeJobId &&
      (entry.analysisStatus === AnalysisStatus.LOADING ||
        entry.analysisStatus === AnalysisStatus.PENDING)
    ) {
      return await checkVideoAnalysisStatus(
        entryId,
        entry.humeJobId,
        get().updateEntryAnalysis
      );
    }

    return null;
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
   * Persists to database for video entries
   */
  updateEntryAnalysis: (
    id: string,
    analysis: MoodMetadata | HumeEmotionData,
    status: AnalysisStatus
  ) => {
    // Update local state immediately
    set((state) => ({
      entries: state.entries.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        // Update text entry with mood metadata
        if (entry.type === EntryType.TEXT) {
          // Persist to database in background
          if (status === AnalysisStatus.SUCCESS) {
            entryService
              .updateTextAnalysis(id, analysis as MoodMetadata, status)
              .catch((error) => {
                console.error("Failed to persist text analysis:", error);
              });
          }

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
          // Persist to database in background
          if (status === AnalysisStatus.SUCCESS) {
            entryService
              .updateVideoAnalysis(id, analysis as HumeEmotionData, status)
              .catch((error) => {
                console.error("Failed to persist video analysis:", error);
              });
          }

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
