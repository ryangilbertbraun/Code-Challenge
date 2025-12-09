import { MoodMetadata, Sentiment } from "@/types/entry.types";

/**
 * AI service interface for mood analysis
 */
export interface IAIService {
  analyzeMood(text: string): Promise<MoodMetadata>;
}

/**
 * Mock AI service for testing
 * Provides configurable responses and error simulation
 */
export class MockAIServiceImpl implements IAIService {
  private mockResponse: MoodMetadata | null = null;
  private mockError: Error | null = null;

  /**
   * Analyzes mood with configurable mock behavior
   * @param text The text to analyze (unused in mock)
   * @returns Mock mood metadata or throws configured error
   */
  async analyzeMood(text: string): Promise<MoodMetadata> {
    if (this.mockError) {
      throw this.mockError;
    }

    return (
      this.mockResponse || {
        happiness: 0.5,
        fear: 0.3,
        sadness: 0.3,
        anger: 0.2,
        sentiment: Sentiment.NEUTRAL,
      }
    );
  }

  /**
   * Configure the mock to return a specific response
   * @param response The mood metadata to return
   */
  setMockResponse(response: MoodMetadata): void {
    this.mockResponse = response;
    this.mockError = null;
  }

  /**
   * Configure the mock to throw an error
   * @param error The error to throw
   */
  setMockError(error: Error): void {
    this.mockError = error;
    this.mockResponse = null;
  }

  /**
   * Reset the mock to default behavior
   */
  reset(): void {
    this.mockResponse = null;
    this.mockError = null;
  }
}

let mockAIInstance: MockAIServiceImpl | null = null;

/**
 * Get singleton instance of mock AI service
 * @returns The mock AI service instance
 */
export function getMockAIService(): MockAIServiceImpl {
  if (!mockAIInstance) {
    mockAIInstance = new MockAIServiceImpl();
  }
  return mockAIInstance;
}
