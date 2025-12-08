// Filter type definitions for journal entry filtering

import { EntryType } from "./entry.types";

export interface EmotionRange {
  min: number; // 0-1
  max: number; // 0-1
}

export interface FilterState {
  happiness: EmotionRange;
  fear: EmotionRange;
  sadness: EmotionRange;
  anger: EmotionRange;
  entryTypes: EntryType[]; // Filter by entry type
  searchText: string;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  happiness: { min: 0.0, max: 1.0 },
  fear: { min: 0.0, max: 1.0 },
  sadness: { min: 0.0, max: 1.0 },
  anger: { min: 0.0, max: 1.0 },
  entryTypes: [EntryType.TEXT, EntryType.VIDEO],
  searchText: "",
};
