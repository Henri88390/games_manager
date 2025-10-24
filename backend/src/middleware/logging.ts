import { NextFunction, Request, Response } from "express";

export interface LogContext {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip: string;
  timestamp: Date;
  duration?: number;
  statusCode?: number;
  responseSize?: number;
}

// Generate unique request ID
const generateRequestId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const requestId = generateRequestId();

  // Add request ID to request object for use in other middleware/controllers
  (req as any).requestId = requestId;

  const logContext: LogContext = {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get("User-Agent"),
    ip: req.ip || req.connection.remoteAddress || "unknown",
    timestamp: new Date(),
  };

  // Log incoming request
  console.log(
    `[${logContext.timestamp.toISOString()}] [${requestId}] ${req.method} ${
      req.url
    } - START`,
    {
      userAgent: logContext.userAgent,
      ip: logContext.ip,
      body: req.method !== "GET" ? req.body : undefined,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
    }
  );

  // Log response when request finishes
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 400 ? "ERROR" : "INFO";

    console.log(
      `[${new Date().toISOString()}] [${requestId}] ${req.method} ${
        req.url
      } - ${level}`,
      {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      }
    );
  });

  next();
};

// Security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove X-Powered-By header
  res.removeHeader("X-Powered-By");

  // Add security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // HSTS header for production (only over HTTPS)
  if (process.env.NODE_ENV === "production" && req.secure) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
};
