// AI Insights type definitions

export enum TrendType {
  POSITIVE = "positive",
  NEUTRAL = "neutral",
  CONCERN = "concern",
}

export enum RecommendationPriority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export interface Trend {
  title: string;
  description: string;
  type: TrendType;
}

export interface Recommendation {
  title: string;
  description: string;
  priority: RecommendationPriority;
}

export interface EmotionalBreakdown {
  happiness: number;
  sadness: number;
  anger: number;
  fear: number;
}

export interface AIInsights {
  summary: string;
  moodScore: number | null;
  trends: Trend[];
  recommendations: Recommendation[];
  emotionalBreakdown?: EmotionalBreakdown;
  generatedAt?: Date;
}
