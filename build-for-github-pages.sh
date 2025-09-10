#!/bin/bash

# Build script for GitHub Pages deployment
echo "🚀 Building D&D Battle Map for GitHub Pages..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build the React app
echo "🔨 Building React app..."
yarn build

# Copy build files to root for GitHub Pages
echo "📁 Copying files to root directory..."
cp -r build/* ../
cp build/index.html ../index.html

echo "✅ Build complete! Your app is ready for GitHub Pages"
echo "📝 Make sure to commit and push the generated files to GitHub"
echo "🌐 Your site will be available at: https://yourusername.github.io/repository-name"