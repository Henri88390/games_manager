# Backend Unit Tests Documentation

## Overview

Comprehensive unit test suite for the Games Manager backend API, covering all layers of the application architecture.

## Test Structure

### 📁 Test Organization

```
__tests__/
├── setup.ts                              # Jest configuration and global setup
├── unit/
│   ├── repositories/
│   │   └── GameRepository.test.ts         # Database layer tests
│   ├── services/
│   │   └── GameService.test.ts           # Business logic tests
│   ├── controllers/
│   │   └── PublicGameController.test.ts  # HTTP layer tests
│   ├── middleware/
│   │   └── middleware.test.ts            # Validation & middleware tests
│   └── utils/
│       └── helpers.test.ts               # Utility function tests
```

## Test Categories

### 🗄️ Repository Tests (`GameRepository.test.ts`)

Tests the data access layer with mocked PostgreSQL connections:

**Covered Functions:**

- `getPopularGames()` - Fetch games ordered by rating
- `getRecentGames()` - Fetch games ordered by date
- `searchGamesByTitle()` - Case-insensitive title search
- `searchGamesByUser()` - Search by user email
- `createGame()` - Game creation with validation
- `updateGame()` - Game updates with authorization
- `deleteGame()` - Game deletion with ownership checks
- `getGameById()` - Single game retrieval
- `getUserStats()` - User-specific statistics
- `getGlobalStats()` - Global platform statistics

**Key Test Scenarios:**

- ✅ Successful operations with proper data return
- ❌ Database connection failures
- 🔍 Pagination parameter handling
- 🚫 Not found scenarios
- 📊 Statistics calculation accuracy

### 🏢 Service Tests (`GameService.test.ts`)

Tests business logic layer with mocked repository:

**Covered Functions:**

- Data validation before database operations
- User authorization for CRUD operations
- Input sanitization and validation
- Error handling and custom error creation
- Pagination validation (1-100 limit, positive page numbers)
- Email format validation
- Rating validation (0-10 range)
- User ownership verification

**Key Test Scenarios:**

- ✅ Valid operations with proper authorization
- 🔒 Unauthorized access attempts
- 📝 Input validation failures
- 📄 Pagination boundary testing
- 📧 Email format validation

### 🌐 Controller Tests (`PublicGameController.test.ts`)

Tests HTTP request/response handling:

**Covered Endpoints:**

- `GET /api/games/public/popular` - Popular games with pagination
- `GET /api/games/public/recent` - Recent games with pagination
- `GET /api/games/public/search` - Title-based search
- `GET /api/games/public/by-user` - User-based search
- `GET /api/games/public/stats` - Global statistics

**Key Test Scenarios:**

- 📊 Proper JSON response formatting
- 🔢 Default pagination handling
- 🔍 Query parameter extraction
- 📝 Request middleware integration

### ⚙️ Middleware Tests (`middleware.test.ts`)

Tests validation and utility functions:

**Covered Areas:**

- Pagination validation logic
- Email format validation
- Game data validation
- Rate limiting calculations
- Request tracking algorithms
- Error categorization logic

### 🛠️ Utility Tests (`helpers.test.ts`)

Tests helper functions and validation utilities:

**Covered Areas:**

- String sanitization
- Number validation
- Array utilities
- Custom error creation
- Data type validation

## Running Tests

### 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit
```

### 🎯 Specific Test Suites

```bash
# Repository tests only
npm test -- --testPathPattern=repositories

# Service tests only
npm test -- --testPathPattern=services

# Controller tests only
npm test -- --testPathPattern=controllers

# Middleware tests only
npm test -- --testPathPattern=middleware
```

### 📊 Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Coverage files will be in /coverage directory
open coverage/lcov-report/index.html
```

## Test Configuration

### 🔧 Jest Setup (`jest.config.js`)

- **Framework:** ts-jest for TypeScript support
- **Environment:** Node.js
- **Timeout:** 10 seconds per test
- **Coverage:** All src files except app.ts and db.ts
- **Setup:** Automatic mock clearing and restoration

### 🌍 Environment Variables

Tests use isolated environment configuration:

```bash
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5433
DB_NAME=test_games_db
DB_USER=test_user
DB_PASSWORD=test_password
```

## Mocking Strategy

### 📦 External Dependencies

- **PostgreSQL Pool:** Mocked with jest.fn() for all database operations
- **Express Request/Response:** Partial mocks for controller testing
- **Console methods:** Mocked to reduce test noise

### 🎭 Mock Data

Realistic test data mimicking production scenarios:

- User games with proper email associations
- Statistical data with realistic numbers
- Error scenarios with appropriate error messages
- Pagination responses with correct metadata

## Best Practices Implemented

### ✅ Test Quality

- **Isolation:** Each test is independent with fresh mocks
- **Coverage:** High coverage across all application layers
- **Realistic Data:** Test data matches production data structures
- **Error Scenarios:** Both success and failure paths tested
- **Edge Cases:** Boundary conditions and validation limits tested

### 🔄 Maintenance

- **Clear Naming:** Descriptive test and describe block names
- **Documentation:** Inline comments for complex test logic
- **Organization:** Logical grouping by functionality
- **Setup/Teardown:** Proper mock cleanup between tests

### 🚀 Performance

- **Fast Execution:** Mocked external dependencies for speed
- **Parallel Execution:** Jest runs tests in parallel by default
- **Minimal Setup:** Lightweight test environment configuration

## Integration with CI/CD

These unit tests are designed to run in continuous integration environments:

```bash
# In CI pipeline
npm ci                    # Install exact dependencies
npm run test:coverage     # Run tests with coverage
npm run build            # Verify TypeScript compilation
```

## Extending Tests

### 📝 Adding New Tests

1. Create test file in appropriate category folder
2. Follow existing naming convention: `ComponentName.test.ts`
3. Import and mock necessary dependencies
4. Write descriptive test cases covering both success and failure scenarios
5. Update this documentation with new test coverage

### 🔧 Adding New Mock Data

Add realistic mock data to test files following the existing pattern:

```typescript
const mockGameData = {
  id: 1,
  title: "Test Game",
  rating: 8,
  timespent: 50,
  email: "user@test.com",
  image_path: "game.jpg",
  dateadded: new Date(),
};
```

## Troubleshooting

### ❗ Common Issues

1. **Module not found errors:** Ensure TypeScript paths are correct
2. **Mock not working:** Verify jest.mock() is called before imports
3. **Async test failures:** Use proper async/await or return promises
4. **Coverage issues:** Check if files are excluded in jest.config.js

### 🔍 Debug Tests

```bash
# Run single test file
npm test GameRepository.test.ts

# Run with verbose output
npm test -- --verbose

# Debug specific test
npm test -- --testNamePattern="should create a game successfully"
```
