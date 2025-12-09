/**
 * Mock AI Service Integration Tests
 * Validates that the mock AI service works correctly in the test environment
 */

import { getMockAIService } from "../utils/mockServices";
import { Sentiment } from "@/types/entry.types";

describe("Mock AI Service", () => {
  let mockAI: ReturnType<typeof getMockAIService>;

  beforeEach(() => {
    mockAI = getMockAIService();
    mockAI.reset();
  });

  afterEach(() => {
    mockAI.reset();
  });

  it("should return default neutral mood when no mock is configured", async () => {
    const result = await mockAI.analyzeMood("test text");

    expect(result).toEqual({
      happiness: 0.5,
      fear: 0.3,
      sadness: 0.3,
      anger: 0.2,
      sentiment: Sentiment.NEUTRAL,
    });
  });

  it("should return configured mock response", async () => {
    const mockResponse = {
      happiness: 0.9,
      fear: 0.1,
      sadness: 0.1,
      anger: 0.1,
      sentiment: Sentiment.POSITIVE,
    };

    mockAI.setMockResponse(mockResponse);
    const result = await mockAI.analyzeMood("happy text");

    expect(result).toEqual(mockResponse);
  });

  it("should throw configured error", async () => {
    const testError = new Error("Mock analysis failed");
    mockAI.setMockError(testError);

    await expect(mockAI.analyzeMood("text")).rejects.toThrow(
      "Mock analysis failed"
    );
  });

  it("should reset to default behavior", async () => {
    mockAI.setMockResponse({
      happiness: 0.9,
      fear: 0.1,
      sadness: 0.1,
      anger: 0.1,
      sentiment: Sentiment.POSITIVE,
    });

    mockAI.reset();
    const result = await mockAI.analyzeMood("text");

    expect(result.sentiment).toBe(Sentiment.NEUTRAL);
  });

  it("should maintain singleton behavior", () => {
    const instance1 = getMockAIService();
    const instance2 = getMockAIService();

    expect(instance1).toBe(instance2);
  });
});
