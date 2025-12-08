import OpenAI from "openai";
import { MoodMetadata, Sentiment } from "@/types/entry.types";
import { AppError, ErrorCode } from "@/types/error.types";
import { config } from "@/constants/config";

/**
 * AI service interface for mood analysis
 */
export interface IAIService {
  analyzeMood(text: string): Promise<MoodMetadata>;
}

/**
 * Mood analysis prompt template
 */
const MOOD_ANALYSIS_PROMPT = `Analyze the emotional content of the following journal entry and provide a JSON response with the following structure:

{
  "happiness": <float 0-1>,
  "fear": <float 0-1>,
  "sadness": <float 0-1>,
  "anger": <float 0-1>,
  "sentiment": "<positive|neutral|negative|mixed>"
}

Journal entry:
"""
{entry_text}
"""

Provide only the JSON response, no additional text.`;

/**
 * Clamps a number to the range [0, 1]
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Validates and normalizes sentiment value
 */
function validateSentiment(sentiment: string): Sentiment {
  const normalized = sentiment.toLowerCase();

  switch (normalized) {
    case "positive":
      return Sentiment.POSITIVE;
    case "neutral":
      return Sentiment.NEUTRAL;
    case "negative":
      return Sentiment.NEGATIVE;
    case "mixed":
      return Sentiment.MIXED;
    default:
      // Default to neutral if invalid
      return Sentiment.NEUTRAL;
  }
}

/**
 * AI service implementation using OpenAI GPT-4o-mini
 */
class AIService implements IAIService {
  private openai: OpenAI;

  constructor() {
    if (!config.openai.apiKey) {
      console.warn(
        "OpenAI API key is missing. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file"
      );
    }

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  /**
   * Analyzes the mood of a journal entry text using OpenAI GPT-4o-mini
   * @param text The journal entry text to analyze
   * @returns MoodMetadata with normalized emotion values and sentiment
   * @throws AppError if analysis fails
   */
  async analyzeMood(text: string): Promise<MoodMetadata> {
    if (!config.openai.apiKey) {
      throw {
        code: ErrorCode.ANALYSIS_LLM_FAILED,
        message: "OpenAI API key is not configured",
        retryable: false,
      } as AppError;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an emotional analysis assistant. Analyze journal entries and return structured emotion data.",
          },
          {
            role: "user",
            content: MOOD_ANALYSIS_PROMPT.replace("{entry_text}", text),
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw {
          code: ErrorCode.ANALYSIS_INVALID_RESPONSE,
          message: "LLM returned empty response",
          retryable: true,
        } as AppError;
      }

      // Parse JSON response
      let result: any;
      try {
        result = JSON.parse(content);
      } catch (parseError) {
        throw {
          code: ErrorCode.ANALYSIS_INVALID_RESPONSE,
          message: "Failed to parse LLM response as JSON",
          details: parseError,
          retryable: true,
        } as AppError;
      }

      // Validate required fields exist
      if (
        typeof result.happiness !== "number" ||
        typeof result.fear !== "number" ||
        typeof result.sadness !== "number" ||
        typeof result.anger !== "number" ||
        typeof result.sentiment !== "string"
      ) {
        throw {
          code: ErrorCode.ANALYSIS_INVALID_RESPONSE,
          message: "LLM response missing required fields or has invalid types",
          details: result,
          retryable: true,
        } as AppError;
      }

      // Normalize and validate
      return {
        happiness: clamp(result.happiness, 0, 1),
        fear: clamp(result.fear, 0, 1),
        sadness: clamp(result.sadness, 0, 1),
        anger: clamp(result.anger, 0, 1),
        sentiment: validateSentiment(result.sentiment),
      };
    } catch (error) {
      // If it's already an AppError, rethrow it
      if ((error as AppError).code) {
        throw error;
      }

      // Handle OpenAI-specific errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes("timeout") || message.includes("timed out")) {
          throw {
            code: ErrorCode.NETWORK_TIMEOUT,
            message: "Request to OpenAI timed out",
            details: error,
            retryable: true,
          } as AppError;
        }

        if (
          message.includes("network") ||
          message.includes("connection") ||
          message.includes("econnrefused")
        ) {
          throw {
            code: ErrorCode.NETWORK_OFFLINE,
            message: "Network error while connecting to OpenAI",
            details: error,
            retryable: true,
          } as AppError;
        }

        if (message.includes("api key") || message.includes("unauthorized")) {
          throw {
            code: ErrorCode.ANALYSIS_LLM_FAILED,
            message: "Invalid OpenAI API key",
            details: error,
            retryable: false,
          } as AppError;
        }
      }

      // Generic LLM failure
      throw {
        code: ErrorCode.ANALYSIS_LLM_FAILED,
        message: "Failed to analyze mood with LLM",
        details: error,
        retryable: true,
      } as AppError;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();
