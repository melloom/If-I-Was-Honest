# UX / Screens

## Design Principles

1. **Minimal and Calm**: Neutral palette, ample whitespace, typography-focused
2. **Private-First**: No public metrics, no social indicators
3. **Accessible**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
4. **Fast**: < 2s load time, optimistic UI updates
5. **Mobile-First**: Responsive design, touch-friendly targets (44x44px minimum)

## Color Palette

- **Primary**: Soft blue-gray (#6B7C93) - Trust, calm
- **Background**: Off-white (#FAFAFA) light mode, Dark gray (#1A1A1A) dark mode
- **Text**: Charcoal (#2C2C2C) light mode, Off-white (#E8E8E8) dark mode
- **Accent**: Muted green (#7A9B7A) - Growth, peace (used sparingly)
- **Mood Tags**: Subtle pastels (not bright)
- **Error**: Soft red (#C17A7A)
- **Success**: Soft green (#7A9B7A)

## Typography

- **Headings**: System font stack (San Francisco, Segoe UI, etc.)
- **Body**: System font, 16px base, 1.6 line height
- **Entry Text**: 18px for readability, serif optional
- **Monospace**: For timestamps, IDs

---

## Screen 1: Onboarding

### Purpose
Welcome new users, explain the app's philosophy, set expectations.

### Layout
- **Full-screen modal** (can't skip initially, but dismissible after first visit)
- **3-4 slides** with navigation dots
- **Skip button** (top right, only after first slide)

### Slide 1: Welcome
- **Headline**: "If I Was Honest"
- **Subheadline**: "A private space for your most honest thoughts"
- **Body text**: "Write freely. Reflect honestly. Share only when you're ready. No likes, no comments, no judgment."
- **Illustration**: Simple line drawing (journal/open book, subtle)

### Slide 2: Private First
- **Headline**: "Everything starts private"
- **Body text**: "Your entries are yours alone. Tag them, search them, reflect on them. Publish only when you choose."
- **Illustration**: Lock icon or private space

### Slide 3: Growth Through Reflection
- **Headline**: "See how you've grown"
- **Body text**: "Mark entries as 'Still true' or 'I've grown'. Your journal becomes a map of your journey."
- **Illustration**: Timeline or growth path

### Slide 4: Optional Sharing
- **Headline**: "Share when you're ready"
- **Body text**: "Publish anonymously to our public feed. Read others' honest thoughts. No engagement, just honesty."
- **Illustration**: Anonymous silhouette

### Buttons
- **Primary**: "Get Started" (last slide) → Goes to registration
- **Secondary**: "Skip" (top right, all slides)
- **Navigation**: Dots at bottom (tap to jump)

### States
- **Empty**: N/A
- **Error**: N/A
- **Loading**: N/A

### Microcopy Tone
- Warm, encouraging, non-pressuring
- Short sentences
- No exclamation points (calm)

---

## Screen 2: Login / Registration

### Purpose
Authenticate users with email/password or magic link.

### Layout (Split Screen)
- **Left side (desktop)**: Branding, tagline
- **Right side**: Login form
- **Mobile**: Stacked, form on top

### Registration Form
- **Email field**: Text input, validation on blur
- **Password field**: Show/hide toggle, strength indicator (subtle)
- **Magic link option**: "Or sign in with magic link" (link below form)
- **Submit button**: "Create Account" (primary)
- **Login link**: "Already have an account? Sign in" (bottom)

### Login Form
- **Email field**: Text input
- **Password field**: Show/hide toggle
- **Remember me**: Checkbox (30-day session)
- **Forgot password**: Link below password field
- **Submit button**: "Sign In" (primary)
- **Magic link option**: "Or sign in with magic link" (link)
- **Registration link**: "Don't have an account? Sign up" (bottom)

### Magic Link Flow
- **Email field**: Text input
- **Submit button**: "Send Magic Link"
- **Success state**: "Check your email! We sent a link to [email]. It expires in 10 minutes."
- **Resend option**: "Didn't receive it? Resend" (after 60s)

### States
- **Empty**: Placeholder text in fields
- **Error**: Inline error messages (red, below field)
  - "Email is required"
  - "Invalid email format"
  - "Password must be at least 8 characters"
  - "Incorrect email or password" (don't specify which)
- **Loading**: Button shows spinner, disabled state
- **Success**: Redirect to email verification page

### Validation
- **Email**: Valid format, required
- **Password**: Min 8 chars, required
- **Real-time**: Validate on blur, show errors immediately

### Microcopy Tone
- Clear, direct
- Helpful error messages
- No jargon

---

## Screen 3: Home (Private Entries List)

### Purpose
Main dashboard showing user's private entries.

### Layout
- **Header**: 
  - App name/logo (left)
  - Search icon (right)
  - Profile/settings icon (right)
- **Toolbar**:
  - "New Entry" button (primary, prominent)
  - Filter button (shows active filter count)
  - Sort dropdown (Date, Modified, Title)
- **Entry List**:
  - Each entry card shows:
    - Title (or first 50 chars if no title)
    - Preview (first 100 chars, truncated)
    - Mood tags (small dots/badges)
    - Status badge (subtle, colored dot)
    - Timestamp (relative: "2 hours ago")
    - "Published" badge if entry is published
  - Cards are tappable → Open entry detail
  - Swipe actions (mobile): Delete, Edit, Publish
- **Empty State**:
  - Illustration (empty journal)
  - Headline: "Your honest thoughts start here"
  - Body: "Tap 'New Entry' to write your first entry."
  - "New Entry" button (primary)

### Filters (Drawer/Modal)
- **Date range**: Calendar picker
- **Mood tags**: Multi-select chips
- **Status**: Multi-select radio buttons
- **Custom tags**: Type-ahead input
- **Clear all** button
- **Apply** button (mobile) / Auto-apply (desktop)

### States
- **Empty**: Empty state shown
- **Loading**: Skeleton cards (3-4)
- **Error**: "Something went wrong. Try again." (retry button)
- **No results**: "No entries match your filters. Clear filters to see all entries."

### Pagination
- Infinite scroll (mobile) or "Load More" button (desktop)
- 20 entries per page

### Microcopy Tone
- Minimal labels
- Timestamps are human-readable
- No pressure ("when you're ready" language)

---

## Screen 4: Entry Editor

### Purpose
Create or edit private entries with rich text.

### Layout
- **Header**:
  - "Cancel" button (left)
  - "Save" or "Publish" button (right, primary)
  - Auto-save indicator (subtle, "Saved" or "Saving...")
- **Editor**:
  - Title field (optional, placeholder: "Untitled Entry")
  - Rich text editor (toolbar: Bold, Italic, H1, H2, List, Link)
  - Character count (optional, can hide in settings)
  - Placeholder: "What's on your mind?"
- **Metadata Panel** (collapsible):
  - Mood tags selector (multi-select chips)
  - Custom tags input (type-ahead)
  - Status selector (radio buttons)
  - Created/modified timestamps

### Toolbar (Rich Text)
- Bold, Italic, H1, H2, Bullet List, Numbered List, Link
- Simple, not overwhelming
- Active states show current formatting

### Auto-Save
- Indicator shows "Saved" (green check) or "Saving..." (spinner)
- Saves every 30 seconds or on blur
- Draft recovery on page reload

### States
- **Empty**: Placeholder text, "New Entry" in header
- **Draft**: Loads existing draft, shows "Draft" badge
- **Editing**: Loads existing entry, shows "Editing" in header
- **Saving**: Disable save button, show spinner
- **Saved**: Show checkmark, enable publish
- **Error**: "Couldn't save. Check your connection." (retry button)
- **Offline**: "Working offline. Changes will sync when you're back online."

### Validation
- Entry must have content (at least 10 chars)
- Title optional but recommended

### Microcopy Tone
- Encouraging placeholder
- Clear save states
- No word count pressure

---

## Screen 5: Entry Detail

### Purpose
View full entry with all metadata, edit, or publish.

### Layout
- **Header**:
  - Back button (left)
  - "Edit" button (right, if private)
  - "Publish" button (right, if private, prominent)
  - "..." menu (more options: Delete, Export)
- **Content**:
  - Title (or "Untitled Entry")
  - Full entry text (readable formatting)
  - Mood tags (badges)
  - Custom tags (badges)
  - Status badge (colored, with label)
  - Timestamps (Created: [date], Modified: [date])
  - "Published" indicator if published (with link to public version)
- **Actions** (bottom, if private):
  - "Edit" button
  - "Publish Anonymously" button (primary)
  - "Delete" button (danger, bottom)

### Published Entry View
- Shows same content
- "Published" badge at top
- "View in Public Feed" link
- "Unpublish" button (if within grace period)
- No edit/delete options (published entries are frozen)

### States
- **Loading**: Skeleton text
- **Error**: "Entry not found" or "Couldn't load entry"
- **Deleted**: Redirect to home with toast "Entry deleted"

### Microcopy Tone
- Respectful of content
- Clear action labels
- No judgmental language

---

## Screen 6: Publish Flow

### Purpose
Confirm and execute anonymous publishing with clear warnings.

### Step 1: Publish Modal
- **Headline**: "Publish Anonymously?"
- **Warning Box** (yellow/amber background):
  - "This will make your entry public and completely anonymous."
  - "Once published, you cannot edit or delete the published version."
  - "Your identity will never be connected to this entry."
- **Preview**: How entry will appear (title, content, mood tags only)
- **Options**:
  - Checkbox: "I understand this cannot be undone" (required)
  - Optional: "Delay publish by [X hours/days]" (dropdown)
- **Buttons**:
  - "Cancel" (secondary)
  - "Publish Now" or "Schedule Publish" (primary, red/danger if irreversible)

### Step 2: Confirmation (If Grace Period Enabled)
- **Headline**: "Published!"
- **Message**: "Your entry is now public. You have 24 hours to unpublish if you change your mind."
- **Button**: "View in Public Feed" or "Done"

### Step 2 Alternative (If No Grace Period)
- **Headline**: "Published!"
- **Message**: "Your entry is now public and anonymous. It cannot be undone."
- **Button**: "View in Public Feed" or "Done"

### States
- **Publishing**: Show spinner, disable buttons
- **Error**: "Couldn't publish. Try again." (retry button)
- **Success**: Confirmation screen

### Microcopy Tone
- Clear warnings
- No pressure
- Respectful of user's choice

---

## Screen 7: Public Feed

### Purpose
Read-only feed of anonymous published entries.

### Layout
- **Header**: 
  - "Public Feed" title
  - Filter button (optional)
  - Refresh button
- **Feed**:
  - Chronological list (newest first)
  - Each entry card:
    - Entry content (full text)
    - Mood tags (badges)
    - Relative timestamp ("2 days ago")
    - Anonymous ID ("honest-7k3j9x") - small, subtle
    - Report button (small, bottom right)
  - No like/comment/share buttons
- **Empty State**:
  - "No entries yet."
  - "Be the first to share your truth."

### Filters (Optional Drawer)
- Date range
- Mood tags
- Search within feed

### Pagination
- Infinite scroll or "Load More" (20 per page)

### States
- **Loading**: Skeleton cards
- **Empty**: Empty state message
- **Error**: "Couldn't load feed. Try again." (retry)

### Microcopy Tone
- Respectful of content
- No engagement prompts
- Minimal UI

---

## Screen 8: Search/Filter UI

### Purpose
Powerful search and filtering for private entries.

### Layout (Modal/Drawer)
- **Search Bar**: 
  - Text input with search icon
  - Clear button (X) when text entered
  - Real-time results as you type
- **Filters Section**:
  - **Date Range**: Calendar picker or presets (Last week, Month, Year, All time)
  - **Mood Tags**: Multi-select chips (scrollable)
  - **Status**: Multi-select radio buttons
  - **Custom Tags**: Type-ahead input with suggestions
- **Active Filters**:
  - Chips showing active filters
  - X to remove individual filter
  - "Clear All" button
- **Results Count**: "X entries found"
- **Sort Options**: Dropdown (Date, Modified, Title, A-Z)

### Search Results
- List of matching entries (same card style as home)
- Highlighted search terms
- "No results" state with suggestions

### States
- **Empty**: Show all entries, no filters applied
- **Searching**: Show spinner or "Searching..."
- **No Results**: "No entries match your search. Try different terms or clear filters."

### Microcopy Tone
- Clear filter labels
- Helpful empty states
- No pressure

---

## Screen 9: Settings

### Purpose
User preferences, account management, data export.

### Layout
- **Sections** (accordion or list):
  1. **Account**
     - Email (with change button)
     - Password (with change button)
     - Delete account (danger, bottom)
  2. **Privacy**
     - Auto-save drafts (toggle)
     - Email notifications (toggle + sub-options)
     - Data export (button: "Download All Data")
  3. **Appearance**
     - Theme (Light / Dark / Auto) - radio buttons
     - Font size (Small / Medium / Large) - radio buttons
     - Show character count (toggle)
  4. **Data**
     - Export all data (button)
     - Delete all entries (button, danger)
     - Delete account (button, danger, with confirmation)

### Account Deletion Flow
- **Warning Modal**:
  - Headline: "Delete Account?"
  - Body: "This will permanently delete your account and all private entries. Published entries will remain anonymous. This cannot be undone."
  - Input: Type "DELETE" to confirm
  - Buttons: "Cancel" / "Delete Account" (red, danger)

### States
- **Loading**: Spinner on save buttons
- **Saved**: Toast notification "Settings saved"
- **Error**: Inline error messages

### Microcopy Tone
- Clear labels
- Helpful explanations
- Respectful of user's choices

---

## Screen 10: Report Content

### Purpose
Report abusive or inappropriate published entries.

### Layout (Modal)
- **Headline**: "Report Entry"
- **Body**: "Help us keep this space safe. Your report is anonymous."
- **Reason Dropdown**:
  - Spam
  - Hateful content
  - Self-harm
  - Illegal content
  - Other (shows text field if selected)
- **Details Field** (optional): Text area for additional context
- **Buttons**:
  - "Cancel" (secondary)
  - "Submit Report" (primary)

### Success State
- **Headline**: "Thank You"
- **Body**: "Thank you for helping keep this space safe. We'll review this entry."
- **Button**: "Close"

### States
- **Submitting**: Disable button, show spinner
- **Error**: "Couldn't submit report. Try again."

### Microcopy Tone
- Respectful
- Thankful
- Clear purpose

---

## Navigation Patterns

### Desktop
- **Sidebar Navigation**: Always visible (Home, Search, Settings)
- **Breadcrumbs**: For deep navigation
- **Keyboard Shortcuts**: 
  - `N` = New Entry
  - `/` = Search
  - `Esc` = Close modals

### Mobile
- **Bottom Tab Bar**: Home, Search, New Entry (FAB), Feed, Settings
- **Swipe Gestures**: Swipe to delete, swipe to edit
- **Pull to Refresh**: On home and feed

---

## Accessibility Requirements

1. **WCAG 2.1 AA Compliance**
   - Color contrast ratios ≥ 4.5:1
   - Keyboard navigation for all actions
   - Screen reader labels (ARIA)
   - Focus indicators visible

2. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter/Space to activate
   - Esc to close modals
   - Arrow keys in lists

3. **Screen Reader Support**
   - Semantic HTML
   - ARIA labels on icons
   - Live regions for dynamic content
   - Skip links

4. **Visual Accessibility**
   - Resizable text (up to 200%)
   - High contrast mode support
   - Reduced motion option

---

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 200KB (gzipped)

---

## Empty States

All empty states follow this pattern:
- **Illustration**: Simple, calming line drawing
- **Headline**: Encouraging, not pressuring
- **Body**: Brief explanation
- **Action**: Primary button (if applicable)
- **Tone**: Warm but minimal

---

## Error States

All error states follow this pattern:
- **Icon**: Subtle warning icon
- **Headline**: "Something went wrong"
- **Body**: Brief explanation (user-friendly, not technical)
- **Action**: Retry button or alternative action
- **Tone**: Apologetic but not dramatic

