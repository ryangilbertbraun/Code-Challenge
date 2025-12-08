import { create } from "zustand";
import { AIInsights } from "@/types/insights.types";
import { insightsService } from "@/services/insightsService";

/**
 * Insights store state interface
 */
interface InsightsStore {
  // State
  insights: AIInsights | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  fetchInsights: () => Promise<void>;
  clearError: () => void;
  shouldRefresh: () => boolean;
}

// Cache insights for 1 hour
const CACHE_DURATION_MS = 60 * 60 * 1000;

/**
 * Insights store implementation using Zustand
 */
export const useInsightsStore = create<InsightsStore>((set, get) => ({
  // Initial state
  insights: null,
  isLoading: false,
  error: null,
  lastFetched: null,

  /**
   * Fetch AI insights for the current user
   * Uses caching to avoid unnecessary API calls
   */
  fetchInsights: async () => {
    // Check if we should use cached data
    if (!get().shouldRefresh() && get().insights) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const insights = await insightsService.getInsights();
      set({
        insights,
        isLoading: false,
        error: null,
        lastFetched: new Date(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch insights";
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Check if insights should be refreshed
   * Returns true if cache is stale or no data exists
   */
  shouldRefresh: () => {
    const { lastFetched } = get();
    if (!lastFetched) return true;

    const now = new Date().getTime();
    const lastFetchTime = lastFetched.getTime();
    return now - lastFetchTime > CACHE_DURATION_MS;
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  },
}));
