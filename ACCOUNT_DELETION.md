# Account Deletion Policy

## Overview

When users request account deletion, we implement a **24-hour grace period** to allow them to change their mind. After this period, the account is permanently deleted but **published posts remain in the database** to preserve community content.

## Deletion Process

### 1. User Requests Deletion

When a user deletes their account:
- Account is marked with `deletionStatus: 'pending'`
- `deleteAfter` timestamp is set to 24 hours from now
- User can still log in and cancel the deletion

**Endpoint**: `DELETE /api/account/delete`

**Response**:
```json
{
  "success": true,
  "message": "Account deletion scheduled",
  "deleteAfter": "2026-01-12T12:00:00.000Z",
  "gracePeriodHours": 24
}
```

### 2. Grace Period (24 hours)

During this time:
- User can still access their account
- User can cancel deletion via `POST /api/account/delete`
- No data is deleted yet

### 3. Cancel Deletion

Users can restore their account during the grace period.

**Endpoint**: `POST /api/account/delete`

**Response**:
```json
{
  "success": true,
  "message": "Account deletion cancelled successfully"
}
```

### 4. Automated Processing

After 24 hours, a cron job runs every 6 hours to process pending deletions:

**Cron Schedule**: `0 */6 * * *` (every 6 hours)
**Endpoint**: `GET /api/cron/process-deletions`

## What Gets Deleted

### Immediately Deleted:
- ✅ Private journal entries
- ✅ User personal data (email, name)
- ✅ User preferences and settings
- ✅ User moods collection
- ✅ User tags collection
- ✅ Firebase Authentication account

### Permanently Retained:
- ✅ **Published posts in the public feed**
- ✅ Post content, moods, tags
- ✅ "To:" field data

## Data Anonymization

When processing deletion:

1. **Published Posts**:
   - `userId` changed to `'[deleted]'`
   - `userDeleted: true` flag added
   - `userDeletedAt` timestamp added
   - **Content remains intact** for community

2. **User Document**:
   - `deletionStatus: 'completed'`
   - `deletedAt` timestamp
   - `email: '[deleted]'`
   - `name: '[deleted]'`

## Firestore Data Structure

### Before Deletion Request:
```javascript
users/{userId}: {
  email: "user@example.com",
  name: "John Doe",
  createdAt: Timestamp
}
```

### During Grace Period:
```javascript
users/{userId}: {
  email: "user@example.com",
  name: "John Doe",
  deletionScheduledAt: Timestamp,
  deleteAfter: Timestamp,
  deletionStatus: "pending"
}
```

### After Deletion:
```javascript
// User document (soft deleted)
users/{userId}: {
  email: "[deleted]",
  name: "[deleted]",
  deletionStatus: "completed",
  deletedAt: Timestamp
}

// Private entries - DELETED
entries/{userId}/entries/* - DELETED

// Published entries - KEPT
published_entries/{entryId}: {
  id: "abc123",
  userId: "[deleted]",  // Anonymized
  userDeleted: true,
  userDeletedAt: Timestamp,
  content: "Original post content...",
  moods: [...],
  tags: [...],
  publishedAt: Timestamp
}
```

## Environment Variables

Add to `.env.local`:
```bash
# Secret for authenticating cron job requests
CRON_SECRET=your-random-secret-here
```

## Vercel Cron Setup

The cron job is configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/process-deletions",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## Manual Testing

### Test Deletion Request:
```bash
curl -X DELETE http://localhost:3000/api/account/delete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Cancel Deletion:
```bash
curl -X POST http://localhost:3000/api/account/delete \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Cron Job (Local):
```bash
curl http://localhost:3000/api/cron/process-deletions \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Production Deployment

1. Set `CRON_SECRET` in Vercel environment variables
2. Deploy with `vercel.json` included
3. Vercel will automatically set up the cron job
4. Monitor in Vercel dashboard under "Crons"

## Benefits

1. **User Control**: 24-hour grace period prevents accidental deletions
2. **Community Preservation**: Published posts remain for others to read
3. **Privacy**: User data is anonymized but content stays
4. **Transparency**: Clear deletion status tracking
5. **Audit Trail**: Soft-deleted user records for compliance

## Future Enhancements

- Email notification before deletion completes
- Option to delete published posts too
- Export user data before deletion
- Different grace periods for different user types
