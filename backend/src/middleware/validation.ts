import { NextFunction, Request, Response } from "express";

import { CustomError } from "./errorHandler";

// Email validation middleware
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const email = (req.body && req.body.email) || (req.query && req.query.email);

  if (!email) {
    return next(new CustomError("Email is required", 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new CustomError("Invalid email format", 400));
  }

  next();
};

export const validateGameData = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, rating, timespent, timeSpent } = req.body;

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

  // Time spent validation - handle both timespent and timeSpent
  const timeSpentValue = timespent || timeSpent;
  if (timeSpentValue === undefined || timeSpentValue === null) {
    return next(new CustomError("Time spent is required", 400));
  }

  const numTimeSpent = Number(timeSpentValue);
  if (isNaN(numTimeSpent) || numTimeSpent < 0) {
    return next(
      new CustomError("Time spent must be a non-negative number", 400)
    );
  }

  // Sanitize and attach validated data (normalize to timespent for consistency)
  req.body.title = title.trim();
  req.body.rating = numRating;
  req.body.timespent = numTimeSpent;
  // Remove timeSpent if it exists to avoid confusion
  if (req.body.timeSpent !== undefined) {
    delete req.body.timeSpent;
  }

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

// Joi validation for game creation (single endpoint implementation)
export const validateGameCreationJoi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Dynamic import to avoid build issues
    const Joi = await import("joi");

    // Define schema inline to avoid external imports
    const gameCreationSchema = Joi.default.object({
      email: Joi.default
        .string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
          "string.email": "Invalid email format",
          "any.required": "Email is required",
        }),
      title: Joi.default.string().trim().min(1).max(100).required().messages({
        "string.empty": "Title is required and must be a non-empty string",
        "string.min": "Title is required and must be a non-empty string",
        "string.max": "Title must be less than 100 characters",
        "any.required": "Title is required and must be a non-empty string",
      }),
      rating: Joi.default
        .number()
        .min(0)
        .max(10)
        .precision(1)
        .required()
        .messages({
          "number.min": "Rating must be between 0 and 10",
          "number.max": "Rating must be between 0 and 10",
          "number.precision": "Rating can have at most 1 decimal place",
          "any.required": "Rating is required",
        }),
      timespent: Joi.default.number().min(0).integer().optional().messages({
        "number.min": "Time spent must be a non-negative integer",
        "number.integer": "Time spent must be a non-negative integer",
      }),
      timeSpent: Joi.default.number().min(0).integer().optional().messages({
        "number.min": "Time spent must be a non-negative integer",
        "number.integer": "Time spent must be a non-negative integer",
      }),
      description: Joi.default.string().max(500).allow("").optional().messages({
        "string.max": "Description must be less than 500 characters",
      }),
    });

    const { error, value } = gameCreationSchema.validate(req.body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown properties
      convert: true, // Convert types (e.g., string numbers to numbers)
    });

    if (error) {
      const errorMessage = error.details
        .map((detail: any) => detail.message)
        .join("; ");
      return next(new CustomError(errorMessage, 400));
    }

    // Handle both timespent and timeSpent field names
    if (!value.timespent && !value.timeSpent) {
      return next(new CustomError("Time spent is required", 400));
    }

    // Normalize the field name to timespent for the database
    if (value.timeSpent && !value.timespent) {
      value.timespent = value.timeSpent;
      delete value.timeSpent;
    }

    // Replace the original data with validated/sanitized data
    req.body = value;
    next();
  } catch (err) {
    // Fallback to legacy validation if Joi is not available
    return next(new CustomError("Validation library not available", 500));
  }
};
