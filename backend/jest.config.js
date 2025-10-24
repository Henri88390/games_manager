module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        isolatedModules: true,
        tsconfig: {
          sourceMap: false,
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/app.ts",
    "!src/db.ts", // Database connection file
  ],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testTimeout: 5000, // Reduced from 10000
  clearMocks: true,
  restoreMocks: true,

  // Performance optimizations
  maxWorkers: "50%", // Use half of available CPU cores
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache",

  // Reduce overhead
  collectCoverage: false, // Only collect when explicitly requested
  verbose: false, // Reduce output noise
  silent: true, // Suppress console.log during tests
};
