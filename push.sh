#!/bin/bash
set -e

# Remove stale lock file
rm -f .next/dev/lock 2>/dev/null || true

# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "Remove Turso database references - using Firebase only

- Removed Turso/libSQL adapter from Prisma configuration
- Removed TURSO_AUTH_TOKEN from environment variables
- Updated documentation to reflect Firebase-only approach
- Cleaned up .env files removing Turso database URLs
- Simplified Prisma client to use standard SQLite configuration"

# Push to main branch
git push origin main

echo "✅ Successfully pushed to git!"
