# Strategy First - Competitor Analysis Platform

Automated research-first approach to local business competitive analysis. Instead of a 68-question intake form, users enter 4 fields and we auto-populate the rest via research.

**Live URL:** https://v0-strategy-first.vercel.app/

## Architecture

```
User Input (4 fields) → n8n Webhook → Apify Actors → Callback → Results Display
        ↓                    ↓              ↓            ↓           ↓
   businessName         research-trigger  GBP/Website  /api/callback  /research/[id]/results
   website              Supabase          Sitemap/SEO  Supabase
   city/state                             Competitors
   industry
```

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS
- **Database:** Supabase (PostgreSQL + Realtime)
- **Automation:** n8n Cloud (webhook orchestration)
- **Data Sources:** Apify actors (Google Places, Website Crawler, Sitemap Sniffer)
- **Deployment:** Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_APP_URL` | App URL (for callbacks) |
| `N8N_WEBHOOK_URL` | n8n webhook trigger URL |

## Database Setup

Run migrations in Supabase SQL Editor:

```bash
# 1. Initial schema (clients, research_results, analyses)
supabase/migrations/001_initial_schema.sql

# 2. Research sessions table
supabase/migrations/002_research_sessions.sql
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/research/trigger` | POST | Start new research session |
| `/api/research/status/[sessionId]` | GET | Get session status & results |
| `/api/research/callback` | POST | Receive n8n/Apify results |

## Research Flow

1. **Trigger** - User submits minimal form, creates session in Supabase, triggers n8n webhook
2. **Research** - n8n runs parallel Apify actors (GBP, competitors, website, sitemap, SEO, citations)
3. **Callback** - Results sent back to `/api/research/callback`, stored in Supabase
4. **Display** - Frontend polls status, shows progress, displays results when complete

## Project Structure

```
src/
├── app/
│   ├── api/research/        # API routes
│   ├── research/            # Research pages
│   │   ├── page.tsx         # New research form
│   │   └── [id]/
│   │       ├── page.tsx     # Progress view
│   │       └── results/     # Results display
├── components/
│   ├── research/            # Research-specific components
│   └── results/             # Results display components
├── lib/
│   ├── supabase/            # Supabase client & types
│   └── transformers/        # Apify → App type transformers
├── types/
│   └── apify-outputs.ts     # Apify actor output types
└── hooks/
    └── useResearch.ts       # Research state hook
```

## Documentation

- [Database Schema](docs/DATABASE.md)
- [n8n Workflow](docs/n8n-workflow.md)
- [Session Log](docs/SESSION_LOG.md)

## Development

```bash
# Run dev server
npm run dev

# Type check
npm run lint

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```
