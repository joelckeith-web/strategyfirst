# Strategy First - AI Assistant Context

## Project Overview

Strategy First is a competitor analysis platform for local businesses. It uses a research-first approach: instead of asking users 68 questions, we collect 4 fields and auto-populate the rest via automated research.

### Product Direction

**Current Phase (Internal Tool):**
- Internal application for Atomic Souls Productions marketing agency
- Comprehensive online presence audit for clients
- Multi-channel strategy creation (organic + paid)
- Deep analysis to inform marketing campaigns

**Future Vision (SaaS):**
- Web-based self-service application
- User sign-up and account management
- Analytics dashboard for businesses
- Automated strategy generation
- Marketability/viability TBD

Design decisions should support the internal agency use case first, while keeping the architecture flexible for eventual SaaS expansion.

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
- **Vitest** - test framework with 97.8% coverage on AI services

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
Phase 3: Website Crawler (cheerio for all modes - fast HTTP-based)
  - Lightweight: 4GB RAM, 15 pages, ~30-60s
  - Full: 4GB RAM, 50 pages, depth 4, 5-20 concurrent requests, ~1-2min
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

### Memory Allocation (Updated Jan 30, 2025)
- Website Crawler: **16GB** for comprehensive crawling
- Other actors: **8GB RAM** (8192 MB)
- All crawls use cheerio (HTTP-only) - 10-50x faster than Playwright
- Uses Apify Proxy for reliability (required by website-content-crawler actor)

### Website Crawler Settings
- Lightweight mode: 25 pages, depth 3, 3 min timeout
- Full mode: **150 pages**, depth 5, 15 min timeout
- Concurrency: 5-20 simultaneous requests
- Request timeout: 60 seconds per page
- Sitemap seeding: up to 100 priority URLs from sitemap

### Competitor Search Fix
- Now uses **GBP category** (e.g., "Home Inspector") for competitor search
- Previously was incorrectly using last word of business name (e.g., "Services")
- Filters out user's own business from competitor results

### Task Display Order (Research Progress UI)
1. Google Business Profile (parallel with Sitemap)
2. Sitemap Analysis (parallel with GBP)
3. Competitor Research
4. Website Crawl
5. SEO Audit
6. Citation Check

Note: AI Analysis (Claude API) runs after data gathering completes but is not shown as a task card in the progress UI.

## Database Tables

### `research_sessions` (primary for new flow)
- `id` - UUID primary key
- `input` - JSONB (businessName, website, city, state, industry)
- `status` - pending | running | completed | failed
- `progress` - JSONB (currentStep, completedSteps, percentage)
- `results` - JSONB (gbp, competitors, websiteCrawl, sitemap, seoAudit, citations, aiAnalysis)
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
| `src/components/research/ResearchProgress.tsx` | Progress UI with 6 task cards (data gathering phase) |
| `src/components/research/MinimalInputForm.tsx` | 4-field intake form |
| `src/app/research/[id]/results/page.tsx` | Results display page |
| `src/lib/apify/client.ts` | Apify API client with memory settings |
| `src/services/apify/googlePlaces.ts` | Google Places actor service |
| `src/services/apify/websiteCrawler.ts` | Website crawler (lightweight/full modes) |
| `src/services/apify/sitemapExtractor.ts` | Sitemap extraction |
| `src/lib/transformers/apify-to-research.ts` | Apify → app type transformers |
| `src/services/ai/claudeClient.ts` | Claude API client with retries |
| `src/services/ai/intakeAnalyzer.ts` | AI analysis orchestrator |
| `src/services/ai/promptBuilder.ts` | Prompt construction for analysis |
| `src/app/api/research/[id]/analyze/route.ts` | AI analysis endpoint |
| `src/app/api/research/[id]/verify/route.ts` | Manual verification endpoint |
| `src/app/research/[id]/verify/page.tsx` | Verification form for low-confidence fields |
| `src/types/ai-analysis.ts` | AI analysis type definitions |
| `src/lib/ai/config.ts` | Claude API configuration |
| `vitest.config.ts` | Test framework configuration |
| `src/test/setup.ts` | Global test setup |
| `src/test/fixtures/mockResponses.ts` | Mock API responses for tests |

## Apify Integration

**Direct API calls** (no n8n middleware):
- Actor IDs use `~` separator in URLs (e.g., `compass~crawler-google-places`)
- Memory and timeout passed as query params
- Uses `run-sync-get-dataset-items` endpoint for synchronous execution

**Actors Used:**
| Actor | ID | Memory | Notes |
|-------|-----|--------|-------|
| Google Places | `compass/crawler-google-places` | 8GB | Gets GBP data + category |
| Website Crawler | `apify/website-content-crawler` | 16GB | Cheerio, 5-20 concurrent, 150 pages |
| Sitemap Extractor | `onescales/sitemap-url-extractor` | 8GB | Extracts all URLs |
| Citation Checker AI | `alizarin_refrigerator-owner/citation-checker-ai` | 4GB | Checks 36+ directories for NAP consistency |

## Development Notes

- Fallback mock data runs when `APIFY_API_TOKEN` not configured
- Uses `waitUntil()` from `@vercel/functions` for background processing
- Results page handles research types: gbp, competitors, website, sitemap, seo, citations, aiAnalysis (AI analysis triggered separately after data gathering)
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

**Run tests:**
```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
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
- `ANTHROPIC_API_KEY` (for Claude AI analysis)

## Documentation Index

| Topic | File | Notes |
|-------|------|-------|
| Database schema | `docs/DATABASE.md` | Tables, indexes, JSONB structures |
| Phase 2 expansion | `docs/STRATEGIC_INTAKE_EXPANSION.md` | AI analysis, verification, reports |
| Session history | `docs/SESSION_LOG.md` | Recent work log |

## Claude AI Integration (Jan 28, 2025)

### AI Analysis Flow
After research completes, trigger AI analysis:
```
POST /api/research/[id]/analyze
```

This analyzes scraped data using Claude 3.5 Sonnet and produces comprehensive insights.

### Analysis Output Structure

**1. Intake Fields (68+ fields across 7 categories)**
- Business Context (10 fields)
- Revenue & Services (12 fields)
- Local SEO (10 fields)
- Website Readiness (20 fields - includes Hub+Spoke assessment)
- Tone & Voice (8 fields)
- Conversion & Measurement (8 fields)
- AI Considerations (15 fields - includes Entity-First AEO assessment)

**2. Competitor Comparison** (`competitorComparison`)
- Client vs competitor profiles (GBP metrics, website metrics, technical SEO)
- Head-to-head comparisons: GBP, content depth, services, schema adoption
- Overall market position: leader | competitive | challenger | laggard
- Competitive advantages and disadvantages

**3. ICP Analysis** (`icpAnalysis`)
- Primary Ideal Client Profile with demographics, psychographics, pain points
- Customer avatars (2-3 detailed personas with backgrounds, goals, objections)
- Market insights and channel recommendations

**4. SERP Gap Analysis** (`serpGapAnalysis`)
- Competitor weakness detection (thin content, outdated, missing schema, slow load)
- SERP opportunities ranked by opportunity score (0-100)
- Topic coverage gaps and content freshness gaps
- Quick win actions (top 5 low-effort opportunities)
- Long-term opportunities

**5. Hub+Spoke Analysis** (`hubSpokeAnalysis`)
- Hub page assessment (3,000-5,000 word standard)
- Spoke page assessment (1,500-2,200 word standard)
- Missing hub topics with suggested spokes (8-12 per hub)
- Internal linking score and content journey coverage

**6. AEO Strategy** (`aeoStrategy`)
- Entity-first compliance scoring (brand in first paragraph, sameAs references)
- Schema readiness (FAQ, HowTo, LocalBusiness, Article)
- AEO compliance checklist (9-point scoring)
- FAQ opportunities and citable statements

### Cost Estimate
- Model: Claude 3.5 Sonnet (`claude-sonnet-4-20250514`)
- ~$0.09-0.15 per analysis (varies with data volume)
- Fallback mode works without API key (returns low-confidence defaults)

### Test AI Analysis
```bash
node scripts/test-ai-analysis.mjs [sessionId]
```

## Testing (Jan 28, 2025)

### Test Suite Overview
- **Framework:** Vitest with v8 coverage
- **121 tests** across 4 test files
- **97.8% coverage** on AI services

### Test Files
| File | Tests | Coverage |
|------|-------|----------|
| `src/lib/ai/config.test.ts` | 27 | Token estimation, cost calculation, retry delays |
| `src/services/ai/claudeClient.test.ts` | 26 | API client, errors, retries, timeouts |
| `src/services/ai/intakeAnalyzer.test.ts` | 28 | Analysis flow, fallbacks, strategic insights |
| `src/services/ai/promptBuilder.test.ts` | 40 | System prompt, data context, token estimation |

### Running Tests
```bash
npm test              # Watch mode (interactive)
npm run test:run      # Single run
npm run test:coverage # With coverage report
npm run test:watch    # Explicit watch mode
```

## Future Expansion

See `docs/STRATEGIC_INTAKE_EXPANSION.md` for planned phases:
- ~~AI Analysis (Claude API) after scraping~~ ✅ DONE
- ~~Test suite for AI services~~ ✅ DONE
- ~~Smart Verification Form for low-confidence fields~~ ✅ DONE
- ~~Results UI for competitor comparison, ICP, SERP gaps~~ ✅ DONE
- Strategic Report generation (PDF export)
- Enhanced competitor deep-dive analysis
