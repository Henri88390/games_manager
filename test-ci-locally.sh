#!/bin/bash

# Local CI Pipeline Test Script
# This script mimics what GitHub Actions runs

set -e  # Exit on any error

echo "🚀 Starting local CI pipeline test..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Start PostgreSQL (like CI does)
print_step "Starting PostgreSQL test database..."
docker-compose up -d postgres || {
    print_error "Failed to start PostgreSQL"
    exit 1
}

# Wait for database to be ready
print_step "Waiting for database to be ready..."
sleep 5

# Step 2: Test Backend
print_step "Testing Backend..."

cd backend

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check Node.js version (CI tests on 18.x and 20.x)
NODE_VERSION=$(node -v)
print_step "Using Node.js version: $NODE_VERSION"

# Install dependencies (same as CI)
print_step "Installing backend dependencies..."
npm ci || {
    echo "npm ci failed, trying npm install..."
    rm -f package-lock.json
    npm install
}

# Setup test database (same as CI)
print_step "Setting up test database..."
export NODE_ENV=test
export DB_HOST=localhost
export DB_PORT=5432  # Docker uses default port
export DB_NAME=games_db
export DB_USER=user
export DB_PASSWORD=password

# Initialize database schema
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f init-db.sql || {
    print_error "Failed to initialize test database"
    exit 1
}

# Run TypeScript compilation check
print_step "Checking TypeScript compilation..."
npx tsc --noEmit || {
    print_error "TypeScript compilation failed"
    exit 1
}

# Run tests (same as CI)
print_step "Running backend tests..."
npm test || {
    print_error "Backend tests failed"
    exit 1
}

# Run tests with coverage (same as CI)
print_step "Running backend tests with coverage..."
npm run test:coverage || {
    print_error "Backend coverage tests failed"
    exit 1
}

cd ..

# Step 3: Test Frontend
print_step "Testing Frontend..."

cd frontend

# Install dependencies
print_step "Installing frontend dependencies..."
npm ci || {
    echo "npm ci failed, trying npm install..."
    rm -f package-lock.json
    npm install
}

# TypeScript compilation check
print_step "Checking frontend TypeScript compilation..."
npx tsc --noEmit || {
    print_error "Frontend TypeScript compilation failed"
    exit 1
}

# Run ESLint
print_step "Running frontend ESLint..."
npm run lint || {
    echo "ESLint issues found (not blocking)"
}

# Build frontend
print_step "Building frontend..."
npm run build || {
    print_error "Frontend build failed"
    exit 1
}

cd ..

# Step 4: Cleanup
print_step "Cleaning up..."
docker-compose down

print_success "🎉 All CI pipeline tests passed locally!"
print_step "You can now safely push to trigger the GitHub Actions workflow."