# n8n Research Workflow Documentation

## Overview

This n8n workflow receives research requests from the Strategy First app, runs parallel research tasks using Apify actors, and sends results back via callbacks.

## Flow Diagram

```
┌─────────────────┐
│  Webhook Trigger │ ← POST from Next.js /api/research/trigger
│  (receives input)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Split/Parallel │
│  Research Tasks │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┬────────┬────────┐
    ▼         ▼        ▼        ▼        ▼        ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│  GBP  │ │Compet.│ │Website│ │Sitemap│ │  SEO  │ │ Citat.│
│ Apify │ │ Apify │ │ Apify │ │ Apify │ │  API  │ │ Check │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    │         │        │        │        │        │
    ▼         ▼        ▼        ▼        ▼        ▼
┌─────────────────────────────────────────────────────────┐
│              HTTP Request (Callback)                     │
│         POST to callbackUrl for each step               │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Final Callback  │ → step: "complete"
│  (all done)     │
└─────────────────┘
```

## Webhook Input (from Next.js)

**Endpoint:** Your n8n webhook URL (set as `N8N_WEBHOOK_URL` in .env.local)

**Headers:**
- `Content-Type: application/json`
- `X-Webhook-Secret: <your-secret>` (optional, for security)

**Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "input": {
    "businessName": "Acme Plumbing",
    "websiteUrl": "https://acmeplumbing.com",
    "location": "Denver, CO",
    "gbpUrl": "https://maps.google.com/...",
    "industry": "Plumbing"
  },
  "callbackUrl": "https://yourapp.com/api/research/callback"
}
```

## Callback Payload (to Next.js)

Each research step sends a callback when complete:

**Endpoint:** `callbackUrl` from the input

**Headers:**
- `Content-Type: application/json`
- `X-Webhook-Secret: <same-secret>` (if configured)

**Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "step": "gbp",
  "status": "completed",
  "data": { /* step-specific data */ }
}
```

### Step: `gbp` (Google Business Profile)
```json
{
  "sessionId": "...",
  "step": "gbp",
  "status": "completed",
  "data": {
    "name": "Acme Plumbing",
    "rating": 4.7,
    "reviewCount": 234,
    "categories": ["Plumber", "Water Heater Repair"],
    "phone": "(303) 555-1234",
    "address": "123 Main St, Denver, CO 80202",
    "website": "https://acmeplumbing.com",
    "hours": {
      "Monday": "8:00 AM - 6:00 PM",
      "Tuesday": "8:00 AM - 6:00 PM"
    },
    "placeId": "ChIJ...",
    "mapsUrl": "https://maps.google.com/?cid=..."
  }
}
```

### Step: `competitors`
```json
{
  "sessionId": "...",
  "step": "competitors",
  "status": "completed",
  "data": [
    {
      "rank": 1,
      "name": "Best Plumbing Co",
      "rating": 4.8,
      "reviewCount": 456,
      "website": "https://bestplumbing.com",
      "phone": "(303) 555-5678",
      "address": "456 Oak Ave, Denver, CO",
      "categories": ["Plumber"],
      "distance": "2.3 mi"
    },
    {
      "rank": 2,
      "name": "Quick Fix Plumbing",
      "rating": 4.5,
      "reviewCount": 189
    }
  ]
}
```

### Step: `website`
```json
{
  "sessionId": "...",
  "step": "website",
  "status": "completed",
  "data": {
    "cms": "WordPress",
    "technologies": ["PHP", "jQuery", "Google Analytics"],
    "ssl": true,
    "mobileResponsive": true,
    "structuredData": true,
    "schemaTypes": ["LocalBusiness", "Service"],
    "description": "Denver's trusted plumbing experts...",
    "title": "Acme Plumbing | Denver Plumber",
    "pages": [
      { "url": "/services", "title": "Our Services", "wordCount": 850 },
      { "url": "/about", "title": "About Us", "wordCount": 420 }
    ]
  }
}
```

### Step: `sitemap`
```json
{
  "sessionId": "...",
  "step": "sitemap",
  "status": "completed",
  "data": {
    "totalPages": 45,
    "pageTypes": {
      "services": 8,
      "blog": 25,
      "locations": 5,
      "about": 2,
      "other": 5
    },
    "hasServicePages": true,
    "hasBlog": true,
    "hasLocationPages": true,
    "recentlyUpdated": 12
  }
}
```

### Step: `seo`
```json
{
  "sessionId": "...",
  "step": "seo",
  "status": "completed",
  "data": {
    "score": 78,
    "mobile": {
      "score": 85,
      "usability": true,
      "viewport": true,
      "textSize": true
    },
    "performance": {
      "score": 72,
      "lcp": 2400,
      "fid": 45,
      "cls": 0.08,
      "ttfb": 380
    },
    "technical": {
      "ssl": true,
      "canonicalTag": true,
      "robotsTxt": true,
      "sitemap": true,
      "structuredData": ["LocalBusiness"],
      "metaDescription": true,
      "h1Tags": 1
    },
    "content": {
      "wordCount": 1850,
      "headings": 12,
      "images": 8,
      "imagesWithAlt": 6,
      "internalLinks": 24,
      "externalLinks": 3
    }
  }
}
```

### Step: `citations`
```json
{
  "sessionId": "...",
  "step": "citations",
  "status": "completed",
  "data": [
    { "source": "Yelp", "found": true, "url": "https://yelp.com/...", "napConsistent": true },
    { "source": "BBB", "found": true, "url": "https://bbb.org/...", "napConsistent": false },
    { "source": "Angi", "found": false },
    { "source": "HomeAdvisor", "found": true, "napConsistent": true }
  ]
}
```

### Step: `complete` (Final)
```json
{
  "sessionId": "...",
  "step": "complete",
  "status": "completed",
  "data": {
    "metadata": {
      "startedAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:32:45Z",
      "duration": 165000,
      "dataConfidence": 0.95
    }
  }
}
```

### Error Callback
```json
{
  "sessionId": "...",
  "step": "gbp",
  "status": "failed",
  "error": {
    "step": "gbp",
    "code": "PLACE_NOT_FOUND",
    "message": "Could not find Google Business Profile for this business",
    "recoverable": true
  }
}
```

---

## Apify Actors Used

| Step | Actor | Actor ID |
|------|-------|----------|
| GBP | Google Maps Scraper | `compass/crawler-google-places` |
| Competitors | Google Maps Scraper | `compass/crawler-google-places` |
| Website | Website Content Crawler | `apify/website-content-crawler` |
| Sitemap | Sitemap Sniffer | `lukaskrivka/sitemap-sniffer` |
| SEO | (Use PageSpeed API or custom) | N/A |
| Citations | (Custom HTTP checks) | N/A |

---

## Environment Variables

Add these to your Next.js `.env.local`:

```env
# n8n Webhook URL (from n8n webhook node)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/research-trigger

# Optional: Shared secret for webhook security
N8N_WEBHOOK_SECRET=your-secure-random-string
```

---

## n8n Credentials Needed

1. **Apify API** - Get token from https://console.apify.com/account/integrations
2. **Google PageSpeed API** (optional) - For SEO data

---

## Testing the Workflow

You can test the webhook manually:

```bash
curl -X POST https://your-n8n-instance.com/webhook/research-trigger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret" \
  -d '{
    "sessionId": "test-123",
    "input": {
      "businessName": "Test Business",
      "websiteUrl": "https://example.com",
      "location": "New York, NY"
    },
    "callbackUrl": "https://your-app.com/api/research/callback"
  }'
```
