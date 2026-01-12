# If I Was Honest - Development Guide

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your environment variables:**
   - Copy `.env.example` to `.env` (or `.env.local`)
   - Configure Firebase variables from your Firebase project
   - Set `NEXTAUTH_SECRET` with a secure random string

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   # Local dev example (requires DATABASE_URL starting with "file:")
   npm run db:push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── auth/             # Auth pages (signin, signup)
│   ├── dashboard/        # Main dashboard
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── providers.tsx     # Client providers
├── components/           # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── lib/                  # Utilities and configurations
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
└── types/               # TypeScript type definitions

prisma/
└── schema.prisma        # Database schema
```

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **State Management:** Zustand (ready to use)
- **Data Fetching:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod

## 🗄 Database Schema

Key models:
- **Users** - Account information and preferences
- **Entries** - Private journal entries with status tracking
- **PublishedEntries** - Anonymous public entries
- **UserMoods** - Custom mood tags
- **UserTags** - Custom entry tags

Entry statuses:
- Still true
- I've grown
- I was coping
- I lied to myself

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based sessions
- Row-level security (PostgreSQL)
- Soft deletes for data retention
- Private-by-default entries

## 🎯 Foundation Complete ✅

The app foundation is now in place with:
- ✅ Project structure and configuration
- ✅ Database schema with Prisma
- ✅ Authentication system (NextAuth)
- ✅ Basic routing (home, auth, dashboard)
- ✅ Core UI components (Button, Card, Input)
- ✅ Dark mode support
- ✅ Type-safe development environment

## 🚧 Next Steps

Ready to build:
1. Entry creation and editing functionality
2. Mood and tag management
3. Search and filtering system
4. Publishing to public feed
5. Dashboard stats and analytics
6. Export functionality

## 📚 Documentation

See the planning documents for detailed specifications:
- `01-product-overview.md` - Product vision and target users
- `02-features.md` - Feature specifications
- `03-ux-screens.md` - UX flows and wireframes
- `04-data-model.md` - Database design
- `05-api-design.md` - API endpoints
- `06-security-privacy.md` - Security implementation
- `07-tech-stack.md` - Technology choices
- `08-implementation-plan.md` - Build roadmap
- `09-monetization.md` - Revenue model

---

## Troubleshooting

- Prisma `P1012` (URL must start with `file:`): set `DATABASE_URL="file:./prisma/dev.db"` for local dev.
- Auth 401 on credentials callback in production: ensure `NEXTAUTH_URL` exactly matches your deployed domain.
- Database connectivity errors on Netlify: verify `DATABASE_URL` and `TURSO_AUTH_TOKEN` are set, then rebuild.

**Note:** For local development, no external database service is required; SQLite file is sufficient.
