#!/bin/bash

# Test runner script for the games manager backend

echo "🧪 Running Backend Unit Tests"
echo "=============================="

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run different test suites
echo ""
echo "🔧 Running Unit Tests..."
npm run test:unit

echo ""
echo "📊 Running Tests with Coverage..."
npm run test:coverage

echo ""
echo "✅ Test Summary"
echo "==============="
echo "- Repository tests: Database layer functionality"
echo "- Service tests: Business logic validation"
echo "- Controller tests: HTTP request/response handling"
echo "- Middleware tests: Validation and error handling"
echo "- Utility tests: Helper functions and validation logic"

echo ""
echo "🎯 To run specific test suites:"
echo "  npm test -- --testPathPattern=repositories"
echo "  npm test -- --testPathPattern=services"
echo "  npm test -- --testPathPattern=controllers"
echo "  npm test -- --testPathPattern=middleware"