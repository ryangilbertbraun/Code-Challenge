/**
 * Retry utility with exponential backoff for network operations
 */

export interface RetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 2,
  delayMs: 1000,
  backoffMultiplier: 2,
};

/**
 * Executes a function with retry logic and exponential backoff
 * @param fn The async function to execute
 * @param config Retry configuration
 * @returns The result of the function
 * @throws The last error if all attempts fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on the last attempt
      if (attempt < config.maxAttempts) {
        const delay =
          config.delayMs * Math.pow(config.backoffMultiplier, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
