import { NextFunction, Request, Response } from "express";
import { CustomError } from "./errorHandler";

// Email validation middleware
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const email = req.body.email || req.query.email;

  if (!email) {
    return next(new CustomError("Email is required", 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new CustomError("Invalid email format", 400));
  }

  next();
};

// Game data validation middleware
export const validateGameData = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, rating, timespent } = req.body;

  // Title validation
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return next(
      new CustomError("Title is required and must be a non-empty string", 400)
    );
  }

  if (title.length > 100) {
    return next(new CustomError("Title must be less than 100 characters", 400));
  }

  // Rating validation
  if (rating === undefined || rating === null) {
    return next(new CustomError("Rating is required", 400));
  }

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 0 || numRating > 10) {
    return next(
      new CustomError("Rating must be a number between 0 and 10", 400)
    );
  }

  // Time spent validation
  if (timespent === undefined || timespent === null) {
    return next(new CustomError("Time spent is required", 400));
  }

  const numTimeSpent = Number(timespent);
  if (isNaN(numTimeSpent) || numTimeSpent < 0) {
    return next(
      new CustomError("Time spent must be a non-negative number", 400)
    );
  }

  // Sanitize and attach validated data
  req.body.title = title.trim();
  req.body.rating = numRating;
  req.body.timespent = numTimeSpent;

  next();
};

// Pagination validation middleware
export const validatePagination = (
  req: Request,
  _: Response,
  next: NextFunction
): void => {
  let { page, limit } = req.query;

  // Set defaults
  const pageNum = page ? parseInt(page as string, 10) : 1;
  const limitNum = limit ? parseInt(limit as string, 10) : 10;

  // Validate page
  if (isNaN(pageNum) || pageNum < 1) {
    return next(new CustomError("Page must be a positive integer", 400));
  }

  // Validate limit
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return next(new CustomError("Limit must be between 1 and 100", 400));
  }

  // Attach validated pagination to request
  (req as any).pagination = { page: pageNum, limit: limitNum };

  next();
};

// ID parameter validation middleware
export const validateIdParam = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  if (!id) {
    return next(new CustomError("ID parameter is required", 400));
  }

  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId < 1) {
    return next(new CustomError("ID must be a positive integer", 400));
  }

  // Attach validated ID to request
  (req as any).validatedId = numId;

  next();
};

// Search validation middleware
export const validateSearch = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, email } = req.query;

  // At least one search parameter should be provided
  if (!title && !email) {
    return next(
      new CustomError(
        "Either 'title' or 'email' search parameter is required",
        400
      )
    );
  }

  // Validate title search
  if (title && typeof title === "string" && title.trim().length > 0) {
    if (title.length > 100) {
      return next(
        new CustomError(
          "Title search term must be less than 100 characters",
          400
        )
      );
    }
    (req as any).searchTitle = title.trim();
  }

  // Validate email search
  if (email && typeof email === "string" && email.trim().length > 0) {
    if (email.length > 100) {
      return next(
        new CustomError(
          "Email search term must be less than 100 characters",
          400
        )
      );
    }
    (req as any).searchEmail = email.trim();
  }

  next();
};
