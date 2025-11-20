#!/bin/bash
# Package Python dependencies for Lambda deployment

set -e

echo "📦 Packaging dependencies for AWS Lambda..."

# Create a temporary directory for packaging
rm -rf .lambda_package
mkdir -p .lambda_package

# Install dependencies to the package directory
echo "Installing dependencies..."
pip install -r requirements.txt -t .lambda_package --upgrade

# Copy application code
echo "Copying application code..."
cp -r app .lambda_package/

echo "✅ Package created in .lambda_package/"
echo "Files included:"
ls -lh .lambda_package/ | head -20
