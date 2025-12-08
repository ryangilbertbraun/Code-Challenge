import { validateEmail, validatePassword } from "../authService";
import { ErrorCode } from "@/types/error.types";

describe("authService validation", () => {
  describe("validateEmail", () => {
    it("should accept valid email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true);
      expect(validateEmail("user.name@domain.co.uk")).toBe(true);
      expect(validateEmail("user+tag@example.com")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(validateEmail("")).toBe(false);
      expect(validateEmail("notanemail")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
      expect(validateEmail("user@domain")).toBe(false);
      expect(validateEmail("user name@example.com")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should accept passwords with 8 or more characters", () => {
      expect(validatePassword("12345678")).toBe(true);
      expect(validatePassword("password123")).toBe(true);
      expect(validatePassword("a".repeat(8))).toBe(true);
      expect(validatePassword("a".repeat(100))).toBe(true);
    });

    it("should reject passwords shorter than 8 characters", () => {
      expect(validatePassword("")).toBe(false);
      expect(validatePassword("1234567")).toBe(false);
      expect(validatePassword("short")).toBe(false);
      expect(validatePassword("a".repeat(7))).toBe(false);
    });
  });
});
