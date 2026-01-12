# If I Was Honest — Private Journaling & Mental Wellness

Write honestly in a private, incognito space. Publish anonymously if you choose. Track your personal growth with reflection statuses — no likes, no comments, no social pressure.

Live Site: https://ifiwashonest.netlify.app · Tech: Next.js · Firebase Firestore

## Why This App (SEO-friendly summary)
- Private journal app focused on mental wellness and self-reflection
- Anonymous publishing to a gentle, non-engagement public feed
- Reflection statuses to track growth over time
- Clean, calm UI designed to reduce anxiety and distraction

## Table of Contents
- Overview
- Features
- Tech Stack
- Quick Start
- Environment & Config
- Deployment (Netlify)
- Security & Privacy
- Legal
- Roadmap
- FAQ

## Features
- Private entries with mood tags and soft delete
- Reflection status toggles: Still true · I've grown · I was coping · I lied to myself
- Publish anonymously to the feed (no usernames, no identifiers)
- Dashboard: create, list, delete, quick publish
- Advanced filtering: full-text search, date range, mood multi-select, status filter, sorting
- Accessible, minimalist design with Tailwind CSS

## Tech Stack
- Next.js (App Router), React
- Firebase Firestore
- NextAuth (Firebase credentials provider)
- Tailwind CSS

## Quick Start
- Node.js 18+
- Install: `npm install`
- Dev: `npm run dev` → http://localhost:3000

## Environment & Config
Create `.env.local` (do not commit). See [.env.example](.env.example).
- Firebase configuration variables (client SDK)
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET` (any dev value locally; strong value in prod)

## Deployment (Netlify)
Set Environment Variables in Netlify → Site Settings → Environment Variables:
- `NEXTAUTH_URL=https://ifiwashonest.netlify.app`
- `NEXTAUTH_SECRET` → generate with `openssl rand -base64 32`
- Firebase configuration variables (from your Firebase project)

## Security & Privacy
- Bcrypt password hashing (12 rounds)
- JWT sessions with 30-day expiry and revocation support
- Rate limiting for signup/login
- Content sanitized before publishing
- Soft delete for entries
- `.gitignore` excludes `.env` files; never commit secrets

## Legal
- Privacy Policy: [src/app/privacy/page.tsx](src/app/privacy/page.tsx)
- Terms of Service: [src/app/terms/page.tsx](src/app/terms/page.tsx)
- Security: [SECURITY.md](SECURITY.md)

## Roadmap
- Entry editing & version history
- Tag management (merge/rename)
- Streaks & reminders (daily/weekly)
- Export (Markdown/JSON)
- PWA install & offline mode

## FAQ (SEO keywords)
- Is this a private journal app? Yes — private by default; optional anonymous publishing.
- Does it track mental health? Yes — moods, statuses, and filters support reflection.
- Is there social engagement? No — no likes, comments, or public metrics.
- Can I export my data? Planned — export to Markdown/JSON.

## Scripts
- `npm run dev` · `npm run build` · `npm run start`
- `npm run db:generate` · `npm run db:migrate` · `npm run db:studio` · `npm run db:seed`

## Contributing
- Uphold privacy-first principles
- Avoid social mechanics (likes/comments)
- Use environment variables for secrets

## License
Copyright © If I Was Honest. All rights reserved.

---

## Architecture
- Frontend: Next.js App Router (`src/app/*`) with server components and route handlers in `src/app/api/*`.
- Backend: Route handlers (Edge-compatible) using Prisma via `src/lib/prisma.ts`.
- Auth: NextAuth credentials provider configured in `src/lib/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts`.
- Database: Firebase Firestore for data persistence.
- Styling: Tailwind CSS in `src/app/globals.css` and components.

### API Overview
- `GET /api/entries?filter=all|private|shared&limit=50&offset=0`
	- Returns authenticated user entries with moods/tags and lightweight stats.
- `POST /api/entries`
	- Body: `{ content, title?, moods?, tags?, status?, shareAnonymously? }`
	- Creates entry; optionally publishes anonymously to feed.
- `PATCH /api/entries/:id`
	- Body: `{ content?, title?, status? }` — updates entry & status.
- `DELETE /api/entries/:id`
	- Soft-deletes entry.
- `POST /api/entries/publish`
	- Body: `{ entryId, moods }` — publishes an existing entry to anonymous feed.
- `GET /api/feed?mood=happy&search=something&limit=20&offset=0`
	- Returns anonymized published entries with mood filters.
- `POST /api/auth/signup`
	- Body: `{ email, password }` — creates a new account with rate limiting.

### Data Model Summary
- `User`: accounts, sessions, preferences, soft delete.
- `Entry`: private content, `status`, moods, tags, `publishedEntryId`.
- `PublishedEntry`: anonymized content visible in the public feed.
- `UserMood` / `EntryMood`: per-user mood catalog + junction table.
- `UserTag` / `EntryTag`: per-user tag catalog + junction table.

### Status System
Statuses reflect growth without judgment:
- `STILL_TRUE` · `IVE_GROWN` · `I_WAS_COPING` · `I_LIED`
- Visible in dashboard, filterable, never shown in public feed.

## Deployment
### Netlify
- Build command: `npm run build`
- Publish directory: `.next`
- Environment vars: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, Firebase configuration
- Optional: custom domain + HTTPS.

## Performance
- Incremental compilation via Next.js App Router.
- Avoid heavy client-side libraries; prefer server components.
- Sanitize and trim content before rendering long entries.
- Use pagination/infinite scroll for feeds.

## Accessibility
- Semantic headings and labels.
- Sufficient color contrast in badges and buttons.
- Focus states on interactive elements.
- Respect reduced motion where applicable.

## Troubleshooting
- Auth redirect loop: ensure `NEXTAUTH_URL` matches deployed URL exactly.
- Firebase authentication errors: verify Firebase configuration and credentials.
- Prisma errors in Netlify: verify env vars are set and rebuild.
- 500 on feed/entries: check database connectivity and schema migrations.

## SEO Suggestions
- Consistent metadata in `src/app/layout.tsx` and page-specific `layout.tsx` files.
- Provide descriptive `openGraph` and `twitter` images — implemented in `src/app/opengraph-image.tsx` and `src/app/twitter-image.tsx`.
- Keep private pages (`/dashboard`) unindexed (robots `index:false`).

## Privacy & Security Checklist
- [x] Password hashing (bcrypt, 12 rounds)
- [x] JWT sessions; session revocation via `sessionVersion`
- [x] Rate limiting on signup/login
- [x] Content sanitization before publishing
- [x] Soft delete for entries
- [x] Secrets excluded via `.gitignore`

## Community & Support
- Issues: open a GitHub issue with clear reproduction steps.
- Security reports: follow [SECURITY.md](SECURITY.md) guidelines.

