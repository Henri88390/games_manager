#!/bin/bash
set -e

# Create uploads directory if it doesn't exist
mkdir -p /app/uploads

# Always copy default images to ensure latest versions are used
echo "Copying default images to uploads directory..."
cp -f /app/default-images/*.jpg /app/uploads/ 2>/dev/null || true
echo "Default images copied successfully!"

# Start the application
exec "$@"
