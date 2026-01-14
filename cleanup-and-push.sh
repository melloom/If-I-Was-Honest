#!/bin/bash

# Clean up seed scripts
echo "🧹 Cleaning up seed scripts..."

rm -f scripts/seed-entries.js
rm -f scripts/seed-entries-happy.js
rm -f scripts/seed-entries.ts
rm -f SEED_ENTRIES_README.md

echo "✅ Cleanup complete!"
echo ""
echo "📝 Committing changes..."

# Stage all changes
git add -A

# Check if there are changes to commit
if git diff --cached --quiet; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

# Commit the changes
git commit -m "chore: remove temporary seed scripts and documentation"

echo ""
echo "📤 Pushing to git..."
git push

echo ""
echo "✅ All done!"
