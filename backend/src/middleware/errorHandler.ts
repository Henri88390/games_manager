import { NextFunction, Request, Response } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
export const globalErrorHandler = (
  error: AppError,
  req: Request,
  res: Response
): void => {
  const { statusCode = 500, message, stack } = error;

  // Log error details
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, {
    error: message,
    statusCode,
    stack: process.env.NODE_ENV === "development" ? stack : undefined,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Determine if error details should be exposed
  const isDevelopment = process.env.NODE_ENV === "development";
  const isOperationalError = error.isOperational || false;

  // Prepare error response
  const errorResponse: any = {
    error: true,
    message:
      isOperationalError || isDevelopment
        ? message
        : "An unexpected error occurred",
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Add additional details in development
  if (isDevelopment) {
    errorResponse.statusCode = statusCode;
    errorResponse.stack = stack;
  }

  res.status(statusCode).json(errorResponse);
};

// 404 Not Found handler
export const notFoundHandler = (
  req: Request,
  _: Response,
  next: NextFunction
): void => {
  const error = new CustomError(
    `Route ${req.method} ${req.path} not found`,
    404
  );
  next(error);
};
