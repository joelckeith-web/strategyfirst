# Strategy First - AI Assistant Context

## Project Overview

Strategy First is a competitor analysis platform for local businesses. It uses a research-first approach: instead of asking users 68 questions, we collect 4 fields and auto-populate the rest via automated research.

## Key URLs

- **Production:** https://v0-strategy-first.vercel.app/
- **GitHub:** https://github.com/joelckeith-web/strategyfirst
- **Supabase:** https://hwawccntztjfqacigkzg.supabase.co
- **n8n:** https://aspos.app.n8n.cloud

## Tech Stack

- Next.js 16 (App Router) + React 19
- Supabase (PostgreSQL + Realtime subscriptions)
- n8n Cloud (webhook orchestration)
- Apify (data scraping actors)
- Vercel (deployment)
- TypeScript (strict mode)

## Architecture

```
/research → MinimalInputForm (4 fields)
    ↓
POST /api/research/trigger
    ↓
Creates session in Supabase → Triggers n8n webhook
    ↓
n8n runs Apify actors (parallel):
  - Google Places (GBP data)
  - Website Crawler
  - Sitemap Sniffer
  - Competitor search
    ↓
n8n POSTs to /api/research/callback
    ↓
Results stored in Supabase research_sessions table
    ↓
/research/[id] polls status, shows progress
    ↓
/research/[id]/results displays findings
```

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
| `src/app/api/research/trigger/route.ts` | Starts research, triggers n8n |
| `src/app/api/research/callback/route.ts` | Receives results from n8n |
| `src/app/api/research/status/[sessionId]/route.ts` | Returns session status |
| `src/components/research/ResearchProgress.tsx` | Progress UI with task cards |
| `src/app/research/[id]/results/page.tsx` | Results display page |
| `src/types/apify-outputs.ts` | Apify actor output types |
| `src/lib/transformers/apify-to-research.ts` | Apify → app type transformers |

## n8n Integration

**Webhook URL:** `https://aspos.app.n8n.cloud/webhook/research-trigger`

**Callback URL:** `https://v0-strategy-first.vercel.app/api/research/callback`

**Payload to n8n:**
```json
{
  "sessionId": "uuid",
  "businessName": "string",
  "website": "string",
  "city": "string",
  "state": "string",
  "callbackUrl": "string"
}
```

**Callback from n8n:**
```json
{
  "sessionId": "uuid",
  "status": "completed",
  "apifyResults": {
    "googlePlaces": [...],
    "websiteCrawler": [...],
    "sitemapSniffer": [...]
  }
}
```

## Development Notes

- Fallback research runs when n8n is unavailable (generates mock data)
- Supabase realtime subscriptions available but polling is primary
- Results page handles all 6 research types: gbp, competitors, website, sitemap, seo, citations

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
- `NEXT_PUBLIC_APP_URL`
- `N8N_WEBHOOK_URL`
