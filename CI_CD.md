# CI/CD Pipeline Documentation

This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### 1. Backend Tests (`backend-tests.yml`)

**Triggers:**

- Push to `main` branch (when backend files change)
- Pull requests to `main` branch (when backend files change)

**What it does:**

- Sets up PostgreSQL test database
- Tests against Node.js versions 18.x and 20.x
- Installs dependencies
- Initializes test database with schema
- Runs all backend tests
- Generates coverage reports
- Uploads coverage to Codecov

**Database Setup:**

- PostgreSQL 15 service container
- Test database: `test_games_db`
- Test user: `test_user`
- Test password: `test_password`
- Port: 5433

## Environment Variables

The CI pipeline uses these environment variables for testing:

```env
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5433
DB_NAME=test_games_db
DB_USER=test_user
DB_PASSWORD=test_password
```

## Running Tests Locally

To run the same tests that CI runs:

```bash
# Backend tests
cd backend
npm ci
npm test

# With coverage
npm run test:coverage

# Fast tests (no coverage)
npm run test:fast

# Frontend build verification
cd frontend
npm ci
npm run build
npm run lint
```

## Coverage Reports

Coverage reports are automatically generated and uploaded to Codecov when tests run in CI. You can view coverage reports at:
`https://codecov.io/gh/Henri88390/games_manager`

## Adding New Tests

1. Create test files in `backend/__tests__/unit/` or `backend/__tests__/integration/`
2. Follow the existing naming convention: `*.test.ts`
3. Tests will automatically run in CI when you push to main

## Troubleshooting CI

### Common Issues:

1. **Database connection failures:**

   - Check that test database credentials match in workflow and test setup
   - Ensure `init-db.sql` is present and valid

2. **Test timeouts:**

   - Check for infinite loops or hanging operations
   - Verify mock configurations are correct

3. **TypeScript compilation errors:**

   - Run `npx tsc --noEmit` locally to check for type errors
   - Ensure all dependencies are properly typed

4. **Coverage upload failures:**
   - Coverage upload failures don't fail the build
   - Check Codecov configuration if needed

### Debugging Failed Builds:

1. Check the Actions tab in GitHub repository
2. Click on the failed workflow run
3. Expand the failed step to see detailed logs
4. Compare environment variables and setup with local working configuration

## Future Enhancements

Potential improvements for the CI pipeline:

1. **Integration Tests:** Add database integration tests
2. **E2E Tests:** Frontend-backend integration testing
3. **Performance Tests:** API response time testing
4. **Security Scanning:** Dependency vulnerability checks
5. **Docker Testing:** Test Docker containers
6. **Deployment:** Automatic deployment to staging/production
