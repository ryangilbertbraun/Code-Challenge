// Entry type definitions for journal entries

export enum EntryType {
  TEXT = "text",
  VIDEO = "video",
}

export enum Sentiment {
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  NEGATIVE = "negative",
  MIXED = "mixed",
}

export enum AnalysisStatus {
  PENDING = "pending",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export interface MoodMetadata {
  happiness: number; // 0-1
  fear: number; // 0-1
  sadness: number; // 0-1
  anger: number; // 0-1
  sentiment: Sentiment;
}

export interface HumeEmotionData {
  // Raw Hume API response structure
  face?: {
    emotions: Array<{ name: string; score: number }>;
  };
  prosody?: {
    emotions: Array<{ name: string; score: number }>;
  };
}

export interface BaseEntry {
  id: string;
  userId: string;
  type: EntryType;
  createdAt: Date;
  updatedAt: Date;
}

export interface TextEntry extends BaseEntry {
  type: EntryType.TEXT;
  content: string;
  moodMetadata: MoodMetadata | null;
  analysisStatus: AnalysisStatus;
}

export interface VideoEntry extends BaseEntry {
  type: EntryType.VIDEO;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  humeEmotionData: HumeEmotionData | null;
  analysisStatus: AnalysisStatus;
}

export type JournalEntry = TextEntry | VideoEntry;
