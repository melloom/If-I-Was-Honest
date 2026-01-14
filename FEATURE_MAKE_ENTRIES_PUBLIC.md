# Feature: Make Private Entries Public

## Overview

This document describes the implementation of allowing users to make their private journal entries public, with the constraint that once public, entries cannot be reverted to private.

## Feature Requirements

✅ **Allow private entries to be made public**
- Users can publish private entries to the anonymous feed
- Publishing is a one-way operation (irreversible)

✅ **Once public, entries cannot be reverted to private**
- The system prevents re-publishing of already published entries
- Users receive a clear warning before publishing

✅ **Private entries remain editable after creation**
- Users can edit entries before publishing
- Users can edit entries even after publishing

## Implementation Details

### Database Schema

Entries in Firestore have the following key fields:

```typescript
// User's private entries collection: /entries/{userId}/entries/{entryId}
{
  id: string              // Entry ID
  content: string         // Entry content
  title?: string          // Optional title
  status: string          // Entry status (STILL_TRUE, IVE_GROWN, etc.)
  moods: Mood[]          // Mood tags
  tags: Tag[]            // Custom tags
  to?: string            // Optional "to" field
  from?: string          // Optional "from" field
  createdAt: Timestamp   // Creation timestamp
  updatedAt: Timestamp   // Last update timestamp
  publishedAt?: Timestamp // When published (null = private)
  deletedAt?: Timestamp   // Soft delete timestamp
}

// Published entries collection: /published_entries/{entryId}
{
  id: string              // Published entry ID
  userId: string          // Owner user ID (for ownership verification)
  content: string         // Anonymized content
  moods: Mood[]          // Mood tags
  tags: Tag[]            // Custom tags
  publishedAt: Timestamp  // Publication timestamp
  deletedAt?: Timestamp   // Soft delete timestamp
}
```

### API Endpoints

#### `POST /api/entries/publish`

Publishes a private entry to the public feed.

**Request:**
```json
{
  "entryId": "entry-id",
  "moods": ["anxious", "sad"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "publishedEntry": {
    "id": "published-entry-id",
    "publishedAt": "2024-01-16T10:00:00Z"
  }
}
```

**Error: Entry Already Published (400):**
```json
{
  "error": "Entry already published"
}
```

**Logic:**
1. Verify the entry belongs to the authenticated user
2. Check if the entry is soft deleted
3. **Check if already published** - Return error if `publishedAt` is set
4. Create a published entry with anonymized content
5. Update the original entry with `publishedAt` timestamp

#### `PATCH /api/entries/{id}`

Updates an entry. Supports editing both private and published entries.

**Request:**
```json
{
  "content": "Updated content",
  "title": "Updated title",
  "status": "IVE_GROWN"
}
```

**Behavior:**
- Allows updating entry content, title, and status
- If the entry is published (`publishedAt` is set), also updates the published copy
- Maintains ownership verification for security

### Frontend Components

#### Dashboard (`src/app/dashboard/DashboardClient.tsx`)

**Make Public Button:**
- Located in the entry actions bar
- Only shown for private entries: `{!entry.isPublished && (<button>...)}`
- Styled with blue background (#e5f3ff) and share icon
- Triggers `handlePublishEntry()` when clicked

**Publishing Flow:**
1. User clicks "Make Public" button
2. If confirmation setting enabled, shows confirmation modal
3. Modal displays warning: "⚠️ Once public, this entry cannot be made private again."
4. User confirms by clicking "Make Public"
5. `executePublish()` calls `POST /api/entries/publish`
6. Real-time listener automatically updates UI

**Confirmation Modal:**
```tsx
{publishConfirmModal?.show && (
  <div>
    <div className="text-xl font-semibold">Make Entry Public?</div>
    <div className="text-sm leading-relaxed space-y-2">
      <p>This will share your entry anonymously on the public feed...</p>
      <p className="font-semibold">
        ⚠️ Once public, this entry cannot be made private again.
      </p>
      <p className="text-xs">
        You can still edit the content after publishing...
      </p>
    </div>
  </div>
)}
```

**Entry Type Definition:**
```typescript
interface Entry {
  id: string
  content: string
  title: string | null
  status: string              // Entry status
  createdAt: string
  updatedAt: string
  isPublished: boolean        // true if published
  publishedAt?: string | null // Publication timestamp
  to?: string | null
  from?: string | null
  moods: Array<{id, name, color}>
  tags: Array<{id, name}>
}
```

#### Feed (`src/app/feed/FeedClient.tsx`)

- Displays published entries fetched from `GET /api/feed`
- Shows mood tags and timestamps
- Entries are fully anonymized (no user ID shown)

## Security Considerations

### Ownership Verification
- All publish requests verify the entry belongs to the authenticated user
- Published entries store `userId` for verification on updates
- Updates to published entries verify ownership in both collections

### Anonymization
- Published entries use `anonymizeForFeed()` to remove user identification
- User email, IDs, and private metadata are never exposed
- Only content, title, and moods are published

### Data Immutability
- Once published, entries cannot be made private again
- System enforces this with `if (entryData?.publishedAt)` check
- Error returned if user attempts to republish

## User Experience

### Private Entry States

**Before Publishing:**
```
[Private Entry Card]
├─ Edit button (in modal)
├─ Make Public button ← Visible
└─ Delete button
```

**After Publishing:**
```
[Published Entry Card]
├─ 24-hour deletion window (if within 24h)
├─ Edit button disabled (can still edit via modal)
└─ Delete button
```

### Editing Behavior

1. **Private entries:** Can be edited anytime
2. **Published entries:** 
   - Can still be edited
   - Changes automatically propagate to public feed
   - Status, title, and content can be modified

### Deletion Rules

- **Private entries:** Can be deleted anytime (soft delete)
- **Published entries:** Can only be deleted within 24 hours
- **Permanent delete:** Uses 1 of 50 lifetime permanent deletes

## Testing Checklist

- [ ] Create a private entry
- [ ] Verify "Make Public" button appears
- [ ] Click "Make Public" and see confirmation modal
- [ ] Confirm the modal shows the warning about irreversibility
- [ ] Publish the entry
- [ ] Verify the button changes (no longer shows "Make Public")
- [ ] Check that entry appears in the public feed
- [ ] Edit the published entry
- [ ] Verify changes appear in the public feed
- [ ] Try to publish again (should show error)
- [ ] Delete the published entry (within 24 hours)
- [ ] Attempt permanent delete after 24 hours

## Related Files

- [src/app/api/entries/publish/route.ts](src/app/api/entries/publish/route.ts) - Publish endpoint
- [src/app/api/entries/\[id\]/route.ts](src/app/api/entries/[id]/route.ts) - Update endpoint
- [src/app/dashboard/DashboardClient.tsx](src/app/dashboard/DashboardClient.tsx) - Dashboard UI
- [src/app/feed/FeedClient.tsx](src/app/feed/FeedClient.tsx) - Public feed UI
- [src/lib/useRealtimeEntries.ts](src/lib/useRealtimeEntries.ts) - Real-time data fetching

## Future Enhancements

- [ ] Add "Shared" filter to dashboard to show only published entries
- [ ] Add batch publish for multiple entries
- [ ] Add scheduling for future publication
- [ ] Add unpublish grace period (e.g., 1 hour)
- [ ] Add analytics showing how many times an entry was viewed
- [ ] Allow users to control how long they want the entry published
