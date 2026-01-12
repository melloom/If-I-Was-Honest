# API Design

## Overview

RESTful API with JSON responses. All endpoints require authentication unless noted. Base URL: `https://api.ifiwashonest.com/v1`

---

## Authentication

### Auth Flow

**Option A: JWT Tokens**
- Login returns JWT token
- Include in `Authorization: Bearer <token>` header
- Token expires in 30 days (or configured duration)

**Option B: Session Cookies**
- Login sets HTTP-only cookie
- Cookie sent automatically with requests
- CSRF protection required

**We recommend JWT for mobile/API flexibility.**

---

## Endpoints

### Authentication

#### `POST /auth/register`
Register a new user.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "email_verified": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Please verify your email before creating entries."
}
```

**Errors**:
- `400 Bad Request`: Invalid email or password (too short)
- `409 Conflict`: Email already registered

---

#### `POST /auth/login`
Login with email and password.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "remember_me": true
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "email_verified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-02-14T10:30:00Z"
}
```

**Errors**:
- `401 Unauthorized`: Invalid email or password
- `403 Forbidden`: Email not verified

---

#### `POST /auth/magic-link`
Request magic link for passwordless login.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Magic link sent to your email. It expires in 10 minutes."
}
```

**Errors**:
- `400 Bad Request`: Invalid email format
- `404 Not Found`: Email not registered (don't leak, return same message)

---

#### `GET /auth/verify-email?token=<token>`
Verify email address.

**Response** (200 OK):
```json
{
  "message": "Email verified successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400 Bad Request`: Invalid or expired token

---

#### `POST /auth/forgot-password`
Request password reset email.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "If that email exists, we sent a reset link. Check your inbox."
}
```

**Errors**:
- `400 Bad Request`: Invalid email format

---

#### `POST /auth/reset-password`
Reset password with token.

**Request**:
```json
{
  "token": "reset-token-here",
  "password": "newpassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Password reset successfully."
}
```

**Errors**:
- `400 Bad Request`: Invalid or expired token, weak password

---

#### `POST /auth/logout`
Logout (invalidate session/token).

**Response** (200 OK):
```json
{
  "message": "Logged out successfully."
}
```

---

### Entries

#### `GET /entries`
List user's private entries.

**Query Parameters**:
- `page` (integer, default: 1)
- `per_page` (integer, default: 20, max: 100)
- `search` (string): Full-text search
- `date_from` (ISO 8601): Start date
- `date_to` (ISO 8601): End date
- `status[]` (array): Filter by status (`still_true`, `i_grew`, etc.)
- `mood_tags[]` (array): Filter by mood tag names
- `custom_tags[]` (array): Filter by custom tag names
- `sort` (string): `created_at_desc`, `created_at_asc`, `updated_at_desc`, `title_asc`

**Response** (200 OK):
```json
{
  "entries": [
    {
      "id": "223e4567-e89b-12d3-a456-426614174000",
      "title": "Feeling overwhelmed",
      "content_preview": "Today was really hard...",
      "status": "still_true",
      "mood_tags": ["anxious", "overwhelmed"],
      "custom_tags": ["work-stress"],
      "created_at": "2024-01-15T14:30:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      "published": false
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

**Errors**:
- `401 Unauthorized`: Not authenticated

---

#### `GET /entries/:id`
Get single entry by ID.

**Response** (200 OK):
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174000",
  "title": "Feeling overwhelmed",
  "content": "<p>Today was really hard...</p>",
  "status": "still_true",
  "mood_tags": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174000",
      "name": "anxious",
      "type": "mood",
      "color": "#C17A7A"
    }
  ],
  "custom_tags": [
    {
      "id": "423e4567-e89b-12d3-a456-426614174000",
      "name": "work-stress",
      "type": "custom"
    }
  ],
  "created_at": "2024-01-15T14:30:00Z",
  "updated_at": "2024-01-15T14:30:00Z",
  "published": false,
  "published_entry_id": null,
  "status_history": [
    {
      "old_status": null,
      "new_status": "still_true",
      "changed_at": "2024-01-15T14:30:00Z"
    }
  ]
}
```

**Errors**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Entry not found or not owned by user

---

#### `POST /entries`
Create new entry.

**Request**:
```json
{
  "title": "Feeling overwhelmed",
  "content": "<p>Today was really hard...</p>",
  "status": "still_true",
  "mood_tag_ids": ["323e4567-e89b-12d3-a456-426614174000"],
  "custom_tag_names": ["work-stress"],
  "time_lock_until": null
}
```

**Response** (201 Created):
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174000",
  "title": "Feeling overwhelmed",
  "content": "<p>Today was really hard...</p>",
  "status": "still_true",
  "created_at": "2024-01-15T14:30:00Z",
  "updated_at": "2024-01-15T14:30:00Z"
}
```

**Errors**:
- `400 Bad Request`: Missing content, invalid status
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Email not verified

---

#### `PATCH /entries/:id`
Update entry (only private entries).

**Request**:
```json
{
  "title": "Updated title",
  "content": "<p>Updated content...</p>",
  "status": "i_grew",
  "mood_tag_ids": ["323e4567-e89b-12d3-a456-426614174000"],
  "custom_tag_names": ["work-stress", "processed"]
}
```

**Response** (200 OK):
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174000",
  "title": "Updated title",
  "content": "<p>Updated content...</p>",
  "status": "i_grew",
  "updated_at": "2024-01-16T10:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Invalid data
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Entry is published (cannot edit published entries)
- `404 Not Found`: Entry not found

---

#### `DELETE /entries/:id`
Delete entry.

**Query Parameters**:
- `permanent` (boolean, default: false): Hard delete (otherwise soft delete)

**Response** (200 OK):
```json
{
  "message": "Entry deleted successfully."
}
```

**Errors**:
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Entry not found
- `409 Conflict`: Entry is published (must unpublish first)

---

### Tags

#### `GET /tags`
List user's custom tags and system mood tags.

**Query Parameters**:
- `type` (string): Filter by type (`mood` or `custom`)

**Response** (200 OK):
```json
{
  "tags": [
    {
      "id": "323e4567-e89b-12d3-a456-426614174000",
      "name": "anxious",
      "type": "mood",
      "color": "#C17A7A",
      "usage_count": 5
    },
    {
      "id": "423e4567-e89b-12d3-a456-426614174000",
      "name": "work-stress",
      "type": "custom",
      "usage_count": 12
    }
  ]
}
```

---

#### `POST /tags`
Create custom tag.

**Request**:
```json
{
  "name": "work-stress"
}
```

**Response** (201 Created):
```json
{
  "id": "423e4567-e89b-12d3-a456-426614174000",
  "name": "work-stress",
  "type": "custom",
  "usage_count": 0
}
```

**Errors**:
- `400 Bad Request`: Invalid name, tag already exists
- `409 Conflict`: Tag name already exists (case-insensitive)

---

#### `PATCH /tags/:id`
Update custom tag (rename or merge).

**Request**:
```json
{
  "name": "work-stress-new"
}
```

**Response** (200 OK):
```json
{
  "id": "423e4567-e89b-12d3-a456-426614174000",
  "name": "work-stress-new",
  "type": "custom",
  "usage_count": 12
}
```

**Errors**:
- `400 Bad Request`: Invalid name
- `403 Forbidden`: Cannot edit system mood tags
- `404 Not Found`: Tag not found

---

#### `DELETE /tags/:id`
Delete custom tag.

**Query Parameters**:
- `merge_with` (UUID, optional): Merge tag usage with another tag before deleting

**Response** (200 OK):
```json
{
  "message": "Tag deleted successfully."
}
```

**Errors**:
- `400 Bad Request`: Tag is in use (must provide merge_with or force delete)
- `403 Forbidden`: Cannot delete system mood tags
- `404 Not Found`: Tag not found

---

### Publishing

#### `POST /entries/:id/publish`
Publish entry anonymously.

**Request**:
```json
{
  "delay_hours": 0,
  "irreversible": false
}
```

**Response** (201 Created):
```json
{
  "published_entry": {
    "id": "523e4567-e89b-12d3-a456-426614174000",
    "anonymous_id": "honest-7k3j9x",
    "title": "Feeling overwhelmed",
    "content": "<p>Today was really hard...</p>",
    "mood_tags": ["anxious", "overwhelmed"],
    "published_at": "2024-01-16T10:00:00Z"
  },
  "message": "Entry published anonymously. You have 24 hours to unpublish if you change your mind.",
  "unpublish_deadline": "2024-01-17T10:00:00Z"
}
```

**Errors**:
- `400 Bad Request`: Entry already published, invalid entry
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Entry not found
- `409 Conflict`: Entry is locked (time_lock_until in future)

---

#### `POST /published-entries/:id/unpublish`
Unpublish entry (grace period only).

**Response** (200 OK):
```json
{
  "message": "Entry unpublished successfully."
}
```

**Errors**:
- `400 Bad Request`: Grace period expired, cannot unpublish
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Published entry not found or not owned by user

---

### Public Feed

#### `GET /feed`
Get public feed of published entries.

**Query Parameters**:
- `page` (integer, default: 1)
- `per_page` (integer, default: 20, max: 100)
- `search` (string): Full-text search
- `date_from` (ISO 8601): Start date
- `date_to` (ISO 8601): End date
- `mood_tags[]` (array): Filter by mood tag names
- `sort` (string): `published_at_desc` (default), `published_at_asc`

**Response** (200 OK):
```json
{
  "entries": [
    {
      "id": "523e4567-e89b-12d3-a456-426614174000",
      "anonymous_id": "honest-7k3j9x",
      "title": "Feeling overwhelmed",
      "content": "<p>Today was really hard...</p>",
      "mood_tags": ["anxious", "overwhelmed"],
      "published_at": "2024-01-16T10:00:00Z",
      "relative_time": "2 days ago"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

**Authentication**: Not required (public endpoint)

---

#### `GET /feed/:anonymous_id`
Get single published entry by anonymous ID.

**Response** (200 OK):
```json
{
  "id": "523e4567-e89b-12d3-a456-426614174000",
  "anonymous_id": "honest-7k3j9x",
  "title": "Feeling overwhelmed",
  "content": "<p>Today was really hard...</p>",
  "mood_tags": ["anxious", "overwhelmed"],
  "published_at": "2024-01-16T10:00:00Z",
  "relative_time": "2 days ago"
}
```

**Errors**:
- `404 Not Found`: Entry not found or removed

**Authentication**: Not required (public endpoint)

---

### Reports

#### `POST /published-entries/:id/report`
Report published entry.

**Request**:
```json
{
  "reason": "spam",
  "details": "This looks like promotional content"
}
```

**Response** (201 Created):
```json
{
  "message": "Thank you for helping keep this space safe. We'll review this entry."
}
```

**Errors**:
- `400 Bad Request`: Invalid reason, already reported
- `404 Not Found`: Published entry not found

**Authentication**: Optional (allow anonymous reports, but track IP)

---

### Settings

#### `GET /settings`
Get user settings.

**Response** (200 OK):
```json
{
  "email": "user@example.com",
  "preferences": {
    "theme": "dark",
    "font_size": "medium",
    "auto_save": true,
    "show_character_count": false,
    "email_notifications": {
      "entry_reminders": true,
      "weekly_digest": false
    }
  }
}
```

---

#### `PATCH /settings`
Update user settings.

**Request**:
```json
{
  "preferences": {
    "theme": "light",
    "font_size": "large",
    "auto_save": false
  }
}
```

**Response** (200 OK):
```json
{
  "message": "Settings updated successfully."
}
```

---

#### `POST /settings/change-email`
Change email address.

**Request**:
```json
{
  "email": "newemail@example.com",
  "password": "currentpassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Verification email sent to new address."
}
```

**Errors**:
- `400 Bad Request`: Invalid email, incorrect password
- `409 Conflict`: Email already in use

---

#### `POST /settings/change-password`
Change password.

**Request**:
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Password changed successfully."
}
```

**Errors**:
- `400 Bad Request`: Incorrect current password, weak new password

---

#### `POST /settings/export-data`
Export all user data.

**Response** (200 OK):
```json
{
  "export_url": "https://api.ifiwashonest.com/exports/abc123...",
  "expires_at": "2024-01-22T10:30:00Z",
  "message": "Your data export is ready. Download within 24 hours."
}
```

**Note**: Export is generated asynchronously, user receives email when ready.

---

#### `DELETE /settings/account`
Delete user account.

**Request**:
```json
{
  "confirmation": "DELETE",
  "password": "currentpassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Account deletion scheduled. All data will be removed within 24 hours."
}
```

**Errors**:
- `400 Bad Request`: Incorrect confirmation or password

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ENTRY_NOT_FOUND",
    "message": "Entry not found or you don't have permission to access it.",
    "details": {
      "entry_id": "223e4567-e89b-12d3-a456-426614174000"
    }
  }
}
```

### Error Codes

- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Authenticated but not authorized
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `CONFLICT`: Resource conflict (e.g., email exists)
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## Rate Limiting

- **Authentication**: 5 requests per minute per IP
- **Entry creation**: 10 requests per minute per user
- **Publishing**: 5 requests per hour per user
- **Reporting**: 10 requests per hour per IP
- **General API**: 100 requests per minute per user

**Headers**:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

**Response** (429 Too Many Requests):
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 60
  }
}
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters**:
- `page` (integer, default: 1)
- `per_page` (integer, default: 20, max: 100)

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Webhooks (Future)

For admin notifications, integrations, etc.:

- `entry.published` - Entry published
- `entry.reported` - Entry reported
- `user.created` - New user registered
- `report.resolved` - Report reviewed

---

## Versioning

- Current version: `v1`
- Include in URL: `/v1/entries`
- Include in header: `Accept: application/vnd.ifiwashonest.v1+json`

---

## Security

- **HTTPS only** (TLS 1.3)
- **CORS**: Configure for frontend domain only
- **CSRF**: Required for cookie-based auth
- **Input validation**: Sanitize all inputs
- **SQL injection**: Use parameterized queries
- **XSS**: Sanitize HTML content
- **Rate limiting**: Per endpoint (see above)
- **Authentication**: JWT or secure cookies

---

## Assumptions

1. **JWT tokens** for authentication (stateless, mobile-friendly)
2. **JSON** for all requests/responses
3. **ISO 8601** for all timestamps
4. **UTC** timestamps (convert to user timezone in client)
5. **Pagination** for all list endpoints
6. **Rate limiting** on all public and authenticated endpoints

