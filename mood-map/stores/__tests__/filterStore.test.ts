import { renderHook, act } from "@testing-library/react-native";
import { useFilterStore } from "../filterStore";
import { EntryType } from "@/types/entry.types";
import { DEFAULT_FILTER_STATE } from "@/types/filter.types";

describe("filterStore", () => {
  beforeEach(() => {
    // Reset store to default state before each test
    const { result } = renderHook(() => useFilterStore());
    act(() => {
      result.current.resetFilters();
    });
  });

  describe("Initial State", () => {
    it("should initialize with default filter state", () => {
      const { result } = renderHook(() => useFilterStore());

      expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE);
    });
  });

  describe("setEmotionRange", () => {
    it("should update happiness range", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEmotionRange("happiness", { min: 0.5, max: 0.8 });
      });

      expect(result.current.filters.happiness).toEqual({ min: 0.5, max: 0.8 });
      // Other filters should remain unchanged
      expect(result.current.filters.fear).toEqual(DEFAULT_FILTER_STATE.fear);
    });

    it("should update fear range", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEmotionRange("fear", { min: 0.2, max: 0.6 });
      });

      expect(result.current.filters.fear).toEqual({ min: 0.2, max: 0.6 });
    });

    it("should update sadness range", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEmotionRange("sadness", { min: 0.1, max: 0.9 });
      });

      expect(result.current.filters.sadness).toEqual({ min: 0.1, max: 0.9 });
    });

    it("should update anger range", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEmotionRange("anger", { min: 0.3, max: 0.7 });
      });

      expect(result.current.filters.anger).toEqual({ min: 0.3, max: 0.7 });
    });

    it("should allow multiple emotion ranges to be set independently", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEmotionRange("happiness", { min: 0.5, max: 1.0 });
        result.current.setEmotionRange("sadness", { min: 0.0, max: 0.3 });
      });

      expect(result.current.filters.happiness).toEqual({ min: 0.5, max: 1.0 });
      expect(result.current.filters.sadness).toEqual({ min: 0.0, max: 0.3 });
      expect(result.current.filters.fear).toEqual(DEFAULT_FILTER_STATE.fear);
      expect(result.current.filters.anger).toEqual(DEFAULT_FILTER_STATE.anger);
    });
  });

  describe("setEntryTypes", () => {
    it("should update entry types to text only", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEntryTypes([EntryType.TEXT]);
      });

      expect(result.current.filters.entryTypes).toEqual([EntryType.TEXT]);
    });

    it("should update entry types to video only", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEntryTypes([EntryType.VIDEO]);
      });

      expect(result.current.filters.entryTypes).toEqual([EntryType.VIDEO]);
    });

    it("should update entry types to both", () => {
      const { result } = renderHook(() => useFilterStore());

      // First set to text only
      act(() => {
        result.current.setEntryTypes([EntryType.TEXT]);
      });

      // Then set back to both
      act(() => {
        result.current.setEntryTypes([EntryType.TEXT, EntryType.VIDEO]);
      });

      expect(result.current.filters.entryTypes).toEqual([
        EntryType.TEXT,
        EntryType.VIDEO,
      ]);
    });
  });

  describe("setSearchText", () => {
    it("should update search text", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setSearchText("happy day");
      });

      expect(result.current.filters.searchText).toBe("happy day");
    });

    it("should clear search text when set to empty string", () => {
      const { result } = renderHook(() => useFilterStore());

      // Set search text
      act(() => {
        result.current.setSearchText("test");
      });

      expect(result.current.filters.searchText).toBe("test");

      // Clear search text
      act(() => {
        result.current.setSearchText("");
      });

      expect(result.current.filters.searchText).toBe("");
    });

    it("should preserve other filters when updating search text", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEmotionRange("happiness", { min: 0.5, max: 1.0 });
        result.current.setSearchText("test");
      });

      expect(result.current.filters.searchText).toBe("test");
      expect(result.current.filters.happiness).toEqual({ min: 0.5, max: 1.0 });
    });
  });

  describe("resetFilters", () => {
    it("should reset all filters to default values", () => {
      const { result } = renderHook(() => useFilterStore());

      // Modify all filters
      act(() => {
        result.current.setEmotionRange("happiness", { min: 0.5, max: 0.8 });
        result.current.setEmotionRange("fear", { min: 0.2, max: 0.6 });
        result.current.setEmotionRange("sadness", { min: 0.1, max: 0.9 });
        result.current.setEmotionRange("anger", { min: 0.3, max: 0.7 });
        result.current.setEntryTypes([EntryType.TEXT]);
        result.current.setSearchText("test search");
      });

      // Verify filters were modified
      expect(result.current.filters).not.toEqual(DEFAULT_FILTER_STATE);

      // Reset filters
      act(() => {
        result.current.resetFilters();
      });

      // Verify all filters are back to default
      expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE);
    });

    it("should reset emotion ranges to [0.0, 1.0]", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEmotionRange("happiness", { min: 0.5, max: 0.8 });
        result.current.resetFilters();
      });

      expect(result.current.filters.happiness).toEqual({ min: 0.0, max: 1.0 });
      expect(result.current.filters.fear).toEqual({ min: 0.0, max: 1.0 });
      expect(result.current.filters.sadness).toEqual({ min: 0.0, max: 1.0 });
      expect(result.current.filters.anger).toEqual({ min: 0.0, max: 1.0 });
    });

    it("should reset entry types to both text and video", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setEntryTypes([EntryType.TEXT]);
        result.current.resetFilters();
      });

      expect(result.current.filters.entryTypes).toEqual([
        EntryType.TEXT,
        EntryType.VIDEO,
      ]);
    });

    it("should clear search text", () => {
      const { result } = renderHook(() => useFilterStore());

      act(() => {
        result.current.setSearchText("test search");
        result.current.resetFilters();
      });

      expect(result.current.filters.searchText).toBe("");
    });
  });

  describe("Requirements Validation", () => {
    it("should satisfy Requirement 6.6: Filter reset returns to default values", () => {
      const { result } = renderHook(() => useFilterStore());

      // Set various filters
      act(() => {
        result.current.setEmotionRange("happiness", { min: 0.7, max: 1.0 });
        result.current.setEntryTypes([EntryType.VIDEO]);
        result.current.setSearchText("mood");
      });

      // Reset
      act(() => {
        result.current.resetFilters();
      });

      // Verify all filters are at default values
      expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE);
    });

    it("should satisfy Requirement 7.5: Clear search preserves filters", () => {
      const { result } = renderHook(() => useFilterStore());

      // Set emotion filter and search text
      act(() => {
        result.current.setEmotionRange("happiness", { min: 0.6, max: 0.9 });
        result.current.setSearchText("happy");
      });

      // Clear only search text
      act(() => {
        result.current.setSearchText("");
      });

      // Emotion filter should be preserved
      expect(result.current.filters.happiness).toEqual({ min: 0.6, max: 0.9 });
      expect(result.current.filters.searchText).toBe("");
    });

    it("should satisfy Requirement 9.3: State management with clear separation", () => {
      const { result } = renderHook(() => useFilterStore());

      // Verify store has clear state structure
      expect(result.current.filters).toBeDefined();
      expect(typeof result.current.setEmotionRange).toBe("function");
      expect(typeof result.current.setEntryTypes).toBe("function");
      expect(typeof result.current.setSearchText).toBe("function");
      expect(typeof result.current.resetFilters).toBe("function");
    });
  });
});
