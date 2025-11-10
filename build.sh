#!/bin/bash

# Build script for Trello Clone unified deployment

set -e  # Exit immediately if a command exits with a non-zero status

echo "Building Trello Clone unified application..."

echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

echo "Preparing backend..."
cd backend
bundle install
cd ..

echo "Build completed successfully!"
echo "You can now build the Docker image using: docker build -t trello-unified -f Dockerfile.unified ."