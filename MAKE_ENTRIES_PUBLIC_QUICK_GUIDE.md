# Quick Reference: Making Entries Public

## User Flow

### Step 1: Create Entry
User creates a new entry in the Dashboard and chooses to keep it private (default).

### Step 2: Make Public
Later, user can make the entry public by:
1. Viewing the entry in the Dashboard
2. Clicking the **"Make Public"** button (blue button with share icon)
3. Confirming in the modal that appears

### Step 3: Entry is Published
Once confirmed:
- Entry appears in the public feed (anonymously)
- "Make Public" button disappears
- Entry can still be edited
- Entry can still be deleted (within 24 hours)

### Step 4: Forever Public
Once published:
- ✅ Entry can be **edited** anytime
- ❌ Entry **cannot be made private** again
- ⏰ Entry can be **deleted** within 24 hours only
- 🔄 Entry becomes **permanent** after 24 hours

## Code Architecture

### Data Flow

```
User Dashboard
    ↓
Click "Make Public" button
    ↓
Show confirmation modal with warning
    ↓
User confirms
    ↓
POST /api/entries/publish
    ↓
Backend:
  1. Verify entry belongs to user
  2. Check if already published (prevent re-publish)
  3. Create published_entries record
  4. Update entry with publishedAt timestamp
    ↓
Real-time listener updates UI
    ↓
Entry appears in public feed
```

### Key Files & Functions

| File | Function | Purpose |
|------|----------|---------|
| `src/app/api/entries/publish/route.ts` | `POST /api/entries/publish` | Publishes entry |
| `src/app/api/entries/[id]/route.ts` | `PATCH /api/entries/{id}` | Edits entry |
| `src/app/dashboard/DashboardClient.tsx` | `handlePublishEntry()` | Initiates publish flow |
| `src/app/dashboard/DashboardClient.tsx` | `executePublish()` | Calls API |
| `src/app/feed/FeedClient.tsx` | - | Displays published entries |

### Prevent Re-Publishing

```typescript
// In /api/entries/publish/route.ts
if (entryData?.publishedAt) {
  return NextResponse.json(
    { error: 'Entry already published' },
    { status: 400 }
  )
}
```

This check prevents the same entry from being published twice.

## Configuration

Users can control confirmation behavior in settings:

```typescript
settings.shareConfirmation // Show warning modal before publishing?
```

If disabled, entries publish immediately without confirmation.

## Troubleshooting

### "Make Public" button not showing
- ✅ Entry must be private (`isPublished === false`)
- ✅ Entry must not be soft deleted (`deletedAt === null`)
- ✅ User must own the entry

### Can't edit published entry
- Published entries CAN be edited
- Updates propagate to the public feed
- Edit via the Dashboard modal

### Want to unpublish?
- ❌ Once public, entries **cannot be unpublished**
- ⏰ Within 24 hours: Delete the entry (soft delete)
- 📌 After 24 hours: Entry is permanent

## FAQ

**Q: Can users change their mind after publishing?**
A: No. Once public, the entry is permanent. They can only delete it within 24 hours.

**Q: Can users edit after publishing?**
A: Yes. All edits are reflected in the public feed.

**Q: Can admins unpublish entries?**
A: Not through this feature. Admin control would be a separate system.

**Q: What happens to comments/reactions?**
A: Not yet implemented. This feature focuses on the publish/edit flow.

**Q: Can users see who published their entry?**
A: No. The feed shows anonymous entries only.
