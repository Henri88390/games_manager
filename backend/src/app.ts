import cors from "cors";
import express from "express";
import path from "path";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger, securityHeaders } from "./middleware/logging";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Apply security headers first
app.use(securityHeaders);

// Request logging
app.use(requestLogger);

// CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount all API routes
app.use("/api", routes);

// Handle 404 for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
});
