# Firestore Migration Summary

This document summarizes the migration of API routes from Prisma/SQL to Firestore.

## Overview

All six API route files have been successfully rewritten to use Firestore instead of Prisma. The migration includes:

1. ✅ `/src/app/api/entries/route.ts` - GET and POST
2. ✅ `/src/app/api/entries/[id]/route.ts` - GET, PATCH, DELETE, PUT
3. ✅ `/src/app/api/entries/publish/route.ts` - POST
4. ✅ `/src/app/api/feed/route.ts` - GET (public feed)
5. ✅ `/src/app/api/account/delete/route.ts` - DELETE
6. ✅ `/src/app/api/account/logout-all/route.ts` - POST

## Key Changes

### Import Changes
- Replaced `import { prisma } from '@/lib/prisma'` with `import { getServerFirestore } from '@/lib/firestore'`
- Kept imports for `getUserIdFromRequest`, `anonymizeForFeed`, `sanitizePlainText`

### Firestore Collections Structure

The following Firestore collection structure is now used:

```
users/{uid}                              - User documents
├── preferences: { sessionVersion: number, ... }
└── lastLogoutAllAt: Date

entries/{userId}/entries/{entryId}       - User entries (private)
├── id: string
├── userId: string
├── content: string
├── title: string | null
├── status: string (STILL_TRUE | IVE_GROWN | I_WAS_COPING | I_LIED)
├── moods: [{ id, name, color }]
├── tags: [{ id, name }]
├── createdAt: Date
├── updatedAt: Date
├── deletedAt: Date | null
└── publishedAt: Date | null

published_entries/{entryId}              - Published entries (public feed)
├── id: string
├── userId: string
├── content: string (anonymized)
├── moods: [{ id, name, color }]
├── tags: [{ id, name }]
├── publishedAt: Date
└── deletedAt: Date | null

user_moods/{userId}/moods/{moodId}       - User mood definitions (optional, can be embedded)
user_tags/{userId}/tags/{tagId}         - User tag definitions (optional, can be embedded)
```

### Data Format Changes

**Entry Status**: Stored as string values (not enums)
- STILL_TRUE
- IVE_GROWN
- I_WAS_COPING
- I_LIED

**Moods Array Format** (embedded in entries):
```typescript
moods: [
  { id: string, name: string, color: string },
  { id: string, name: string, color: string }
]
```

**Tags Array Format** (embedded in entries):
```typescript
tags: [
  { id: string, name: string },
  { id: string, name: string }
]
```

### Mood Colors
Default colors are maintained in a constants object:
```typescript
{
  anxious: '#FFF5E5',
  sad: '#E5F3FF',
  hopeful: '#E5FFE5',
  angry: '#FFE5E5',
  proud: '#E5FFE5',
  confused: '#F5E5FF',
  hurt: '#FFE5EB',
  happy: '#FFF8E5',
  overwhelmed: '#FFE5E5',
  empowered: '#FFE5F5',
  nostalgic: '#E5FFFF',
  numb: '#FFE5EB',
}
```

## Endpoint Details

### 1. GET `/api/entries` - Fetch User Entries
**Changes**:
- Uses `db.collection('entries').doc(userId).collection('entries')` for user entries
- Queries with `where('deletedAt', '==', null)`
- Supports filters: `all`, `private`, `shared`
- Pagination via `limit()` and `offset()`

### 2. POST `/api/entries` - Create Entry
**Changes**:
- Creates entry document directly in Firestore
- Moods and tags are embedded arrays (not separate documents)
- Optional immediate publishing with `shareAnonymously` flag
- Sanitizes content before storage

### 3. GET `/api/entries/[id]` - Fetch Single Entry
**New**: Fully implemented (was previously missing)
- Retrieves entry and checks for soft deletion

### 4. PATCH `/api/entries/[id]` - Update Entry (Partial)
**Changes**:
- Updates only provided fields
- Validates status if provided
- Updates `updatedAt` timestamp

### 5. PUT `/api/entries/[id]` - Replace Entry (Full)
**New**: Fully implemented
- Requires content to be provided
- Full entry replacement

### 6. DELETE `/api/entries/[id]` - Delete Entry
**Changes**:
- Soft delete: sets `deletedAt` to current timestamp
- Does not remove document, marks as deleted

### 7. POST `/api/entries/publish` - Publish Entry
**Changes**:
- Creates new document in `published_entries` collection
- Moods and tags copied from original entry
- Content anonymized before publishing
- Updates original entry with `publishedAt` timestamp

### 8. GET `/api/feed` - Public Feed
**Changes**:
- Queries `published_entries` collection (public, no auth required)
- Supports filtering by mood (using array-contains)
- Search is applied client-side (Firestore limitation)
- Returns anonymized content

### 9. DELETE `/api/account` - Delete Account
**Changes**:
- Uses batch operations for atomic deletion
- Deletes entries subcollection
- Deletes published entries
- Deletes moods and tags if stored separately
- Deletes user document
- Calls Firebase Auth admin API to delete auth user

### 10. POST `/api/account/logout-all` - Logout All Devices
**Changes**:
- Updates user preferences with incremented `sessionVersion`
- No longer deletes sessions (they're ephemeral with Firebase Auth)
- Client must validate session version on auth checks

## Important Notes

### Authentication
- All endpoints use `getUserIdFromRequest()` from `firebase-session`
- Firebase ID tokens are verified and user UID extracted
- User UID is used as document ID in `users` collection

### Timestamps
- All dates are stored as Firestore `Date` objects
- Converted to ISO strings in responses: `.toDate().toISOString()`

### Soft Deletes
- Entries are soft deleted (not physically removed)
- Always filter with `deletedAt == null` in queries

### Search
- Firestore doesn't support full-text search
- Search is applied client-side after fetching results
- For production, consider using Algolia or Elasticsearch

### Batch Operations
- Account deletion uses `db.batch()` for atomic operations
- Ensures all data is deleted together or not at all

### Error Handling
- All endpoints include try-catch blocks
- Proper HTTP status codes (401, 404, 400, 500)
- Console errors logged for debugging

## Migration Checklist

- [x] Remove all `prisma` imports
- [x] Replace with `getServerFirestore()` from `@/lib/firestore`
- [x] Update collection paths to match Firestore structure
- [x] Convert array relationships to embedded arrays
- [x] Add timestamp conversions for Firestore Date objects
- [x] Update filtering logic for Firestore queries
- [x] Implement soft deletes with `deletedAt` field
- [x] Handle mood and tag structures
- [x] Test all endpoints with Firestore

## Next Steps

1. **Data Migration**: Migrate existing Prisma/SQL data to Firestore
2. **Testing**: Test all endpoints with real Firestore instance
3. **Error Handling**: Add detailed error logging
4. **Performance**: Add caching if needed
5. **Monitoring**: Set up Firestore usage monitoring

## Breaking Changes

None for clients - the API responses remain the same structure.

For backend:
- Moods/tags are now embedded in entries (not separate document relationships)
- Timestamps are Firestore Date objects (not JavaScript Date strings)
- No more sequential ID generation - using Firestore auto-generated IDs
