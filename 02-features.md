# Features

## MVP Features

### 1. Authentication
**Description**: Secure user authentication with privacy-focused options.

**Behavior**:
- Email + password registration
- Magic link authentication (passwordless option)
- Email verification required before first entry creation
- Session management (JWT or similar)
- "Remember me" option (30-day session)
- Password reset via email
- Account deletion flow (cascades to entries)

**Edge Cases**:
- User registers but never verifies email → Show reminder banner, don't send spam
- User requests password reset but account doesn't exist → Show generic "if account exists" message (don't leak info)
- Magic link expires → Allow regeneration, show expiration time
- User logs in from new device → Option to notify via email (opt-in)
- Session expires mid-write → Auto-save draft, require re-auth on publish

**Acceptance Criteria**:
- [ ] User can register with email + password
- [ ] User can login with magic link
- [ ] Email verification required before app access
- [ ] Password reset works within 5 minutes
- [ ] Session persists for 30 days with "remember me"
- [ ] Account deletion removes all user data within 24 hours

---

### 2. Create/Edit/Delete Private Entries
**Description**: Core journaling functionality with rich text support.

**Behavior**:
- Rich text editor (bold, italic, headings, lists)
- Auto-save every 30 seconds (draft storage)
- Entry timestamp (created, last modified)
- Character count (optional, can be hidden in settings)
- Delete with confirmation ("This cannot be undone")
- Edit history (optional, shows last 3 versions)

**Edge Cases**:
- User writes entry but closes tab before save → Draft recovered on return
- User edits published entry → Only updates private version, published version stays frozen
- User deletes entry that was published → Unpublishes automatically, shows warning
- Entry too long (10,000+ chars) → Warn but allow, suggest breaking into multiple
- Network offline → Queue saves, sync when back online
- Multiple tabs open → Last write wins, show conflict warning if needed

**Acceptance Criteria**:
- [ ] User can create entry with rich text
- [ ] Auto-save works reliably
- [ ] Draft recovery on page reload
- [ ] Delete requires confirmation
- [ ] Published entries can't be edited (only private version)
- [ ] Works offline (queue + sync)

---

### 3. Tagging System
**Description**: Mood tags + custom tags for organization and filtering.

**Behavior**:
- **Mood Tags** (pre-defined, multi-select):
  - anxious, calm, angry, sad, happy, grateful, confused, excited, lonely, content, overwhelmed, peaceful
  - Visual: Color-coded dots (subtle, not bright)
- **Custom Tags** (user-defined, unlimited):
  - Auto-complete from existing tags
  - Tag suggestions based on entry content (optional)
  - Tag management page (rename, merge, delete)
- Tags appear below entry title
- Tags are filterable in search

**Edge Cases**:
- User creates tag "work" then later creates "Work" → Normalize to lowercase, merge
- User deletes tag that's used in 50 entries → Show usage count, offer merge option
- User adds 20+ tags to one entry → Allow but suggest organization
- Tag name with special characters → Sanitize, allow hyphens/underscores
- Empty tags → Prevent creation, trim whitespace

**Acceptance Criteria**:
- [ ] User can select multiple mood tags
- [ ] User can create unlimited custom tags
- [ ] Auto-complete works for custom tags
- [ ] Tags are filterable in search
- [ ] Tag management allows rename/merge/delete
- [ ] Tags normalize (case-insensitive matching)

---

### 4. Entry Status Toggles
**Description**: Reflection-focused status system that can change over time.

**Behavior**:
- Four status options (radio buttons, single select):
  1. **"Still true"** (default) - This still reflects how I feel
  2. **"I've grown"** - I've moved past this
  3. **"I was coping"** - This was a survival mechanism I understand now
  4. **"I lied to myself"** - I see the self-deception now
- Status can be changed anytime
- Status history (optional, shows last 3 changes with timestamps)
- Status appears as subtle badge next to entry in list
- Status is filterable in search

**Edge Cases**:
- User sets status but never changes it → That's fine, not required
- User changes status 10 times → Allow, track history (last 3)
- Status shown in public feed? → No, status is private only
- Entry has no status → Default to "Still true"

**Acceptance Criteria**:
- [ ] User can set one status per entry
- [ ] Status can be changed anytime
- [ ] Status appears in entry list view
- [ ] Status is filterable in search
- [ ] Status history shows last 3 changes
- [ ] Status never appears in public feed

---

### 5. Search + Filters
**Description**: Powerful search and filtering system for personal entries.

**Behavior**:
- **Full-text search**: Search within entry content, titles, tags
- **Date range filter**: Calendar picker, presets (last week, month, year, all time)
- **Mood filter**: Multi-select mood tags
- **Status filter**: Multi-select status options
- **Custom tag filter**: Multi-select or type-ahead
- **Sort options**: Date (newest/oldest), modified date, alphabetical
- Search results highlight matches
- Save search queries (optional, "Save this search")
- Clear all filters button

**Edge Cases**:
- User searches for term that appears in 500 entries → Paginate results (20 per page)
- User applies 5 filters and gets 0 results → Show helpful message, suggest removing filters
- Search term too short (< 2 chars) → Show warning, still allow but may be slow
- User searches while offline → Search local cached entries only
- Date range invalid (end before start) → Auto-correct or show error

**Acceptance Criteria**:
- [ ] Full-text search works across all entry fields
- [ ] All filters work independently and together
- [ ] Search results paginate correctly
- [ ] Empty results show helpful message
- [ ] Search highlights matches
- [ ] Filters persist in URL (shareable search links)

---

### 6. Publish Anonymously Flow
**Description**: One-way, deliberate publishing with clear warnings.

**Behavior**:
- **Publish button** on entry detail page (only for private entries)
- **Confirmation modal** with:
  - Warning: "This will make your entry public and anonymous"
  - Checkbox: "I understand this cannot be undone" (or "I understand this is irreversible after 24 hours")
  - Option: "Delay publish by [X hours/days]" (optional)
  - Preview: How entry will appear in public feed
- After publish:
  - Entry removed from private list (or marked "Published" with link to public version)
  - Entry appears in public feed immediately (or after delay)
  - User can "Unpublish" within 24-hour grace period (if enabled)
- Published entries are completely anonymous:
  - No username, email, or identifying info
  - No connection back to original entry
  - Random ID like "honest-7k3j9x"

**Edge Cases**:
- User publishes but immediately regrets → Grace period allows unpublish within 24h
- User publishes entry with identifying details → Admin review flag, warn before publish
- User tries to publish same entry twice → Prevent (entry already published)
- Network error during publish → Retry button, don't mark as published until confirmed
- User deletes original entry after publishing → Published version stays (no connection)

**Acceptance Criteria**:
- [ ] Publish requires explicit confirmation
- [ ] Warning is clear and prominent
- [ ] Published entry is fully anonymous
- [ ] Grace period unpublish works (if enabled)
- [ ] Published entry appears in public feed
- [ ] Original entry marked as published in private list

---

### 7. Public Anonymous Feed
**Description**: Read-only feed of published entries with no engagement.

**Behavior**:
- **Feed page**: Chronological list of published entries (newest first)
- **No engagement UI**: No like buttons, no comments, no share buttons
- **Entry display**:
  - Entry content (full text)
  - Timestamp (relative: "2 days ago")
  - Mood tags only (no custom tags, no status)
  - Anonymous ID: "honest-7k3j9x"
- **Pagination**: Load more / infinite scroll (20 per page)
- **Filter options** (optional):
  - Date range
  - Mood tags
  - Search within feed
- **Report button**: Small, unobtrusive, below each entry
- **Refresh button**: Manual refresh (no auto-update)

**Edge Cases**:
- Feed has 0 entries → Show message: "No entries yet. Be the first to share your truth."
- Entry is reported and removed → Show generic "This entry is no longer available"
- User scrolls through 1000 entries → Paginate, cache recent entries
- Entry contains triggering content → Admin review, content warning overlay (optional)
- User tries to interact (right-click, etc.) → No interaction possible

**Acceptance Criteria**:
- [ ] Feed shows published entries chronologically
- [ ] No like/comment/share buttons
- [ ] Entries are fully anonymous
- [ ] Report button works
- [ ] Pagination works smoothly
- [ ] Feed is read-only (no editing)

---

### 8. Report Content
**Description**: Abuse prevention through user reporting.

**Behavior**:
- **Report button** on each published entry (small, below entry)
- **Report modal** with:
  - Reason dropdown: "Spam", "Hateful content", "Self-harm", "Illegal content", "Other"
  - Optional text field for details
  - Submit button
- After submit:
  - Thank you message: "Thank you for helping keep this space safe"
  - Entry may be hidden immediately if multiple reports
  - Admin review queue
- User can report their own published entry (to request removal)

**Edge Cases**:
- User reports same entry 5 times → Prevent duplicate reports, show "Already reported"
- Entry gets 3+ reports → Auto-hide pending review
- False reports → Admin can restore entry
- User reports private entry → Not possible (report only on published)

**Acceptance Criteria**:
- [ ] Report button on all published entries
- [ ] Report modal has clear reasons
- [ ] Report submission works reliably
- [ ] Multiple reports trigger auto-hide
- [ ] Admin can review reports

---

### 9. Settings
**Description**: User preferences and account management.

**Behavior**:
- **Account**:
  - Change email
  - Change password
  - Delete account (with confirmation, cascades to entries)
- **Privacy**:
  - Auto-save drafts (on/off)
  - Email notifications (on/off, what types)
  - Data export (download all data as JSON)
- **Appearance**:
  - Theme (light/dark/auto)
  - Font size (small/medium/large)
  - Show character count (on/off)
- **Data**:
  - Export all data (JSON format, includes entries, tags, settings)
  - Delete all entries (with confirmation)
  - Delete account (nuclear option)

**Edge Cases**:
- User exports data but file is 50MB → Stream download, show progress
- User deletes account but has published entries → Published entries stay (already anonymous)
- User changes email but new email is taken → Show error, don't change
- Settings don't save → Show error, retry button

**Acceptance Criteria**:
- [ ] All settings save reliably
- [ ] Data export includes all user data
- [ ] Account deletion works and confirms
- [ ] Email change requires verification
- [ ] Settings persist across devices

---

## V1 Features (Post-MVP)

### 1. Time-Lock Entries
**Description**: Entries that unlock after a specified date.

**Behavior**:
- Option when creating entry: "Lock until [date]"
- Entry is hidden until date
- User can see locked entry in list but can't open it
- Date arrives → Entry unlocks automatically
- Use case: Write to future self, process difficult thoughts after time passes

**Edge Cases**:
- User sets lock date in past → Unlock immediately
- User deletes entry before unlock → Delete immediately
- Multiple time-locked entries unlock same day → Show notification

---

### 2. Cooldown Timer Before Reread
**Description**: Gentle nudge to prevent obsessive re-reading.

**Behavior**:
- Option in settings: "Enable cooldown timer"
- When user opens entry, shows: "You last read this [X time] ago. Consider waiting [Y time] before reading again."
- Timer is suggestion only (user can dismiss)
- Use case: Help users break cycles of re-reading painful entries

**Edge Cases**:
- User disables timer → Respect setting
- Entry is new (never read) → No cooldown
- User edits entry → Reset cooldown (editing is different from re-reading)

---

### 3. Random Old Entry Resurfacer
**Description**: Gentle reminder of past entries to encourage reflection.

**Behavior**:
- Optional feature: "Resurface old entries"
- Randomly selects entry from 30+ days ago
- Shows as subtle notification/banner: "A thought from [X time] ago"
- User can click to view or dismiss
- Frequency: Once per week (configurable)
- Use case: Help users see growth, remember past insights

**Edge Cases**:
- No entries older than 30 days → Don't show
- User dismisses → Don't show again for 7 days
- User marks entry "I've grown" after resurface → That's the goal!

---

### 4. Encryption / Privacy Vault Mode
**Description**: Client-side encryption for maximum privacy.

**Behavior**:
- Premium feature: "Privacy Vault"
- All entries encrypted client-side before sending to server
- User sets encryption key (never stored on server)
- If key lost, data is unrecoverable (clear warning)
- Use case: Maximum privacy for sensitive entries

**Edge Cases**:
- User forgets key → Data lost (by design)
- User wants to export encrypted data → Export encrypted, need key to decrypt
- Search doesn't work on encrypted entries → Search locally only after decrypt

---

### 5. AI Reflection Summaries (Optional, Opt-In)
**Description**: AI-generated insights without judgment.

**Behavior**:
- Opt-in feature: "Enable reflection summaries"
- AI analyzes entries (on-device or encrypted) and provides:
  - Mood patterns over time
  - Common themes
  - Growth indicators
  - No judgment, just observations
- User can dismiss or save summary
- Use case: Help users see patterns they might miss

**Edge Cases**:
- User opts out → No AI processing
- AI summary is triggering → User can dismiss, never show again
- Summary is inaccurate → User feedback, improve model

---

### 6. Streaks (Non-Gamified)
**Description**: Gentle reminders without pressure.

**Behavior**:
- Optional: "Writing reminders"
- If user hasn't written in 3 days, gentle email: "Your thoughts are welcome whenever you're ready"
- No "5-day streak!" notifications
- No badges or achievements
- User can disable reminders
- Use case: Encourage habit without pressure

**Edge Cases**:
- User writes daily → No reminders needed
- User disables reminders → Respect setting
- User writes but doesn't publish → Still counts (writing is the goal)

---

## Feature Prioritization

### MVP Must-Haves (Weeks 1-4)
1. Auth
2. Create/edit/delete entries
3. Tagging
4. Status toggles
5. Search/filters
6. Publish flow
7. Public feed
8. Report
9. Settings

### V1 Nice-to-Haves (Weeks 5-8)
1. Time-lock entries
2. Cooldown timer
3. Random resurfacer
4. Encryption vault
5. AI summaries
6. Gentle streaks

### Future Considerations
- Mobile apps (React Native)
- Desktop app (Electron)
- Browser extensions
- Integrations (export to Day One, etc.)
- Group journals (private shared journals)

