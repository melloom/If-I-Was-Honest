# New Security API Endpoints

This document describes the new security endpoints added to your application.

## Email Verification

### Verify Email Token
User clicks email verification link to complete registration.

**Endpoint**: `GET /api/auth/verify-email?token=TOKEN`

**Parameters**:
- `token` (required): Email verification token from email

**Response**: Redirects to `/auth/email-verified?email=user@example.com`

**Error Responses**:
- 400: Invalid or expired token
- 500: Server error

---

## Password Reset

### Request Password Reset
Send password reset email to user.

**Endpoint**: `POST /api/auth/forgot-password`

**Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Security Note**: Always returns success message regardless of whether email exists (prevents email enumeration).

**Rate Limiting**: 3 requests per hour per IP

---

### Reset Password with Token
Complete password reset with valid token.

**Endpoint**: `POST /api/auth/reset-password`

**Body**:
```json
{
  "token": "RESET_TOKEN_FROM_EMAIL",
  "password": "NewSecurePassword123"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Maximum 128 characters

**Response** (200 OK):
```json
{
  "message": "Password reset successfully. Please log in with your new password."
}
```

**Error Responses**:
- 400: Invalid or expired token
- 400: Weak password
- 500: Server error


---

## Error Handling

All endpoints return appropriate HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (validation error, invalid token) |
| 401 | Not authenticated |
| 404 | Not found |
| 429 | Rate limited |
| 500 | Server error |

### Error Response Format
```json
{
  "error": "Description of what went wrong",
  "details": {}  // Optional validation details
}
```

---

## Rate Limiting

Rate limiting is applied to prevent abuse:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/forgot-password` | 3 requests | 1 hour |
| Auth endpoints | 5 requests | 15 minutes |
| Signup | 3 signups | 1 hour |
| General API | 100 requests | 1 minute |

Rate limit headers:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1641234567890
```

---

## Implementation Examples

### Email Verification Flow
```typescript
// 1. User signs up
POST /auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// 2. Email sent with verification link
// Email contains: /api/auth/verify-email?token=ABC123...

// 3. User clicks link in email
GET /api/auth/verify-email?token=ABC123...

// 4. Redirects to confirmation page
// Email is now verified
```

### Password Reset Flow
```typescript
// 1. User requests reset
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}

// 2. Email sent with reset link
// Email contains: /auth/reset-password?token=XYZ789...

// 3. User submits new password
POST /api/auth/reset-password
{
  "token": "XYZ789...",
  "password": "NewSecurePass456"
}

// 4. Password updated, user can log in
```

---

## Security Considerations

1. **Token Storage**: Tokens are hashed before storage
2. **Expiry**:
   - Email verification: 24 hours
   - Password reset: 1 hour
3. **One-Time Use**: Email and password reset tokens can only be used once
4. **Rate Limiting**: All auth endpoints are rate limited
5. **No Email Enumeration**: Password reset doesn't reveal if email exists
6. **Secure Comparison**: All token comparisons use constant-time comparison

---

## Testing

### Using cURL

#### Test Email Verification
```bash
curl -X GET "http://localhost:3000/api/auth/verify-email?token=YOUR_TOKEN"
```

#### Test Password Reset Request
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

#### Test Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN","password":"NewPass123"}'
```

### Using Postman
- Import the endpoints above
- Set authentication headers for protected endpoints
- Test with different inputs to verify validation

---

## Troubleshooting

### "Invalid or expired token"
- Token may have expired (verify timing)
- Token may have already been used
- Token may be for wrong endpoint

### "Too many requests"
- Rate limit exceeded
- Wait for reset time or use different IP

