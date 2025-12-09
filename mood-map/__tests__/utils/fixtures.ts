// Test fixtures for integration tests
import { Sentiment, MoodMetadata } from "../../types/entry.types";

/**
 * Test user credentials for integration tests
 */
export const TEST_USERS = {
  alice: {
    email: "alice@test.com",
    password: "password123",
  },
  bob: {
    email: "bob@test.com",
    password: "password456",
  },
  charlie: {
    email: "charlie@test.com",
    password: "password789",
  },
};

/**
 * Sample entry content for various emotional states
 */
export const SAMPLE_ENTRIES = {
  happy:
    "I had a wonderful day today! Everything went perfectly and I feel amazing.",
  sad: "I'm feeling down and anxious. Nothing seems to be going right.",
  neutral: "Just another regular day. Nothing special happened.",
  excited:
    "I can't believe it! I got the promotion I've been working towards for months!",
  anxious:
    "I'm really worried about the presentation tomorrow. My heart won't stop racing.",
  grateful:
    "I'm so thankful for my friends and family. They always support me.",
  frustrated:
    "This is so frustrating! I've been trying to fix this bug for hours.",
  peaceful:
    "Sitting by the lake, watching the sunset. Everything feels calm and serene.",
  mixed:
    "Today was a rollercoaster. Some great moments, but also some really challenging ones.",
  empty: "   ", // Edge case: whitespace only
  long: "This is a very long entry. ".repeat(50), // Edge case: long content
};

/**
 * Mock mood metadata for testing AI analysis
 */
export const MOCK_MOOD_DATA: Record<string, MoodMetadata> = {
  positive: {
    happiness: 0.8,
    fear: 0.1,
    sadness: 0.1,
    anger: 0.05,
    sentiment: Sentiment.POSITIVE,
  },
  negative: {
    happiness: 0.1,
    fear: 0.3,
    sadness: 0.7,
    anger: 0.2,
    sentiment: Sentiment.NEGATIVE,
  },
  neutral: {
    happiness: 0.4,
    fear: 0.2,
    sadness: 0.3,
    anger: 0.1,
    sentiment: Sentiment.NEUTRAL,
  },
  mixed: {
    happiness: 0.5,
    fear: 0.4,
    sadness: 0.4,
    anger: 0.3,
    sentiment: Sentiment.MIXED,
  },
  anxious: {
    happiness: 0.2,
    fear: 0.8,
    sadness: 0.4,
    anger: 0.1,
    sentiment: Sentiment.NEGATIVE,
  },
  excited: {
    happiness: 0.9,
    fear: 0.05,
    sadness: 0.05,
    anger: 0.0,
    sentiment: Sentiment.POSITIVE,
  },
};
