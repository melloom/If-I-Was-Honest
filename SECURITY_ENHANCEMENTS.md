# Security Enhancements - Implementation Guide

This document describes the new security features added to the application.

## 🔐 Features Implemented

### 1. Redis-Based Rate Limiting

**Purpose**: Replaces in-memory rate limiting for distributed systems and production deployments.

**Installation**: Redis is already installed via npm packages.

**Configuration**:
```env
REDIS_URL=redis://localhost:6379
```

**Usage**:
- The `RateLimiter` class automatically detects Redis availability
- Falls back to in-memory storage if Redis is unavailable
- Applies to:
  - Auth endpoints (5 attempts per 15 minutes)
  - Signup (3 attempts per hour)
  - API routes (100 requests per minute)

**For Production**:
- Use Redis Cloud or self-hosted Redis
- Example Redis Cloud URL: `redis://default:password@hostname:port`

---

### 2. Email Verification for New Signups

**Purpose**: Verify user email addresses to prevent spam and ensure legitimate accounts.

**Files**:
- `src/lib/email.ts` - Email service
- `src/lib/auth-tokens.ts` - Token generation and verification
- `src/app/api/auth/verify-email/route.ts` - Verification endpoint

**Configuration**:
```env
EMAIL_SERVICE=debug  # or 'gmail', 'sendgrid', 'smtp'
EMAIL_FROM=noreply@example.com

# For Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# For SendGrid
SENDGRID_API_KEY=your-api-key

# For Custom SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=user
SMTP_PASSWORD=pass
```

**Flow**:
1. User signs up
2. Email verification token generated (24-hour expiry)
3. Verification email sent
4. User clicks link and email is marked verified
5. Account fully activated

**Email Service Options**:
- `debug`: Logs emails to console (development only)
- `gmail`: Use Gmail with app-specific password
- `sendgrid`: Professional email service
- `smtp`: Custom SMTP server

---

### 3. Password Reset Flow

**Purpose**: Allow users to safely reset forgotten passwords.

**Files**:
- `src/lib/auth-tokens.ts` - Token generation and verification
- `src/app/api/auth/forgot-password/route.ts` - Request reset
- `src/app/api/auth/reset-password/route.ts` - Complete reset

**Flow**:
1. User requests password reset with email
2. Reset token generated (1-hour expiry)
3. Reset email sent with secure link
4. User clicks link and sets new password
5. Token marked as used (one-time only)

**Security**:
- Tokens are one-time use only
- 1-hour expiration
- Hashed storage in database
- Constant-time token comparison

---

### 4. Environment-Specific Secrets

**Purpose**: Manage configuration safely across environments.

**Files**:
- `.env.example` - Template for required variables
- `.env.local.example` - Comprehensive configuration guide

**Best Practices**:
1. Never commit `.env.local` to Git
2. Use different secrets for each environment
3. Store sensitive data in environment variables
4. Use secrets manager in production (AWS Secrets Manager, HashiCorp Vault, etc.)

**Configuration Levels**:
- `NEXT_PUBLIC_*` - Public (safe to expose to browser)
- `*` - Private (server-side only)

---

### 5. HTTPS/TLS in Production

**Purpose**: Encrypt all traffic and prevent man-in-the-middle attacks.

**Configuration**:
```env
ENFORCE_HTTPS=true  # In production only
```

**What This Does**:
1. Adds HSTS header (Strict-Transport-Security)
2. Redirects HTTP to HTTPS
3. Sets secure cookie flags

**Deployment**:
- Use a reverse proxy (Nginx, Cloudflare) or load balancer (AWS ALB)
- Or use Vercel (automatically handles HTTPS)
- Obtain SSL/TLS certificate (Let's Encrypt is free)

**Testing Locally**:
- Leave `ENFORCE_HTTPS=false` for development
- HTTPS required for production only

---

### 6. Monitoring & Error Tracking

**Purpose**: Track errors and user sessions in production.

**Supported Services**:
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error context

**Configuration**:
```env
SENTRY_AUTH_TOKEN=your-token
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

NEXT_PUBLIC_LOGROCKET_APP_ID=your-app-id
```

**Files**:
- `src/lib/sentry.ts` - Sentry initialization
- `src/lib/monitoring.ts` - Monitoring utilities

**Usage**:
```typescript
import { captureException, identifyUser } from '@/lib/monitoring'

// Track errors
try {
  // code
} catch (error) {
  captureException(error, { userId, action: 'create-entry' })
}

// Identify users
identifyUser(userId, email, username)
```

**Features**:
- Automatic error detection
- Performance monitoring
- User session replay
- Breadcrumb tracking
- Custom context

---

## 🚀 Setup Instructions

### 1. Local Development

```bash
# Install dependencies (already done)
npm install

# Create .env.local from template
cp .env.local.example .env.local

# Configure for local development
EMAIL_SERVICE=debug  # Logs emails instead of sending
REDIS_URL=redis://localhost:6379  # Optional local Redis
```

### 2. Testing Email

```bash
# Test email configuration
node -e "require('./src/lib/email.ts').testEmailConfiguration()"
```

### 3. Production Deployment

```env
# Set to production
NODE_ENV=production

# Enable HTTPS
ENFORCE_HTTPS=true

# Configure Redis (required for rate limiting)
REDIS_URL=redis://default:password@hostname:port

# Configure email service
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=...

# Configure monitoring
NEXT_PUBLIC_SENTRY_DSN=...
NEXT_PUBLIC_LOGROCKET_APP_ID=...
```

---

## 📊 Database Schema Updates

Add these fields to the `users` collection in Firestore:

```typescript
// Email verification
emailVerified: boolean
emailVerifiedAt: timestamp

// Password reset
passwordResetAt: timestamp
```

Create these new collections:

```typescript
// Email Verification Tokens
emailVerificationTokens: {
  userId: string
  email: string
  hashedToken: string
  expiresAt: timestamp
  createdAt: timestamp
  used: boolean
}

// Password Reset Tokens
passwordResetTokens: {
  email: string
  hashedToken: string
  expiresAt: timestamp
  createdAt: timestamp
  used: boolean
}
```

---

## 🔒 Security Checklist

- [x] SQL Injection protection (Prisma ORM)
- [x] XSS protection (sanitization + CSP)
- [x] CSRF protection (NextAuth)
- [x] Rate limiting (Redis + fallback)
- [x] Password hashing (bcrypt)
- [x] Input validation (Zod)
- [x] Security headers (CSP, HSTS, etc.)
- [x] Email verification
- [x] Password reset flow
- [x] Error tracking (Sentry)
- [x] Session monitoring (LogRocket)
- [x] HTTPS/TLS ready
- [x] Environment secrets management

---

## 🧪 Testing

### Email Verification
```bash
# 1. User signup triggers email verification
# 2. Token sent in email (or logged if EMAIL_SERVICE=debug)
# 3. Click verification link or call /api/auth/verify-email?token=...
```

### Password Reset
```bash
# 1. POST /api/auth/forgot-password { email }
# 2. Reset token sent via email
# 3. POST /api/auth/reset-password { token, password }
```

### Rate Limiting
```bash
# Make multiple requests and observe rate limit response
# Should return 429 status when exceeded
```

---

## 📚 Additional Resources

- [OWASP Security Guidelines](https://owasp.org)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security)
- [Sentry Documentation](https://docs.sentry.io)
- [LogRocket Documentation](https://docs.logrocket.com)

---

## 🐛 Troubleshooting

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping`
- Check REDIS_URL is correct
- App falls back to in-memory if Redis unavailable

### Email Not Sending
- For debug mode, check console logs
- For Gmail, use app-specific password (not account password)
- For SendGrid, verify API key and sender address
- Check EMAIL_FROM matches verified address

---

## 📝 Notes

- All tokens are hashed before storage (SHA-256)
- Email and password reset flows use constant-time comparison
- Rate limiters are key-based and distributed-safe
- Monitoring captures errors without sensitive data

