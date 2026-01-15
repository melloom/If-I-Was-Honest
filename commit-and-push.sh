#!/bin/bash

# Build and push to git script
# Run this script to build the project and push changes to git

echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before committing."
    exit 1
fi

echo "✅ Build successful!"
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
git commit -m "feat: implement make-private-entries-public feature

- Add 'Make Public' button to dashboard for private entries
- Prevent re-publishing of already published entries
- Allow editing of published entries (content syncs to feed)
- Add confirmation modal warning about irreversibility
- Fix Entry interface to include status field
- Fix PATCH endpoint to properly handle status parameter
- Add comprehensive feature documentation
- Hide NO_STATUS badge on feed (only show when status is set)
- Restore full status functionality (create, edit, display)

Features:
✅ Private entries can be made public (one-way operation)
✅ Once public, entries cannot be reverted to private
✅ Published entries remain editable
✅ 24-hour deletion window for public posts
✅ Full anonymization on public feed
✅ Status system fully functional (hidden when NO_STATUS in feed)

Files changed:
- src/app/api/entries/[id]/route.ts (fix status handling)
- src/app/api/entries/route.ts (restore status to POST)
- src/app/dashboard/DashboardClient.tsx (add Make Public + status UI)
- src/app/feed/FeedClient.tsx (hide NO_STATUS badges)
- src/app/about/page.tsx (responsive improvements)
- src/app/globals.css (mobile viewport fixes)
- src/components/AppHeader.tsx (nav callback)
- FEATURE_MAKE_ENTRIES_PUBLIC.md (documentation)
- MAKE_ENTRIES_PUBLIC_QUICK_GUIDE.md (quick guide)"

if [ $? -ne 0 ]; then
    echo "❌ Commit failed"
    exit 1
fi

echo "✅ Commit successful!"
echo ""
echo "🚀 Pushing to git..."

# Push to origin
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push failed"
    exit 1
fi

echo "✅ Push successful!"
echo ""
echo "🎉 All done! Changes have been built and pushed to git."
