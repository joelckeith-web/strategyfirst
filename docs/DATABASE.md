# Database Schema

**Supabase Project:** https://hwawccntztjfqacigkzg.supabase.co

## Tables

### `research_sessions`

Primary table for the research-first flow. Stores session state, progress, and results.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `client_id` | UUID | Optional FK to clients table |
| `input` | JSONB | Input data from trigger request |
| `status` | TEXT | `pending` \| `running` \| `completed` \| `partial` \| `failed` \| `timeout` |
| `progress` | JSONB | Progress tracking object |
| `results` | JSONB | Research results by category |
| `errors` | JSONB | Array of error objects |
| `n8n_execution_id` | TEXT | ~~n8n workflow execution ID~~ (legacy, unused) |
| `callback_url` | TEXT | URL for n8n callbacks |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |

**Input JSONB Structure:**
```json
{
  "businessName": "string",
  "website": "string",
  "city": "string?",
  "state": "string?",
  "serviceAreas": "string[]?",
  "industry": "string?",
  "primaryServices": "string[]?"
}
```

**Progress JSONB Structure:**
```json
{
  "currentStep": "gbp | competitors | website | sitemap | seo | citations | complete",
  "completedSteps": ["gbp", "competitors", ...],
  "failedSteps": [],
  "percentage": 0-100
}
```

**Results JSONB Structure:**
```json
{
  "gbp": {
    "name": "string",
    "rating": "number",
    "reviewCount": "number",
    "categories": "string[]",
    "phone": "string?",
    "address": "string?",
    "website": "string?"
  },
  "competitors": [
    {
      "rank": "number",
      "name": "string",
      "rating": "number",
      "reviewCount": "number"
    }
  ],
  "websiteCrawl": {
    "cms": "string",
    "technologies": "string[]",
    "ssl": "boolean",
    "mobileResponsive": "boolean",
    "structuredData": "boolean",
    "schemaTypes": "string[]"
  },
  "sitemap": {
    "totalPages": "number",
    "pageTypes": { "services": "number", "blog": "number", ... },
    "hasServicePages": "boolean",
    "hasBlog": "boolean",
    "hasLocationPages": "boolean"
  },
  "seoAudit": {
    "score": "number",
    "mobile": { "score": "number", ... },
    "performance": { "score": "number", "lcp": "number", ... },
    "technical": { "ssl": "boolean", ... },
    "content": { "wordCount": "number", ... }
  },
  "citations": [
    { "source": "string", "found": "boolean", "napConsistent": "boolean?" }
  ]
}
```

---

### `clients`

Basic client information. Links to research sessions and analyses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `business_name` | TEXT | Business name (required) |
| `website_url` | TEXT | Website URL (required) |
| `gbp_url` | TEXT | Google Business Profile URL |
| `primary_service_area` | TEXT | Primary location (required) |
| `status` | TEXT | `draft` \| `researching` \| `ready` \| `completed` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

---

### `research_results`

Legacy table for storing research results per-field. Being replaced by `research_sessions.results` JSONB.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `client_id` | UUID | FK to clients (unique) |
| `gbp_*` | Various | GBP data fields |
| `sitemap_*` | Various | Sitemap analysis fields |
| `website_*` | Various | Website crawl fields |
| `competitors` | JSONB | Competitor data array |
| `*_status` | TEXT | Per-task status |
| `*_error` | TEXT | Per-task error messages |

---

### `analyses`

Final analysis results after verification.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `client_id` | UUID | FK to clients |
| `intake_data` | JSONB | Full intake form data (68 fields) |
| `results` | JSONB | Analysis results |
| `status` | TEXT | `pending` \| `processing` \| `completed` \| `failed` |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `completed_at` | TIMESTAMPTZ | Completion timestamp |

---

## Indexes

```sql
-- research_sessions
CREATE INDEX idx_research_sessions_status ON research_sessions(status);
CREATE INDEX idx_research_sessions_client ON research_sessions(client_id);
CREATE INDEX idx_research_sessions_created ON research_sessions(created_at DESC);

-- clients
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created ON clients(created_at DESC);

-- research_results
CREATE INDEX idx_research_client ON research_results(client_id);

-- analyses
CREATE INDEX idx_analyses_client ON analyses(client_id);
CREATE INDEX idx_analyses_status ON analyses(status);
```

---

## Triggers

Auto-update `updated_at` on all tables:

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: clients, research_results, research_sessions
```

---

## Realtime

Enabled for `research_sessions` table:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE research_sessions;
```

This allows frontend to subscribe to changes via Supabase realtime subscriptions.

---

## Migrations

| File | Description |
|------|-------------|
| `001_initial_schema.sql` | clients, research_results, analyses tables |
| `002_research_sessions.sql` | research_sessions table for n8n flow |

Run in Supabase SQL Editor in order.
