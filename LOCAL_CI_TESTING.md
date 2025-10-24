# Testing CI Pipeline Locally

## Method 1: Manual Testing (Recommended)

### Quick Test (Local Machine)

Run the automated test script on your local machine:

```bash
./test-ci-locally.sh
```

**Important:** This script runs on your host machine and manages Docker Compose itself. Do NOT run this script inside a Docker container.

### Step-by-Step Manual Testing

1. **Start the test database:**

```bash
docker-compose up -d postgres
```

2. **Test backend (same commands as CI):**

```bash
cd backend

# Install dependencies
npm ci || npm install

# Environment setup
export NODE_ENV=test
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=games_db
export DB_USER=user
export DB_PASSWORD=password

# Initialize database
PGPASSWORD=$DB_PASSWORD psql -h localhost -p 5432 -U user -d games_db -f init-db.sql

# TypeScript check
npx tsc --noEmit

# Run tests
npm test
npm run test:coverage
```

3. **Test frontend:**

```bash
cd ../frontend

# Install dependencies
npm ci || npm install

# TypeScript check
npx tsc --noEmit

# Lint and build
npm run lint
npm run build
```

4. **Cleanup:**

```bash
docker-compose down
```

## Method 2: Docker-based Testing (Isolated Environment)

### Quick Docker Test

```bash
# Test in completely isolated Docker environment
docker-compose -f docker-compose.test.yml up --build
```

**What this does:**

- Creates isolated PostgreSQL and test runner containers
- Runs a Docker-specific test script (no docker-compose dependency)
- Tests backend compilation and test suite
- Automatically cleans up when finished

**Note:** This method uses a different test script (`docker-test.sh`) that's optimized for running inside Docker containers.

## Method 3: Using Act (Advanced)

Act allows you to run GitHub Actions locally in Docker containers.

### Install Act

```bash
# macOS
brew install act

# Or download from: https://github.com/nektos/act
```

### Run Specific Workflows

```bash
# Run backend tests workflow
act push -j test -W .github/workflows/backend-tests.yml

# Run code quality workflow
act push -j lint-backend -W .github/workflows/code-quality.yml

# List available jobs
act -l
```

### Act Configuration

Create `.actrc` in project root:

```
--container-architecture linux/amd64
--artifact-server-path /tmp/artifacts
--env-file .env.act
```

Create `.env.act` for local environment variables:

```
NODE_ENV=test
DB_HOST=localhost
DB_PORT=5432
DB_NAME=games_db
DB_USER=user
DB_PASSWORD=password
```

## Method 3: Docker-based Testing

### Create Test Container

```bash
# Build test environment
docker build -f Dockerfile.test -t games-manager-test .

# Run tests in container
docker run --rm -v $(pwd):/app games-manager-test
```

### Dockerfile.test Example

```dockerfile
FROM node:20

WORKDIR /app

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

COPY backend/package*.json backend/
RUN cd backend && npm ci

COPY frontend/package*.json frontend/
RUN cd frontend && npm ci

COPY . .

CMD ["./test-ci-locally.sh"]
```

## Method 4: VS Code Integration

### Tasks Configuration

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Test CI Pipeline",
      "type": "shell",
      "command": "./test-ci-locally.sh",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    }
  ]
}
```

Run with `Cmd+Shift+P` → "Tasks: Run Task" → "Test CI Pipeline"

## Troubleshooting

### Common Issues:

1. **Database Connection**

   - Ensure Docker is running
   - Check if PostgreSQL container is healthy: `docker-compose ps`
   - Verify port isn't in use: `lsof -i :5432`

2. **Permission Errors**

   - Make script executable: `chmod +x test-ci-locally.sh`
   - Check Docker permissions

3. **Node Version Mismatch**

   - Use nvm to test multiple versions:

   ```bash
   nvm install 18
   nvm use 18
   ./test-ci-locally.sh

   nvm install 20
   nvm use 20
   ./test-ci-locally.sh
   ```

4. **Memory Issues**
   - Increase Docker memory allocation
   - Use `--maxWorkers=1` for Jest

### Environment Validation

```bash
# Check environment
node --version
npm --version
docker --version
psql --version

# Validate GitHub Actions syntax
act --dryrun
```

## Best Practices

1. **Always test locally** before pushing
2. **Use the automated script** for consistency
3. **Test on multiple Node versions** if possible
4. **Check both success and failure scenarios**
5. **Validate environment variables** match CI exactly
6. **Review logs** for performance bottlenecks

## Performance Tips

- Use `npm ci` for faster, consistent installs
- Cache `node_modules` between runs when possible
- Run tests in parallel: `npm test -- --maxWorkers=50%`
- Use `--silent` flag for faster Jest execution
