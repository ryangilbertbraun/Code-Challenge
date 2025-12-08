// Filtering pipeline utility for journal entries
// Implements deterministic filtering: emotion → search → date grouping → descending sort

import {
  JournalEntry,
  TextEntry,
  VideoEntry,
  EntryType,
  AnalysisStatus,
} from "../types/entry.types";
import { FilterState, EmotionRange } from "../types/filter.types";

/**
 * Main filtering pipeline function
 * Applies filters in deterministic order: emotion → search → date grouping → descending sort
 */
export function applyFilterPipeline(
  entries: JournalEntry[],
  filters: FilterState
): JournalEntry[] {
  // Step 1: Apply emotion range filters
  let filtered = applyEmotionFilters(entries, filters);

  // Step 2: Apply search filter
  filtered = applySearchFilter(filtered, filters.searchText);

  // Step 3: Apply entry type filter
  filtered = applyEntryTypeFilter(filtered, filters.entryTypes);

  // Step 4: Sort in descending chronological order (newest first)
  filtered = sortDescending(filtered);

  return filtered;
}

/**
 * Apply emotion range filters to entries
 * Uses AND logic - entries must match ALL emotion criteria
 * Note: Only filters entries that have completed analysis
 * Entries without completed analysis are excluded when emotion filters are active
 */
export function applyEmotionFilters(
  entries: JournalEntry[],
  filters: FilterState
): JournalEntry[] {
  // Check if filters are at default values (all emotions 0-1)
  const isDefaultFilters =
    filters.happiness.min === 0 &&
    filters.happiness.max === 1 &&
    filters.fear.min === 0 &&
    filters.fear.max === 1 &&
    filters.sadness.min === 0 &&
    filters.sadness.max === 1 &&
    filters.anger.min === 0 &&
    filters.anger.max === 1;

  // If filters are at default, return all entries (no filtering)
  if (isDefaultFilters) {
    return entries;
  }

  return entries.filter((entry) => {
    // Text entries: check mood metadata
    if (entry.type === EntryType.TEXT) {
      const textEntry = entry as TextEntry;

      // Exclude entries without completed analysis when filters are active
      if (
        !textEntry.moodMetadata ||
        textEntry.analysisStatus !== AnalysisStatus.SUCCESS
      ) {
        return false; // Hide entries without completed analysis
      }

      const { moodMetadata } = textEntry;

      // Check all emotion ranges (AND logic)
      return (
        isInRange(moodMetadata.happiness, filters.happiness) &&
        isInRange(moodMetadata.fear, filters.fear) &&
        isInRange(moodMetadata.sadness, filters.sadness) &&
        isInRange(moodMetadata.anger, filters.anger)
      );
    }

    // Video entries: check Hume emotion data
    if (entry.type === EntryType.VIDEO) {
      const videoEntry = entry as VideoEntry;

      // Exclude entries without completed analysis when filters are active
      if (
        !videoEntry.humeEmotionData ||
        videoEntry.analysisStatus !== AnalysisStatus.SUCCESS
      ) {
        return false; // Hide entries without completed analysis
      }

      // Extract emotion scores from Hume data
      const emotionScores = extractHumeEmotionScores(
        videoEntry.humeEmotionData
      );

      // Check all emotion ranges (AND logic)
      return (
        isInRange(emotionScores.happiness, filters.happiness) &&
        isInRange(emotionScores.fear, filters.fear) &&
        isInRange(emotionScores.sadness, filters.sadness) &&
        isInRange(emotionScores.anger, filters.anger)
      );
    }

    return true; // Show unknown entry types by default
  });
}

/**
 * Apply search filter to entries
 * Only applies to text entries - video entries are excluded from search
 */
export function applySearchFilter(
  entries: JournalEntry[],
  searchText: string
): JournalEntry[] {
  // If no search text, return all entries
  if (!searchText || searchText.trim() === "") {
    return entries;
  }

  const normalizedSearch = searchText.toLowerCase().trim();

  return entries.filter((entry) => {
    // Video entries are excluded from search
    if (entry.type === EntryType.VIDEO) {
      return false;
    }

    // Text entries: search in content
    const textEntry = entry as TextEntry;
    return textEntry.content.toLowerCase().includes(normalizedSearch);
  });
}

/**
 * Apply entry type filter
 */
export function applyEntryTypeFilter(
  entries: JournalEntry[],
  entryTypes: EntryType[]
): JournalEntry[] {
  // If both types are selected, return all entries
  if (
    entryTypes.includes(EntryType.TEXT) &&
    entryTypes.includes(EntryType.VIDEO)
  ) {
    return entries;
  }

  return entries.filter((entry) => entryTypes.includes(entry.type));
}

/**
 * Sort entries in descending chronological order (newest first)
 */
export function sortDescending(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order
  });
}

/**
 * Check if a value is within a range
 */
function isInRange(value: number, range: EmotionRange): boolean {
  return value >= range.min && value <= range.max;
}

/**
 * Extract emotion scores from Hume emotion data
 * Maps Hume emotion names to our standard emotion categories
 */
function extractHumeEmotionScores(humeData: {
  face?: { emotions: Array<{ name: string; score: number }> };
  prosody?: { emotions: Array<{ name: string; score: number }> };
}): {
  happiness: number;
  fear: number;
  sadness: number;
  anger: number;
} {
  // Combine face and prosody emotions
  const allEmotions: Array<{ name: string; score: number }> = [
    ...(humeData.face?.emotions || []),
    ...(humeData.prosody?.emotions || []),
  ];

  // Map Hume emotion names to our categories
  // Hume uses different emotion names, so we need to map them
  const emotionMap: Record<
    string,
    keyof ReturnType<typeof extractHumeEmotionScores>
  > = {
    // Happiness mappings
    joy: "happiness",
    happiness: "happiness",
    amusement: "happiness",
    excitement: "happiness",
    contentment: "happiness",

    // Fear mappings
    fear: "fear",
    anxiety: "fear",
    worry: "fear",
    nervousness: "fear",

    // Sadness mappings
    sadness: "sadness",
    disappointment: "sadness",
    grief: "sadness",
    despair: "sadness",

    // Anger mappings
    anger: "anger",
    frustration: "anger",
    irritation: "anger",
    rage: "anger",
  };

  // Aggregate scores by category
  const scores = {
    happiness: [] as number[],
    fear: [] as number[],
    sadness: [] as number[],
    anger: [] as number[],
  };

  allEmotions.forEach((emotion) => {
    const category = emotionMap[emotion.name.toLowerCase()];
    if (category) {
      scores[category].push(emotion.score);
    }
  });

  // Calculate average score for each category
  // Default to 0.5 (neutral) if no emotions found in that category
  return {
    happiness:
      scores.happiness.length > 0
        ? scores.happiness.reduce((a, b) => a + b, 0) / scores.happiness.length
        : 0.5,
    fear:
      scores.fear.length > 0
        ? scores.fear.reduce((a, b) => a + b, 0) / scores.fear.length
        : 0.5,
    sadness:
      scores.sadness.length > 0
        ? scores.sadness.reduce((a, b) => a + b, 0) / scores.sadness.length
        : 0.5,
    anger:
      scores.anger.length > 0
        ? scores.anger.reduce((a, b) => a + b, 0) / scores.anger.length
        : 0.5,
  };
}
