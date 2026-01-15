/**
 * DEPRECATED: Middleware has been migrated to the new proxy pattern (Next.js 16+).
 *
 * This file has been disabled. Instead:
 * - Security headers are configured in next.config.js via the headers() config
 * - Route-level auth checks are handled in individual route handlers using getServerSession()
 *
 * To fully remove this file, run: rm src/middleware.ts
 * Or rename to: src/middleware.ts.backup
 */

// This export is required but will not be called in production
export async function middleware() {
  // No-op: all logic has been migrated
}

export const config = {
  matcher: [],
}
