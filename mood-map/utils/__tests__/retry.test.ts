/**
 * Unit tests for retry utility
 *
 * Tests retry logic with exponential backoff
 */

import { withRetry, DEFAULT_RETRY_CONFIG } from "../retry";

describe("withRetry", () => {
  it("should return result on first success", async () => {
    const fn = jest.fn().mockResolvedValue("success");

    const result = await withRetry(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure and succeed on second attempt", async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error("First failure"))
      .mockResolvedValueOnce("success");

    const result = await withRetry(fn);

    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should throw error after max attempts", async () => {
    const error = new Error("Persistent failure");
    const fn = jest.fn().mockRejectedValue(error);

    await expect(withRetry(fn)).rejects.toThrow("Persistent failure");
    expect(fn).toHaveBeenCalledTimes(DEFAULT_RETRY_CONFIG.maxAttempts);
  });

  it("should use custom retry config", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("Failure"));

    await expect(
      withRetry(fn, { maxAttempts: 3, delayMs: 100, backoffMultiplier: 1 })
    ).rejects.toThrow("Failure");

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("should apply exponential backoff delays", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("Failure"));
    const startTime = Date.now();

    await expect(
      withRetry(fn, { maxAttempts: 3, delayMs: 100, backoffMultiplier: 2 })
    ).rejects.toThrow("Failure");

    const elapsed = Date.now() - startTime;

    // Should have delays of 100ms and 200ms (total ~300ms)
    // Allow some tolerance for execution time
    expect(elapsed).toBeGreaterThanOrEqual(250);
    expect(elapsed).toBeLessThan(500);
  });
});
