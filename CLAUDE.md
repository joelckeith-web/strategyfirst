# Strategy First - AI Assistant Context

## Project Overview

Strategy First is a competitor analysis platform for local businesses. It uses a research-first approach: instead of asking users 68 questions, we collect 4 fields and auto-populate the rest via automated research.

## Key URLs

- **Production:** https://v0-strategy-first.vercel.app/
- **GitHub:** https://github.com/joelckeith-web/strategyfirst
- **Supabase:** https://hwawccntztjfqacigkzg.supabase.co

## Tech Stack

- Next.js 16 (App Router) + React 19
- Supabase (PostgreSQL + Realtime subscriptions)
- **Apify (direct API integration)** - data scraping actors
- Vercel (deployment) with `@vercel/functions` for background tasks
- TypeScript (strict mode)

## Current Architecture (Updated Jan 2025)

```
/research → MinimalInputForm (4 fields)
    ↓
POST /api/research/trigger
    ↓
Creates session in Supabase (status: pending)
    ↓
Direct Apify Integration (3 phases):
    ↓
Phase 1: GBP + Sitemap (parallel, 8GB each)
  - Google Places actor (gets business category)
  - Sitemap Extractor actor
    ↓
Phase 2: Competitor Search (uses GBP category)
  - Searches for competitors by actual business category
  - NOT by business name keywords
    ↓
Phase 3: Website Crawler (32GB RAM, runs alone)
  - Deep website crawl with max memory
    ↓
Results stored in Supabase research_sessions table
    ↓
/research/[id] polls status, shows progress with task cards
    ↓
/research/[id]/results displays findings
```

## Recent Changes (Jan 27, 2025)

### Direct Apify Integration (replaced n8n)
- Removed n8n webhook dependency
- Uses `@vercel/functions` `waitUntil()` for background processing
- 3-phase execution for optimal resource usage

### Memory Allocation
- Website Crawler: **32GB RAM** (32768 MB) - heaviest task
- Other actors: **8GB RAM** (8192 MB)
- Fixed bug where `callActor()` wasn't passing memory parameter to API

### Competitor Search Fix
- Now uses **GBP category** (e.g., "Home Inspector") for competitor search
- Previously was incorrectly using last word of business name (e.g., "Services")
- Filters out user's own business from competitor results

### Task Display Order
1. Google Business Profile (parallel with Sitemap)
2. Sitemap Analysis (parallel with GBP)
3. Competitor Research
4. Website Crawl
5. SEO Audit
6. Citation Check

## Database Tables

### `research_sessions` (primary for new flow)
- `id` - UUID primary key
- `input` - JSONB (businessName, website, city, state, industry)
- `status` - pending | running | completed | failed
- `progress` - JSONB (currentStep, completedSteps, percentage)
- `results` - JSONB (gbp, competitors, websiteCrawl, sitemap, seoAudit, citations)
- `errors` - JSONB array

### `clients` (legacy/future)
- Basic client info, links to research_sessions

### `research_results` (legacy)
- Old per-field storage, being replaced by research_sessions.results

## Key Files

| File | Purpose |
|------|---------|
| `src/app/api/research/trigger/route.ts` | Starts research, runs 3-phase Apify execution |
| `src/app/api/research/status/[sessionId]/route.ts` | Returns session status for polling |
| `src/components/research/ResearchProgress.tsx` | Progress UI with 6 task cards |
| `src/components/research/MinimalInputForm.tsx` | 4-field intake form |
| `src/app/research/[id]/results/page.tsx` | Results display page |
| `src/lib/apify/client.ts` | Apify API client with memory settings |
| `src/services/apify/googlePlaces.ts` | Google Places actor service |
| `src/services/apify/websiteCrawler.ts` | Website crawler (32GB) |
| `src/services/apify/sitemapExtractor.ts` | Sitemap extraction |
| `src/lib/transformers/apify-to-research.ts` | Apify → app type transformers |

## Apify Integration

**Direct API calls** (no n8n middleware):
- Actor IDs use `~` separator in URLs (e.g., `compass~crawler-google-places`)
- Memory and timeout passed as query params
- Uses `run-sync-get-dataset-items` endpoint for synchronous execution

**Actors Used:**
| Actor | ID | Memory |
|-------|-----|--------|
| Google Places | `compass/crawler-google-places` | 8GB |
| Website Crawler | `apify/website-content-crawler` | 32GB |
| Sitemap Extractor | `onescales/sitemap-url-extractor` | 8GB |

## Development Notes

- Fallback mock data runs when `APIFY_API_TOKEN` not configured
- Uses `waitUntil()` from `@vercel/functions` for background processing
- Results page handles 6 research types: gbp, competitors, website, sitemap, seo, citations
- Supabase RLS disabled on research_sessions table for now

## Common Tasks

**Run locally:**
```bash
npm run dev
```

**Deploy:**
```bash
vercel --prod
```

**Test research flow:**
```bash
node scripts/test-full-flow.mjs
```

## Environment Variables

Required in `.env.local` and Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
- `APIFY_API_TOKEN` (for direct Apify integration)

## Future Expansion

See `docs/STRATEGIC_INTAKE_EXPANSION.md` for planned Phase 2:
- AI Analysis (Claude API) after scraping
- Smart Verification Form with pre-filled data
- Strategic Report generation answering all 41 intake questions
