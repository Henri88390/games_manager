import { NextFunction, Request, Response } from "express";
import { CustomError } from "./errorHandler";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 10 * 60 * 1000);

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: Request) => string; // Custom key generator
}

export const createRateLimit = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = `Too many requests, please try again later`,
    keyGenerator = (req: Request) => req.ip || "unknown",
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();
    const resetTime = now + windowMs;

    // Initialize or get existing rate limit data
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 1,
        resetTime,
      };
    } else {
      rateLimitStore[key].count++;
    }

    const { count } = rateLimitStore[key];

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, maxRequests - count));
    res.setHeader(
      "X-RateLimit-Reset",
      Math.ceil(rateLimitStore[key].resetTime / 1000)
    );

    // Check if rate limit exceeded
    if (count > maxRequests) {
      return next(new CustomError(message, 429));
    }

    next();
  };
};

// Pre-configured rate limiters
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: "Too many requests from this IP, please try again later",
});

export const strictRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 requests per 15 minutes
  message: "Rate limit exceeded for this operation",
});

export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: "Too many authentication attempts, please try again later",
});

// Rate limit by user email for authenticated routes
export const userRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute per user
  keyGenerator: (req: Request) => {
    const email = req.body.email || req.query.email;
    return email ? `user:${email}` : req.ip || "unknown";
  },
  message: "Too many requests for this user, please slow down",
});
