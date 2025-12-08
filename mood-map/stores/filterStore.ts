import { create } from "zustand";
import {
  FilterState,
  EmotionRange,
  DEFAULT_FILTER_STATE,
} from "@/types/filter.types";
import { EntryType } from "@/types/entry.types";

/**
 * Filter store state interface
 */
interface FilterStore {
  // State
  filters: FilterState;

  // Actions
  setEmotionRange: (
    emotion: "happiness" | "fear" | "sadness" | "anger",
    range: EmotionRange
  ) => void;
  setEntryTypes: (types: EntryType[]) => void;
  setSearchText: (text: string) => void;
  resetFilters: () => void;
}

/**
 * Filter store implementation using Zustand
 * Manages filtering state for journal entries
 */
export const useFilterStore = create<FilterStore>((set) => ({
  // Initial state - use default filter state
  filters: DEFAULT_FILTER_STATE,

  /**
   * Set emotion range filter for a specific emotion
   * @param emotion - The emotion to filter (happiness, fear, sadness, anger)
   * @param range - The range with min and max values (0-1)
   */
  setEmotionRange: (emotion, range) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [emotion]: range,
      },
    }));
  },

  /**
   * Set entry type filter
   * @param types - Array of entry types to show (text, video, or both)
   */
  setEntryTypes: (types) => {
    set((state) => ({
      filters: {
        ...state.filters,
        entryTypes: types,
      },
    }));
  },

  /**
   * Set search text filter
   * @param text - Search text to filter entries
   */
  setSearchText: (text) => {
    set((state) => ({
      filters: {
        ...state.filters,
        searchText: text,
      },
    }));
  },

  /**
   * Reset all filters to default values
   * Returns emotion ranges to [0.0, 1.0], entry types to [TEXT, VIDEO], and clears search text
   */
  resetFilters: () => {
    set({ filters: DEFAULT_FILTER_STATE });
  },
}));
