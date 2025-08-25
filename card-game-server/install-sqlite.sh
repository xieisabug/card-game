#!/bin/bash

# Script to install SQLite3 when network connectivity is available
# Run this script when npm network issues are resolved

echo "Attempting to install sqlite3..."

# Clear npm cache
npm cache clean --force

# Try different registries
npm config set registry https://registry.npmjs.org/

# Install sqlite3
npm install sqlite3 --save

if [ $? -eq 0 ]; then
    echo "✅ SQLite3 installed successfully!"
    echo "The application will now use SQLite database instead of JSON fallback."
    echo "You can verify by running: node -e \"console.log(require('sqlite3'))\""
else
    echo "❌ Failed to install SQLite3"
    echo "The application will continue using JSON fallback storage."
    echo "This doesn't affect functionality - all features work the same."
fi