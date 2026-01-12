# Implementation Plan

## Overview

This plan outlines the step-by-step build order, folder structure, key components, timeline, testing strategy, and deployment checklist for **If I Was Honest**.

---

## Build Order (Priority)

### Phase 1: Foundation (Week 1)
1. Project setup (Next.js, TypeScript, Tailwind)
2. Database schema (Prisma migrations)
3. Authentication (Clerk or NextAuth)
4. Basic UI components (buttons, inputs, layout)
5. Home page (empty state)

### Phase 2: Core Features (Week 2)
1. Entry CRUD (create, read, update, delete)
2. Rich text editor integration
3. Tagging system (mood tags + custom tags)
4. Status toggles
5. Entry list/detail views

### Phase 3: Search & Filter (Week 3)
1. Full-text search implementation
2. Filter UI (date, mood, status, tags)
3. Search results display
4. Sort options
5. Pagination

### Phase 4: Publishing (Week 4)
1. Publish flow (confirmation modal)
2. Published entries table
3. Anonymous ID generation
4. Public feed (read-only)
5. Unpublish (grace period)

### Phase 5: Polish & Deploy (Week 5)
1. Settings page
2. Data export
3. Account deletion
4. Reporting system
5. Error handling & edge cases
6. Testing & bug fixes
7. Deployment

---

## Folder Structure

```
if-i-was-honest/
├── .next/                    # Next.js build output
├── .env.local                # Environment variables (gitignored)
├── .env.example              # Example env file
├── prisma/
│   ├── schema.prisma         # Prisma schema
│   └── migrations/           # Database migrations
├── public/
│   ├── icons/                # App icons
│   └── images/               # Static images
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Auth routes (login, register)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/      # Protected routes
│   │   │   ├── entries/      # Entry routes
│   │   │   │   ├── [id]/
│   │   │   │   └── new/
│   │   │   ├── feed/         # Public feed
│   │   │   ├── search/       # Search/filter
│   │   │   └── settings/     # Settings
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Auth endpoints
│   │   │   ├── entries/      # Entry endpoints
│   │   │   ├── tags/         # Tag endpoints
│   │   │   ├── publish/      # Publish endpoints
│   │   │   ├── feed/         # Feed endpoints
│   │   │   ├── reports/      # Report endpoints
│   │   │   └── settings/     # Settings endpoints
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx         # Home/redirect
│   ├── components/           # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── ...
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── entries/          # Entry components
│   │   │   ├── EntryCard.tsx
│   │   │   ├── EntryEditor.tsx
│   │   │   ├── EntryDetail.tsx
│   │   │   └── EntryList.tsx
│   │   ├── tags/             # Tag components
│   │   │   ├── TagSelector.tsx
│   │   │   └── TagBadge.tsx
│   │   ├── feed/             # Feed components
│   │   │   ├── FeedEntry.tsx
│   │   │   └── FeedList.tsx
│   │   └── forms/            # Form components
│   │       ├── LoginForm.tsx
│   │       └── RegisterForm.tsx
│   ├── lib/                  # Utilities & helpers
│   │   ├── db.ts             # Prisma client
│   │   ├── auth.ts           # Auth utilities
│   │   ├── api.ts            # API client
│   │   ├── utils.ts          # General utilities
│   │   └── validations.ts    # Zod schemas
│   ├── hooks/                # Custom React hooks
│   │   ├── useEntries.ts
│   │   ├── useTags.ts
│   │   └── useAuth.ts
│   ├── stores/               # State management (Zustand)
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/                # TypeScript types
│   │   ├── entry.ts
│   │   ├── tag.ts
│   │   └── user.ts
│   └── styles/               # Global styles
│       └── globals.css
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                  # E2E tests
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

---

## Key Components

### 1. EntryEditor

**Purpose**: Rich text editor for creating/editing entries.

**Features**:
- Rich text (bold, italic, headings, lists)
- Auto-save (every 30 seconds)
- Title input (optional)
- Tag selector
- Status selector
- Character count (optional)

**Tech**: TipTap or Slate.js (rich text), React Hook Form (form handling)

---

### 2. EntryCard

**Purpose**: Display entry in list view.

**Features**:
- Title/preview
- Mood tags (badges)
- Status badge
- Timestamp (relative)
- "Published" indicator
- Click to open detail

**Tech**: React, Tailwind CSS

---

### 3. TagSelector

**Purpose**: Multi-select for mood tags and custom tags.

**Features**:
- Mood tags (pre-defined, colored)
- Custom tags (type-ahead, create new)
- Selected state visualization
- Search within tags

**Tech**: React Select or custom component

---

### 4. SearchBar

**Purpose**: Full-text search with filters.

**Features**:
- Search input (real-time)
- Filter drawer/modal
- Date range picker
- Mood/status/tag filters
- Clear filters button
- Results count

**Tech**: React, DatePicker library, React Query

---

### 5. PublishModal

**Purpose**: Confirmation modal for publishing.

**Features**:
- Warning message
- Preview of published entry
- Checkbox confirmation
- Delay publish option
- Cancel/Publish buttons

**Tech**: React, Modal component

---

### 6. FeedEntry

**Purpose**: Display published entry in public feed.

**Features**:
- Entry content (full text)
- Mood tags (badges)
- Relative timestamp
- Anonymous ID
- Report button

**Tech**: React, Tailwind CSS

---

## Timeline

### Week 1: Foundation

**Day 1-2**: Project Setup
- Initialize Next.js project
- Set up TypeScript, Tailwind CSS
- Configure ESLint, Prettier
- Set up Prisma + database
- Deploy to Vercel (staging)

**Day 3-4**: Database Schema
- Create Prisma schema (all tables)
- Run migrations
- Seed system mood tags
- Test database connections

**Day 5-7**: Authentication
- Implement auth (Clerk or NextAuth)
- Login/register pages
- Email verification flow
- Protected routes middleware
- Magic link support

**Deliverables**:
- ✅ Project running locally
- ✅ Database schema created
- ✅ Authentication working
- ✅ Basic layout/header

---

### Week 2: Core Features

**Day 8-10**: Entry CRUD
- Entry creation page
- Rich text editor integration
- Entry detail page
- Entry edit page
- Entry deletion (with confirmation)
- Auto-save drafts

**Day 11-12**: Tagging System
- Tag selector component
- Mood tags display
- Custom tag creation
- Tag association with entries
- Tag management (optional)

**Day 13-14**: Status System
- Status selector component
- Status badge display
- Status update functionality
- Status history (optional)

**Deliverables**:
- ✅ Users can create/edit/delete entries
- ✅ Users can tag entries
- ✅ Users can set entry status
- ✅ Entry list displays correctly

---

### Week 3: Search & Filter

**Day 15-17**: Search Implementation
- Full-text search (PostgreSQL)
- Search API endpoint
- Search UI component
- Search results display
- Highlighting matches

**Day 18-19**: Filter System
- Filter UI (drawer/modal)
- Date range picker
- Mood/status/tag filters
- Filter state management
- Clear filters

**Day 20-21**: Polish
- Sort options (date, modified, title)
- Pagination
- Empty states
- Loading states
- Error handling

**Deliverables**:
- ✅ Full-text search works
- ✅ All filters work independently and together
- ✅ Search results paginate
- ✅ Empty/loading states handled

---

### Week 4: Publishing

**Day 22-24**: Publish Flow
- Publish modal component
- Publish API endpoint
- Anonymous ID generation
- Published entries table
- Entry status update (published)

**Day 25-26**: Public Feed
- Public feed page
- Feed API endpoint
- Feed entry component
- Pagination
- No engagement UI (no likes/comments)

**Day 27-28**: Unpublish & Reporting
- Unpublish functionality (grace period)
- Report button/modal
- Report API endpoint
- Admin review queue (basic)

**Deliverables**:
- ✅ Users can publish entries
- ✅ Public feed displays published entries
- ✅ Users can unpublish within grace period
- ✅ Users can report entries

---

### Week 5: Polish & Deploy

**Day 29-30**: Settings
- Settings page
- Preference management
- Email/password change
- Data export functionality
- Account deletion

**Day 31-32**: Testing
- Unit tests (critical functions)
- Integration tests (API endpoints)
- E2E tests (critical flows: login, create entry, publish)
- Bug fixes

**Day 33-34**: Error Handling & Edge Cases
- Error boundaries
- Offline handling
- Network error handling
- Form validation errors
- Edge case fixes

**Day 35**: Deployment
- Production environment setup
- Database migration to production
- Domain configuration
- SSL certificates
- Monitoring setup
- Final testing

**Deliverables**:
- ✅ All MVP features complete
- ✅ Tests passing
- ✅ Error handling in place
- ✅ Production deployment live
- ✅ Domain configured
- ✅ Monitoring active

---

## Testing Plan

### Unit Tests

**Target Coverage**: 70%+ for critical functions

**Test Files**:
- `lib/utils.ts` (date formatting, text sanitization)
- `lib/validations.ts` (Zod schemas)
- `lib/api.ts` (API client error handling)

**Framework**: Vitest or Jest

---

### Integration Tests

**Target**: All API endpoints

**Test Files**:
- `api/entries/` (CRUD operations)
- `api/tags/` (tag management)
- `api/publish/` (publish flow)
- `api/feed/` (public feed)

**Framework**: Vitest + Supertest

**Example**:
```typescript
describe('POST /api/entries', () => {
  it('creates entry with valid data', async () => {
    // Test implementation
  });
  
  it('rejects entry without content', async () => {
    // Test implementation
  });
});
```

---

### E2E Tests

**Target**: Critical user flows

**Test Flows**:
1. **Registration → Login → Create Entry → Publish**
2. **Login → Search → Filter → View Entry**
3. **Login → Edit Entry → Delete Entry**
4. **Public Feed → View Entry → Report Entry**

**Framework**: Playwright or Cypress

**Example**:
```typescript
test('user can create and publish entry', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.goto('/entries/new');
  await page.fill('[name="title"]', 'Test Entry');
  await page.fill('[name="content"]', 'This is a test entry.');
  await page.click('button[type="submit"]');
  // ... continue flow
});
```

---

### Manual Testing Checklist

**Before MVP Launch**:
- [ ] All screens render correctly (desktop + mobile)
- [ ] Authentication flows work (login, register, magic link)
- [ ] Entry CRUD works (create, read, update, delete)
- [ ] Tagging works (mood tags + custom tags)
- [ ] Status toggles work
- [ ] Search and filters work
- [ ] Publish flow works (with confirmation)
- [ ] Public feed displays correctly
- [ ] Report functionality works
- [ ] Settings page works
- [ ] Data export works
- [ ] Account deletion works
- [ ] Error states display correctly
- [ ] Loading states display correctly
- [ ] Empty states display correctly
- [ ] Responsive design works (mobile, tablet, desktop)
- [ ] Accessibility basics (keyboard navigation, screen readers)

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Seed data inserted (mood tags)
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] CDN configured (if using)
- [ ] Error tracking configured (Sentry)
- [ ] Monitoring configured (uptime, errors)
- [ ] Backup strategy in place
- [ ] Rate limiting configured
- [ ] CORS configured correctly

### Deployment Steps

1. **Build Production**:
   ```bash
   npm run build
   ```

2. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

3. **Seed Database** (if needed):
   ```bash
   npm run seed
   ```

4. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

5. **Verify Deployment**:
   - Check homepage loads
   - Test authentication
   - Test entry creation
   - Check public feed

### Post-Deployment

- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Test critical user flows
- [ ] Verify backups are running
- [ ] Set up alerts (uptime, errors)
- [ ] Document deployment process

---

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 200KB (gzipped)

**Optimization Strategies**:
- Code splitting (dynamic imports)
- Image optimization (Next.js Image)
- Lazy loading (entries, feed)
- Database query optimization (indexes, pagination)
- CDN caching (static assets)

---

## Accessibility Checklist

- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Screen reader labels (ARIA)
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus indicators visible
- [ ] Form labels associated with inputs
- [ ] Error messages accessible
- [ ] Skip links for navigation
- [ ] Alt text for images
- [ ] Semantic HTML used

---

## Security Checklist

- [ ] HTTPS only (redirect HTTP)
- [ ] Environment variables not exposed
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize HTML)
- [ ] CSRF protection (if using cookies)
- [ ] Rate limiting enabled
- [ ] Password hashing (bcrypt)
- [ ] JWT tokens secure (expiration, revocation)
- [ ] CORS configured correctly
- [ ] Input validation (all inputs)
- [ ] Row-level security (database policies)

---

## Assumptions

1. **Team Size**: 1-2 developers
2. **Development Time**: 5 weeks for MVP
3. **Testing Time**: Included in timeline
4. **Deployment Platform**: Vercel (Option A)
5. **Database**: Neon PostgreSQL (Option A)
6. **Authentication**: Clerk or NextAuth.js

---

## Future Enhancements (Post-MVP)

### Week 6+: V1 Features

- Time-lock entries
- Cooldown timer
- Random entry resurfacer
- Encryption vault mode
- AI reflection summaries (opt-in)
- Gentle writing reminders

### Week 8+: Polish

- Mobile app (React Native)
- Desktop app (Electron/Tauri)
- Browser extension
- Integrations (export to Day One, etc.)

---

## Risk Mitigation

### Technical Risks

**Risk**: Database scaling issues
- **Mitigation**: Use managed database (Neon) with auto-scaling

**Risk**: Authentication bugs
- **Mitigation**: Use managed auth (Clerk) or well-tested library (NextAuth)

**Risk**: Rich text editor complexity
- **Mitigation**: Use proven library (TipTap) with good docs

**Risk**: Search performance
- **Mitigation**: Use PostgreSQL full-text search, add indexes, paginate results

### Timeline Risks

**Risk**: Scope creep
- **Mitigation**: Strict MVP definition, defer V1 features

**Risk**: Underestimation
- **Mitigation**: Add 20% buffer to timeline, prioritize core features

**Risk**: Deployment issues
- **Mitigation**: Test deployment early (Week 1), use proven platform (Vercel)

---

## Success Criteria

**MVP Launch Criteria**:
- ✅ All MVP features implemented
- ✅ Tests passing (unit + integration + basic E2E)
- ✅ No critical bugs
- ✅ Performance targets met
- ✅ Accessibility basics met
- ✅ Security checklist complete
- ✅ Production deployment live
- ✅ Domain configured
- ✅ Monitoring active

