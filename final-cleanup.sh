#!/bin/bash

# Clean up unnecessary files and documentation
echo "🧹 Cleaning up unnecessary files..."

# Remove all the numbered planning docs (01-09)
rm -f 01-product-overview.md
rm -f 02-features.md
rm -f 03-ux-screens.md
rm -f 04-data-model.md
rm -f 05-api-design.md
rm -f 06-security-privacy.md
rm -f 07-tech-stack.md
rm -f 08-implementation-plan.md
rm -f 09-monetization.md

# Remove implementation/setup documentation
rm -f ACCOUNT_DELETION.md
rm -f API_SECURITY_ENDPOINTS.md
rm -f BUILD_AND_PUSH_SUMMARY.md
rm -f DEVICE_COMPATIBILITY.md
rm -f FEATURE_MAKE_ENTRIES_PUBLIC.md
rm -f FEED_SETUP.md
rm -f FIRESTORE_MIGRATION_SUMMARY.md
rm -f MAKE_ENTRIES_PUBLIC_QUICK_GUIDE.md
rm -f PWA_SETUP.md
rm -f README_SECURITY.md
rm -f SECURITY_ENHANCEMENTS.md
rm -f SECURITY_IMPLEMENTATION_COMPLETE.md
rm -f SEO_CHECKLIST.md
rm -f SEO_IMAGES_GUIDE.md
rm -f SEO_IMPLEMENTATION.md
rm -f SETUP_COMPLETE.md

# Remove unused scripts
rm -f scripts/install-security.sh
rm -f scripts/remove-2fa.sh
rm -f scripts/remove-sentry.sh
rm -f scripts/test-auth.ts

# Remove temporary shell scripts
rm -f cleanup-and-push.sh
rm -f push.sh

# Remove .delete-middleware marker file if exists
rm -f .delete-middleware

echo "✅ Cleanup complete!"
echo ""
echo "Keeping:"
echo "  - README.md (main project readme)"
echo "  - DEVELOPMENT.md (development guide)"
echo "  - SECURITY.md (security documentation)"
echo "  - commit-and-push.sh (useful build & push script)"
echo "  - scripts/deployFirestore*.js (deployment scripts)"
echo "  - scripts/dev-kill.sh (development utility)"
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
git commit -m "chore: clean up unnecessary documentation and scripts

Removed:
- Planning documents (01-09 series)
- Implementation summaries and guides
- Temporary setup documentation
- Unused utility scripts

Kept essential docs: README.md, DEVELOPMENT.md, SECURITY.md"

echo ""
echo "📤 Pushing to git..."
git push

echo ""
echo "✅ All done! Workspace cleaned."
