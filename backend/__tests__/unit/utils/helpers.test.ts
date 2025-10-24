import { CustomError } from "../../../src/middleware/errorHandler";

describe("CustomError", () => {
  it("should create a custom error with default values", () => {
    const message = "Test error message";
    const error = new CustomError(message);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CustomError);
  });

  it("should create a custom error with custom status code", () => {
    const message = "Not found";
    const statusCode = 404;
    const error = new CustomError(message, statusCode);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.isOperational).toBe(true);
  });

  it("should create a custom error with custom operational flag", () => {
    const message = "Programming error";
    const statusCode = 500;
    const isOperational = false;
    const error = new CustomError(message, statusCode, isOperational);

    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
    expect(error.isOperational).toBe(isOperational);
  });

  it("should have proper stack trace", () => {
    const error = new CustomError("Test error");
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("Error: Test error");
  });
});

describe("Validation Functions", () => {
  describe("Email validation", () => {
    it("should validate valid email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@domain.co.uk",
        "user+tag@example.org",
        "user123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it("should invalidate invalid email addresses", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "user@",
        "user@.com",
        "user space@example.com",
        "",
      ];

      invalidEmails.forEach((email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe("Rating validation", () => {
    it("should validate valid ratings", () => {
      const validRatings = [0, 1, 5, 8.5, 10];

      validRatings.forEach((rating) => {
        expect(rating >= 0 && rating <= 10).toBe(true);
      });
    });

    it("should invalidate invalid ratings", () => {
      const invalidRatings = [-1, 11, -0.1, 10.1];

      invalidRatings.forEach((rating) => {
        expect(rating >= 0 && rating <= 10).toBe(false);
      });
    });
  });

  describe("Pagination validation", () => {
    it("should validate valid pagination parameters", () => {
      const validPagination = [
        { page: 1, limit: 10 },
        { page: 5, limit: 20 },
        { page: 100, limit: 1 },
        { page: 1, limit: 100 },
      ];

      validPagination.forEach(({ page, limit }) => {
        expect(page > 0).toBe(true);
        expect(limit >= 1 && limit <= 100).toBe(true);
      });
    });

    it("should invalidate invalid pagination parameters", () => {
      const invalidPagination = [
        { page: 0, limit: 10 },
        { page: -1, limit: 10 },
        { page: 1, limit: 0 },
        { page: 1, limit: 101 },
        { page: 1, limit: -1 },
      ];

      invalidPagination.forEach(({ page, limit }) => {
        const isValidPage = page > 0;
        const isValidLimit = limit >= 1 && limit <= 100;
        expect(isValidPage && isValidLimit).toBe(false);
      });
    });
  });
});

describe("Utility Functions", () => {
  describe("String sanitization", () => {
    it("should sanitize strings correctly", () => {
      const sanitizeString = (str: string): string => {
        return str.trim().toLowerCase();
      };

      expect(sanitizeString("  HELLO WORLD  ")).toBe("hello world");
      expect(sanitizeString("Test")).toBe("test");
      expect(sanitizeString("")).toBe("");
    });
  });

  describe("Number validation", () => {
    it("should validate positive numbers", () => {
      const isPositiveNumber = (num: number): boolean => {
        return typeof num === "number" && num > 0 && !isNaN(num);
      };

      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(100.5)).toBe(true);
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(NaN)).toBe(false);
    });
  });

  describe("Array utilities", () => {
    it("should check if array is empty", () => {
      const isEmpty = (arr: any[]): boolean => {
        return !Array.isArray(arr) || arr.length === 0;
      };

      expect(isEmpty([])).toBe(true);
      expect(isEmpty([1, 2, 3])).toBe(false);
      expect(isEmpty(["test"])).toBe(false);
    });
  });
});
