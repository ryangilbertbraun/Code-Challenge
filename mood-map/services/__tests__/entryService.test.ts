/**
 * Unit tests for entryService
 *
 * Tests validation logic and error handling for entry creation
 */

import { entryService } from "../entryService";
import { ErrorCode } from "@/types/error.types";

describe("entryService validation", () => {
  describe("createTextEntry", () => {
    it("should reject empty text content", async () => {
      await expect(entryService.createTextEntry("")).rejects.toMatchObject({
        code: ErrorCode.ENTRY_EMPTY_CONTENT,
        message: "Entry content cannot be empty",
        retryable: false,
      });
    });

    it("should reject whitespace-only content", async () => {
      await expect(
        entryService.createTextEntry("   \n\t  ")
      ).rejects.toMatchObject({
        code: ErrorCode.ENTRY_EMPTY_CONTENT,
        message: "Entry content cannot be empty",
        retryable: false,
      });
    });

    it("should accept valid non-empty content", async () => {
      // This will fail with auth error since we're not authenticated in tests
      // but it proves the validation passes
      await expect(
        entryService.createTextEntry("Valid content")
      ).rejects.toMatchObject({
        code: ErrorCode.AUTH_SESSION_EXPIRED,
      });
    });
  });
});
