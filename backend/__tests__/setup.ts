// Jest setup file for unit tests - optimized for speed

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5433";
process.env.DB_NAME = "test_games_db";
process.env.DB_USER = "test_user";
process.env.DB_PASSWORD = "test_password";

// Suppress console output during tests for cleaner, faster execution
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: () => {},
  error: () => {},
  warn: () => {},
  info: () => {},
  debug: () => {},
};

// Global test timeout (reduced for faster execution)
jest.setTimeout(5000);
