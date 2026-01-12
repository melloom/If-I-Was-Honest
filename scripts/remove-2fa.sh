#!/bin/bash
# Remove all 2FA-related files

echo "🗑️  Removing 2FA files..."

# Remove 2FA API routes
rm -f src/app/api/auth/2fa/setup/route.ts
rm -f src/app/api/auth/2fa/confirm/route.ts
rm -f src/app/api/auth/2fa/verify/route.ts
rmdir src/app/api/auth/2fa 2>/dev/null || true

# Remove 2FA library
rm -f src/lib/2fa.ts

echo "✅ 2FA files removed!"
echo ""
echo "Remaining 2FA references in error logs will be resolved."
