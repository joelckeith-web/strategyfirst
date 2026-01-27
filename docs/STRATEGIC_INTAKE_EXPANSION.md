# Strategic Intake System Expansion Plan

> **Status:** Planned (not yet implemented)
> **Created:** January 27, 2025
> **Purpose:** Expand research system to answer all 41 strategic intake questions

---

## Goal

Transform the 4-field intake form into a comprehensive strategic assessment that answers 7 categories of business questions by:
1. Adding AI analysis after Apify scraping
2. Creating a smart verification form with pre-filled data
3. Generating a strategic report document

---

## The 7 Categories (41 Questions Total)

### 1. Business & Market Context
- What is the exact legal business name used online?
- Is this a single-location or multi-location business?
- What is the primary city + state we want to rank in first?
- Are there secondary cities/zip codes we should support over time?
- Is the business residential, commercial, or both?

### 2. Revenue-Critical Services (MOST IMPORTANT)
- What are the top 3 services that generate the most revenue?
- What services are the highest margin, even if volume is lower?
- Are there services the client wants more of (even if not current leaders)?
- Are there any services we should avoid promoting right now?
- Do they offer emergency or same-day service?
- *Note: Blogs should primarily support money pages, not vanity topics*

### 3. Local SEO & Competitive Positioning
- Who are the top 3 local competitors (map pack or organic)?
- Is the client currently ranking in the map pack? If so, for what?
- Are we defending existing rankings or trying to break into visibility?
- Does the client compete on price, speed, quality, or trust?
- Are reviews a strength or weakness?

### 4. Website & Content Readiness
- Is there a live website we're publishing to?
- Do service pages already exist for core offerings?
- Are blogs meant to: Support existing service pages? Create topical authority? Answer FAQs for AI/SGE/AEO?
- Are there existing blogs we must avoid duplicating?
- Any compliance or brand restrictions?

### 5. Tone, Voice & Buyer Psychology
- Target audience: Homeowners, Property managers, Builders, Commercial?
- Desired tone: Professional & reassuring, Educational, Direct & conversion-focused?
- Reading level preference (default: 6–8th grade)?
- Any words, phrases, or claims to avoid?

### 6. Conversion & Measurement
- What is the primary conversion goal? Phone calls, Form fills, Quote requests?
- Should blogs push: Emergency intent, Preventative maintenance, Replacement/upgrades?
- Are we tracking conversions in GA4 / GBP yet?
- Do blogs need internal CTAs to specific service pages?

### 7. AI / AEO Considerations (Forward-Looking)
- Should blogs be structured for: Featured snippets? AI Overviews? FAQ schema?
- Do we want explicit Q&A sections for AI engines?
- Should content be written as: "Expert explainer", "Local authority", "Buyer guide"?

---

## What Can Be Auto-Detected vs. User Input

### Auto-Detected (from Apify scraping):
| Field | Source |
|-------|--------|
| Business name | GBP |
| Single/multi-location | GBP |
| Primary city/state | GBP address |
| Top 3 competitors | GBP search |
| Review count/rating | GBP |
| Service pages exist | Sitemap |
| Blog pages exist | Sitemap |
| CMS, SSL, structured data | Website crawl |
| GA4/GTM detected | Website crawl |

### AI-Inferred (Claude analyzes scraped data):
| Field | Method |
|-------|--------|
| Residential/commercial | GBP categories + website content |
| Likely services offered | Website content analysis |
| Current tone/voice | Website copy analysis |
| Review strength vs competitors | Comparative analysis |
| Content gaps | Compare to competitors |
| Competitive positioning | Market analysis |

### Requires User Input:
| Field | Reason |
|-------|--------|
| Top 3 revenue services | Internal business knowledge |
| Highest margin services | Internal business knowledge |
| Services to promote/avoid | Strategic decision |
| Emergency service availability | Operational decision |
| Price/speed/quality positioning | Strategic decision |
| Target audience preference | Strategic decision |
| Desired tone | May differ from current |
| Conversion goals | Business goals |
| Words/phrases to avoid | Brand guidelines |
| AI/AEO preferences | Strategic decision |

---

## Proposed Architecture

```
Current Flow:
Form (4 fields) → Apify Scrape → Results Page

Expanded Flow:
Form (4 fields)
  → Apify Scrape (existing 3 phases)
  → AI Analysis (NEW - Claude API)
  → Smart Verification Form (NEW - pre-filled + user input)
  → Strategic Report (NEW - all 41 questions answered)
```

---

## Implementation Phases

### Phase 1: Types & API Foundation
**New files:**
- `src/types/ai-analysis.ts` - AI inference types
- `src/types/strategic-report.ts` - Report output types
- `src/lib/ai/config.ts` - Claude API config
- `src/app/api/research/[id]/analyze/route.ts`
- `src/app/api/research/[id]/intake/route.ts`
- `src/app/api/research/[id]/finalize/route.ts`

**Modify:**
- `src/lib/supabase/types.ts` - Add aiAnalysis, verifiedIntake, strategicReport

### Phase 2: AI Analysis Service
**New files:**
- `src/services/ai/claudeAnalyzer.ts` - Claude API client
- `src/services/ai/prompts.ts` - Analysis prompts
- `src/services/ai/intakeInferencer.ts` - Map scrape → intake

**Modify:**
- `src/app/api/research/trigger/route.ts` - Add Phase 4 AI analysis

### Phase 3: Smart Verification UI
**New files:**
- `src/components/research/SmartVerificationWizard.tsx`
- `src/components/research/FieldWithConfidence.tsx`
- `src/components/research/VerificationSection.tsx`
- `src/app/research/[id]/complete/page.tsx`

**Modify:**
- `src/components/research/ResearchProgress.tsx` - Add AI Analysis task

### Phase 4: Strategic Report
**New files:**
- `src/services/ai/reportGenerator.ts`
- `src/components/results/StrategicReport.tsx`
- `src/components/results/ReportSection.tsx`
- `src/components/results/ExportButton.tsx`

**Modify:**
- `src/app/research/[id]/results/page.tsx` - Show report

### Phase 5: Integration & Polish
- Wire navigation flow
- Error handling
- Loading states
- Draft saving

---

## Data Structures

### AI Analysis Result (results.aiAnalysis)
```typescript
{
  analyzedAt: string;
  model: string;
  fields: {
    businessName: { value: "ABC Plumbing", source: "gbp", confidence: 1.0 },
    residentialCommercial: { value: "residential", source: "ai", confidence: 0.75 },
    likelyServices: { value: ["plumbing", "drains"], source: "ai", confidence: 0.8 },
    // ... all inferable fields
  },
  insights: {
    contentGaps: ["No FAQ section", "Missing service pages"],
    competitiveInsights: ["Competitor A has 2x reviews"],
    suggestedKeywords: ["emergency plumber austin", ...]
  }
}
```

### Verified Intake (results.verifiedIntake)
```typescript
{
  verifiedAt: string;
  sections: {
    businessContext: { ... },
    revenueServices: { ... },
    localSEO: { ... },
    websiteReadiness: { ... },
    toneVoice: { ... },
    conversion: { ... },
    aiConsiderations: { ... }
  },
  overrides: ["topRevenueServices", "desiredTone"]
}
```

### Strategic Report (results.strategicReport)
```typescript
{
  generatedAt: string;
  executiveSummary: string;
  sections: [
    { title: "Business & Market Context", findings: [...], recommendations: [...] },
    // ... 7 sections
  ],
  actionItems: [
    { priority: "high", title: "Add FAQ schema", category: "AI/AEO" },
    ...
  ]
}
```

---

## New Environment Variables Needed

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## User Flow After Implementation

1. User fills 4-field form, clicks "Start Research"
2. Progress page shows 7 tasks (existing 6 + "AI Analysis")
3. When complete, user clicks "Complete Your Profile"
4. Smart Verification shows 7 sections with pre-filled data
   - Green badge: "Auto-detected"
   - Blue badge: "AI Suggested"
   - Gray badge: "Your Input"
5. User confirms/edits, clicks "Generate Report"
6. Strategic Report shows all 7 categories with:
   - Findings
   - Recommendations
   - Action items
   - Export options (PDF, Markdown)

---

## Reference Files

| Existing File | Pattern to Follow |
|---------------|-------------------|
| `src/lib/types/intake.ts` | 7-section intake structure |
| `src/components/research/VerificationForm.tsx` | Verification UI pattern |
| `src/components/intake/IntakeWizard.tsx` | Multi-step wizard pattern |
| `src/lib/transformers/apify-to-research.ts` | Data transformation pattern |
