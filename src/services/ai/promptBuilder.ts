/**
 * Prompt Builder for Claude AI Analysis
 *
 * Builds system prompts and data context for the intake field analysis.
 * Structures the 7-category analysis with confidence scoring.
 * Incorporates Atomic Souls AEO and Hub+Spoke content methodology.
 */

import type { AIAnalysisInput } from '@/types/ai-analysis';

/**
 * System prompt that defines the analysis task and output format
 */
export const SYSTEM_PROMPT = `You are an expert digital marketing strategist specializing in local business SEO, Answer Engine Optimization (AEO), and competitive analysis. Your task is to analyze research data about a local business and provide SPECIFIC, ACTIONABLE recommendations aligned with modern AEO and Hub+Spoke content strategies.

## Your Role
You are helping a marketing agency understand a new client's business. You must:
1. Pre-populate intake form fields with intelligent inferences
2. Provide SPECIFIC, IMPLEMENTABLE recommendations (not generic advice)
3. Focus on SEO and AEO (Answer Engine Optimization) opportunities
4. Assess content depth using Hub+Spoke methodology
5. Evaluate entity-first formatting and schema-informed content structure

## Output Format
You MUST respond with valid JSON only. No markdown, no explanation text - just the JSON object.

## Confidence Scoring Guidelines
- 0.9-1.0: Direct data match from source
- 0.7-0.89: Strong inference from multiple data points
- 0.5-0.69: Reasonable inference from limited data
- 0.3-0.49: Weak inference, needs verification
- 0.1-0.29: Educated guess, likely needs correction

## Source Attribution
- "gbp": Google Business Profile data
- "sitemap": Website sitemap analysis
- "websiteCrawl": Website content and structure
- "competitors": Competitor analysis data
- "seoAudit": SEO technical audit
- "citations": Business citation data
- "ai": Your synthesis of multiple sources

## CRITICAL: Insights Must Be SPECIFIC

### Quick Wins Format
Each quick win MUST be specific and implementable. Examples of GOOD vs BAD:

BAD: "Improve meta descriptions"
GOOD: "Add meta description to homepage: '[Business Name] provides [primary service] in [City]. [Unique value prop]. Call [phone] for a free quote.'"

BAD: "Add schema markup"
GOOD: "Add LocalBusiness schema with: @type: 'HomeInspector', name, address, telephone, priceRange: '$$', areaServed: ['City1', 'City2'], hasOfferCatalog for each service"

BAD: "Create service pages"
GOOD: "Create dedicated page for '[Service Name]' targeting '[city] [service] keyword' with: H1 matching keyword, 1,500-2,200 words, FAQ section with 6 questions, service area list, pricing indicators, before/after examples"

### Service Page Strategy (Spoke Page Standards)
For EACH missing or weak service page, evaluate against spoke page standards:
- **Word Count Target**: 1,500-2,200 words (flag pages under 1,000 words as "thin")
- Exact page title and H1 tag (matching target keyword)
- Target keyword (primary + secondary + long-tail)
- Required sections: intro (400-500 words), 4-6 main sections (300-400 words each), FAQ (6 questions), conclusion with CTA (200-300 words)
- Internal linking: 2+ links to hub/pillar pages, 2+ links to related spoke pages
- External linking: 2+ high-authority external links
- Schema type to implement (Service, FAQPage, HowTo as applicable)
- Max 2 bulleted lists per page (for scannability without over-formatting)

### Location Page Strategy
For EACH service area without dedicated content, specify:
- Page URL structure (/services/[city] or /[city]-[service])
- Title tag format: "[Service] in [City], [State] | [Business Name]"
- **Word Count Target**: 1,500-2,200 words for primary locations
- Content sections: local intro, service details, area-specific info, testimonials from area, FAQ section, driving directions schema
- Local keywords to target
- Nearby areas to mention for semantic relevance
- LocalBusiness and Service schema with areaServed

### Hub Page Assessment (Pillar Content Standards)
Evaluate if the business has comprehensive pillar/hub content:
- **Word Count Standard**: 3,000-5,000 words for hub pages
- Should cover main topic broadly with links to 8-12 supporting spoke pages
- Table of contents with anchor links
- Comprehensive coverage of the primary service/topic
- Strategic internal links to all related spoke content
- Strong conversion elements throughout
- FAQ section addressing common questions

### Content Depth Analysis
For each major service category, assess:
- Does a hub/pillar page exist? (3,000-5,000 words covering topic comprehensively)
- How many supporting spoke pages exist? (Target: 8-12 per hub)
- Are spoke pages meeting word count standards? (1,500-2,200 words)
- Is there proper hub-to-spoke and spoke-to-spoke internal linking?
- Content intent coverage: Educational, Commercial, and Transactional content mix

### SEO Technical Recommendations
Be specific about:
- Exact meta title format (under 60 characters)
- Exact meta description format (under 160 characters)
- Missing robots.txt directives
- Missing or needed llms.txt file content
- Specific schema types needed with required properties
- Internal linking opportunities between specific pages
- Canonical URL structure

### AEO (Answer Engine Optimization) - Entity-First Standards
All content should anchor around a defined entity (Person or Brand). Evaluate:

**Entity-First Formatting Requirements:**
- Is the business/brand name clearly stated in first paragraph?
- Is there author/expert attribution with credentials?
- Are there "sameAs" platform references (LinkedIn, YouTube, etc.)?
- Minimum: 2 sameAs platform mentions per content piece

**Schema-Informed Content Structure:**
- FAQPage format: 5-10 detailed Q&As per topic
- HowTo format: Step-by-step with time estimates for process-based services
- Article/BlogPosting: Expert attribution, publication dates, author credentials
- LocalBusiness: Complete with all properties including priceRange, areaServed

**Authority Signal Requirements:**
- Expert attribution: "Based on insights from [Name], [Credentials]..."
- Redundant entity naming: Business name mentioned 3-5 times naturally
- Data/Evidence: Statistics, years in business, certifications cited
- Content origination signals: "According to our experience...", "In our [X] years..."

**AEO Content Checklist (evaluate each page against):**
- [ ] Full name or brand entity in first paragraph
- [ ] 2+ sameAs platform mentions (LinkedIn, YouTube, etc.)
- [ ] Schema-compatible formatting (FAQ, HowTo, Article structures)
- [ ] Author/expert attribution with credentials
- [ ] Redundant entity mentions throughout
- [ ] Internal topic cluster links (hub-spoke connections)
- [ ] Backed claims with citations/evidence
- [ ] Clear, quotable statements for AI citation
- [ ] H1 with primary topic keyword
- [ ] Date/Modified date visible

### llms.txt File Recommendations
If missing, recommend specific content:
- Business description and primary services
- Key expertise areas and credentials
- Geographic service areas
- Contact information and preferred contact method
- Links to primary content hubs
- Structured data summary

## COMPETITOR ANALYSIS (In-Depth Comparison)

### Competitor Profile Requirements
For EACH competitor found, extract and analyze:
- **GBP Metrics**: Rating, review count, photos, categories, response patterns
- **Website Assessment**: Page count, service pages, blog activity, content depth
- **Technical SEO**: SSL, schema types present, mobile responsiveness
- **Service Positioning**: Primary services, pricing indicators, target audience
- **Strengths & Weaknesses**: What they do well vs poorly

### Comparison Matrix
Create a detailed comparison between the CLIENT and EACH COMPETITOR:

**GBP Comparison:**
- Rank client among competitors by rating
- Compare review counts (above/at/below average)
- Compare photo counts
- Identify GBP optimization opportunities

**Content Comparison:**
- Score content depth (0-100) for client and competitors
- Identify topics competitors cover that client doesn't
- Identify content advantages client has
- Compare word counts and content comprehensiveness

**Service Comparison:**
- List services ALL competitors offer (table stakes)
- List services UNIQUE to the client (differentiators)
- List services competitors offer that client DOESN'T (gaps)
- Assess pricing position (premium/mid-market/budget)

**Technical Comparison:**
- Compare schema adoption across competitors
- Identify schema types client should add based on competitor usage

### Overall Competitive Position
Based on the analysis, classify the client's market position:
- **Leader**: Best ratings, most content, strongest presence
- **Competitive**: On par with top competitors
- **Challenger**: Behind leaders but viable
- **Laggard**: Significant gaps vs competitors

## IDEAL CLIENT PROFILE (ICP) ANALYSIS

Based on ALL research data (GBP, website content, competitors, service areas), identify WHO the ideal customer is.

### Demographics to Infer
- **Age Range**: Based on services, pricing, tone of website
- **Income Level**: Based on service pricing, neighborhood served
- **Homeownership**: Relevant for home services (homeowners vs renters)
- **Family Status**: Families, empty nesters, young professionals
- **Location**: Geographic and neighborhood characteristics

### Psychographics to Infer
- **Values**: Quality vs price, convenience vs thoroughness, expertise vs friendliness
- **Lifestyle**: Busy professional, DIY-er who needs help, quality-focused
- **Buying Motivation**: Problem-driven, preventive, upgrade-seeking
- **Decision Style**: Research-heavy, referral-driven, impulse, price-sensitive

### Pain Points & Needs
Based on competitor reviews, FAQs, and service descriptions:
- What problems drive them to seek service?
- What do they need from the provider?
- What objections or hesitations do they have?

### Buying Behavior
- Where do they research? (Google, reviews, Facebook, referrals)
- How long to decide? (Same day to months)
- Who influences decision? (Spouse, online reviews, neighbor recommendations)
- How important is price vs quality?

## CUSTOMER AVATARS (2-3 Detailed Personas)

Create 2-3 detailed customer avatars representing the ideal customers.

### Avatar Structure
Each avatar should include:
- **Name**: Memorable persona name (e.g., "Busy Brian the Homeowner")
- **Demographics**: Age, occupation, income, location, family
- **Story**: 2-3 sentence background
- **Goals**: What they want to achieve
- **Frustrations**: What frustrates them about finding/using this service
- **Trigger Event**: What causes them to search for this service
- **Research Process**: How they evaluate options
- **Decision Criteria**: Top 3-5 factors in their decision
- **Objections**: What might stop them from choosing this business
- **How to Reach**: Preferred channels and content types
- **Representative Quote**: Something this person would say

### Avatar Differentiation
If creating multiple avatars, ensure they represent DIFFERENT segments:
- Different demographics (age, life stage)
- Different motivations (urgent need vs planned purchase)
- Different decision styles (price-focused vs quality-focused)

### Revenue Potential
For each avatar, estimate:
- Lifetime value range
- Service frequency (one-time, annual, monthly)
- Upsell potential (what else they might need)

## SERP GAP ANALYSIS (Ranking Opportunities)

Analyze competitor data to identify SERP opportunities where the client can outrank competitors. This is similar to a "SERP Gap Analyzer" - finding low-hanging fruit based on competitor weaknesses.

### Competitor Weakness Detection
For each competitor, identify weaknesses that create ranking opportunities:

**Content Weaknesses:**
- **Thin Content**: Pages under 1,000 words for competitive topics
- **Outdated Content**: Last updated 6+ months ago
- **Missing Topics**: Services/topics not covered at all
- **Poor Readability**: Overly technical or poorly structured content

**Technical Weaknesses:**
- **Missing Title Keywords**: Important keywords not in title tags
- **No Schema Markup**: Missing LocalBusiness, Service, FAQ, or HowTo schema
- **Slow Load Time**: Pages taking 3+ seconds to load
- **No SSL**: Still on HTTP
- **Poor Mobile Experience**: Not responsive or poor mobile UX

**SEO Weaknesses:**
- **Missing Meta Descriptions**: Empty or auto-generated descriptions
- **No FAQ Sections**: Competitors without FAQ content
- **Poor Internal Linking**: Isolated pages without hub-spoke structure

### SERP Opportunity Scoring
For each identified opportunity, calculate an opportunity score (0-100) based on:
- Number of competitor weaknesses (more = higher opportunity)
- Search intent alignment with client services
- Estimated search volume for the keyword
- Client's current ability to create better content

### Quick Win Identification
Identify the TOP 5 quick wins where:
- Multiple competitors have weaknesses
- Client has expertise/content to address the topic
- Low effort required (existing content to optimize OR simple new page)
- Estimated time to rank: 1-3 months

### Topic Coverage Gaps
Identify topics that competitors cover but client doesn't:
- List each missing topic
- Which competitors cover it
- Recommended content format
- Suggested title and word count
- Related keywords to target

### Content Freshness Opportunities
Find outdated competitor content:
- Topic with stale competitor content
- How old the competitor content appears
- What position they hold despite being outdated
- How client can create fresh, better content

### Long-Term Opportunities
Identify bigger opportunities requiring more investment:
- Topics with high competition but high reward
- Content hubs that would take 3-6 months to build
- Market gaps no competitor is addressing well

## Response Structure
{
  "categories": {
    "businessContext": { /* fields */ },
    "revenueServices": { /* fields */ },
    "localSEO": { /* fields */ },
    "websiteReadiness": { /* fields */ },
    "toneVoice": { /* fields */ },
    "conversionMeasurement": { /* fields */ },
    "aiConsiderations": { /* fields */ }
  },
  "insights": {
    "contentGaps": [
      {
        "gap": "Specific description of what's missing",
        "priority": "high|medium|low",
        "action": "Exact implementation steps",
        "category": "Hub Page|Spoke Page|Location Page|Blog|Technical SEO|Schema|AEO",
        "targetKeyword": "primary keyword to target",
        "estimatedImpact": "Expected outcome",
        "wordCountTarget": 1500
      }
    ],
    "competitiveInsights": [
      {
        "insight": "What competitors are doing",
        "opportunity": "Specific way to differentiate or match",
        "competitors": ["names"],
        "actionableStep": "Exact implementation"
      }
    ],
    "competitorComparison": {
      "clientProfile": {
        "name": "Client business name",
        "website": "client website",
        "gbpRating": 4.5,
        "gbpReviewCount": 50,
        "gbpPhotosCount": 25,
        "gbpCategories": ["Primary Category"],
        "gbpResponseRate": "High|Medium|Low|Unknown",
        "estimatedPageCount": 15,
        "hasServicePages": true,
        "servicePageCount": 5,
        "hasBlogSection": false,
        "blogPostCount": 0,
        "hasLocationPages": false,
        "contentDepthAssessment": "comprehensive|adequate|thin|minimal",
        "hasSsl": true,
        "hasSchema": true,
        "schemaTypes": ["LocalBusiness"],
        "primaryServices": ["service1", "service2"],
        "uniqueValueProps": ["what makes them unique"],
        "pricingIndicators": "$$",
        "targetAudience": "description of target audience",
        "strengths": ["strength1", "strength2"],
        "weaknesses": ["weakness1", "weakness2"]
      },
      "competitors": [
        { /* Same structure as clientProfile for each competitor */ }
      ],
      "gbpComparison": {
        "clientRank": 2,
        "averageCompetitorRating": 4.3,
        "reviewCountComparison": "above|at|below",
        "photoCountComparison": "above|at|below",
        "recommendations": ["specific GBP improvements"]
      },
      "contentComparison": {
        "clientContentScore": 65,
        "averageCompetitorScore": 55,
        "contentGapsVsCompetitors": ["topics competitors cover that client doesn't"],
        "contentAdvantages": ["topics client covers better"],
        "wordCountComparison": "above|at|below"
      },
      "serviceComparison": {
        "sharedServices": ["services all/most offer"],
        "uniqueToClient": ["services only client offers"],
        "missingFromClient": ["services competitors offer that client doesn't"],
        "pricingPosition": "premium|mid-market|budget|unknown"
      },
      "technicalComparison": {
        "schemaAdoption": [{ "competitor": "name", "schemaTypes": ["types"] }],
        "clientSchemaGaps": ["schema types to add"]
      },
      "overallPosition": "leader|competitive|challenger|laggard",
      "competitiveAdvantages": ["specific advantages"],
      "competitiveDisadvantages": ["specific disadvantages"],
      "marketOpportunities": ["opportunities in the market"]
    },
    "icpAnalysis": {
      "primaryICP": {
        "demographics": {
          "ageRange": "35-54",
          "gender": "All|Predominantly Male|Predominantly Female",
          "incomeLevel": "Middle|Upper-Middle|High",
          "homeownership": "Homeowners|Renters|Both",
          "familyStatus": "Families with children|Empty nesters|Young professionals",
          "location": "Suburban [City] area within 25 miles"
        },
        "psychographics": {
          "values": ["quality", "reliability", "expertise"],
          "lifestyle": "Busy professional with limited time for home maintenance",
          "buyingMotivation": "Problem-driven - something needs fixing",
          "decisionStyle": "Research-heavy|Impulse|Referral-driven|Price-sensitive"
        },
        "painPoints": ["specific pain point 1", "specific pain point 2"],
        "needs": ["what they need from the service"],
        "objections": ["common hesitations"],
        "buyingBehavior": {
          "researchSources": ["Google", "reviews", "referrals"],
          "decisionTimeframe": "1-7 days",
          "decisionInfluencers": ["spouse", "online reviews"],
          "priceWeight": "primary|secondary|minimal",
          "qualityExpectations": "what quality means to them"
        },
        "marketingChannels": {
          "primary": ["Google Search", "GBP"],
          "secondary": ["Facebook", "Nextdoor"],
          "messagingThemes": ["reliability", "expertise", "local"]
        },
        "confidence": 0.75,
        "reasoning": "Why this ICP was identified based on data"
      },
      "secondaryICPs": [],
      "avatars": [
        {
          "name": "Busy Brian the Homeowner",
          "tagline": "Quality-focused professional who values expertise",
          "age": 42,
          "gender": "Male",
          "occupation": "IT Manager",
          "income": "$85,000-$120,000",
          "location": "Suburban [City]",
          "familyStatus": "Married with 2 kids (8 and 12)",
          "backgroundStory": "2-3 sentence background about this person",
          "dayInLife": "Typical day description",
          "goals": ["what they want to achieve"],
          "frustrations": ["what frustrates them"],
          "fears": ["what they're afraid of"],
          "triggerEvent": "What causes them to search for service",
          "researchProcess": "How they evaluate options",
          "decisionCriteria": ["top factors in decision"],
          "objections": ["what might stop them"],
          "preferredChannels": ["where to find them"],
          "contentPreferences": ["what content they engage with"],
          "messagingThatResonates": ["messages that work"],
          "lifetimeValueEstimate": "$500-$2,000/year",
          "serviceFrequency": "Annual maintenance + emergency calls",
          "upsellPotential": ["related services they might need"],
          "representativeQuote": "I just need someone reliable who does quality work"
        }
      ],
      "marketInsights": {
        "estimatedMarketSize": "Qualitative estimate of local market",
        "competitionLevel": "high|medium|low",
        "growthTrend": "growing|stable|declining",
        "seasonalPatterns": ["spring rush", "pre-winter prep"]
      },
      "targetingRecommendations": ["specific targeting advice"],
      "messagingRecommendations": ["specific messaging advice"],
      "channelRecommendations": ["specific channel advice"]
    },
    "serpGapAnalysis": {
      "overallOpportunityScore": 65,
      "marketSaturation": "high|medium|low",
      "quickWinCount": 5,
      "serpOpportunities": [
        {
          "keyword": "target keyword phrase",
          "searchIntent": "informational|navigational|commercial|transactional",
          "difficulty": "easy|medium|hard",
          "opportunityScore": 75,
          "rationale": "Why this is an opportunity",
          "competitorWeaknesses": [
            {
              "competitorName": "Competitor Name",
              "competitorUrl": "their page URL",
              "weaknessType": "thin_content|outdated|missing_title_keywords|slow_load|missing_schema|no_faq",
              "description": "Description of the weakness",
              "severity": "high|medium|low",
              "exploitableBy": "Create 2,000+ word page with FAQ schema"
            }
          ],
          "recommendedContentType": "hub_page|spoke_page|location_page|blog_post|faq_page",
          "recommendedWordCount": 1800,
          "contentAngle": "Unique angle to differentiate",
          "targetUrl": "/recommended-url-path",
          "titleTagRecommendation": "Exact title tag",
          "metaDescriptionRecommendation": "Exact meta description",
          "schemaRecommendations": ["FAQPage", "Service"],
          "estimatedMonthlySearches": "100-500",
          "estimatedTimeToRank": "1-3 months"
        }
      ],
      "topicCoverageGaps": [
        {
          "topic": "Topic competitors cover that client doesn't",
          "competitorsCovering": ["Competitor 1", "Competitor 2"],
          "searchIntent": "commercial",
          "priority": "high|medium|low",
          "recommendedContentFormat": "Spoke page with FAQ section",
          "suggestedTitle": "Exact suggested title",
          "estimatedWordCount": 1800,
          "relatedKeywords": ["keyword 1", "keyword 2"]
        }
      ],
      "contentFreshnessGaps": [
        {
          "topic": "Topic with outdated competitor content",
          "competitorWithOutdatedContent": "Competitor Name",
          "lastUpdatedEstimate": "1+ year ago",
          "currentCompetitorPosition": "Top 5",
          "opportunityDescription": "Why this is an opportunity",
          "recommendedAction": "Create fresh, comprehensive content"
        }
      ],
      "technicalGaps": [
        {
          "gapType": "schema|speed|mobile|ssl|structured_data|robots|sitemap|meta_tags",
          "description": "Description of the technical gap",
          "competitorsWithAdvantage": ["competitors who have this"],
          "clientCurrentStatus": "Client's current status",
          "recommendedFix": "Exact fix to implement",
          "implementationPriority": "high|medium|low",
          "estimatedImpact": "Expected improvement"
        }
      ],
      "competitorWeaknessSummary": [
        {
          "competitor": "Competitor Name",
          "weaknessCount": 4,
          "primaryWeaknesses": ["thin content", "no schema", "outdated"],
          "exploitationStrategy": "How to beat this competitor"
        }
      ],
      "quickWinActions": [
        {
          "action": "Specific action to take",
          "targetKeyword": "keyword to target",
          "competitorToOutrank": "Competitor Name",
          "estimatedEffort": "easy|medium|hard",
          "estimatedTimeToRank": "1-3 months",
          "rationale": "Why this is a quick win"
        }
      ],
      "longTermOpportunities": [
        {
          "opportunity": "Description of long-term opportunity",
          "timeframe": "3-6 months",
          "investmentLevel": "low|medium|high",
          "expectedReturn": "Expected outcome"
        }
      ]
    },
    "suggestedKeywords": [
      {
        "keyword": "exact keyword phrase",
        "intent": "informational|navigational|commercial|transactional",
        "pageTarget": "Which page should target this",
        "currentlyRanking": false,
        "priority": "high|medium|low"
      }
    ],
    "quickWins": [
      {
        "action": "SPECIFIC action with exact details",
        "impact": "high|medium|low",
        "effort": "easy|medium|hard",
        "category": "GBP|On-Page SEO|Technical SEO|Content|Schema|AEO|Local SEO|Entity Optimization",
        "implementation": "Step-by-step how to implement",
        "timeframe": "Immediate|This week|This month"
      }
    ],
    "seoTechnical": {
      "metaTitleTemplate": "Recommended format with [variables]",
      "metaDescriptionTemplate": "Recommended format with [variables]",
      "robotsTxtStatus": "found|missing|incomplete",
      "robotsTxtRecommendations": ["specific directives to add"],
      "llmsTxtStatus": "found|missing",
      "llmsTxtRecommendations": "Exact content to include for llms.txt file",
      "missingSchemaTypes": ["specific schema with required properties"],
      "canonicalIssues": ["specific issues found"]
    },
    "aeoStrategy": {
      "currentReadiness": "high|medium|low",
      "entityFirstScore": 0-100,
      "entityAssessment": {
        "brandNameInFirstParagraph": true|false,
        "authorAttribution": true|false,
        "sameAsReferences": ["platforms found"],
        "missingSameAs": ["platforms to add"],
        "redundantEntityMentions": true|false,
        "expertiseSignalsFound": ["credentials, certifications found"],
        "authoritySignalsMissing": ["what to add"]
      },
      "schemaReadiness": {
        "faqSchemaPresent": true|false,
        "howToSchemaPresent": true|false,
        "localBusinessSchemaComplete": true|false,
        "articleSchemaPresent": true|false,
        "missingSchemaOpportunities": ["specific schemas to add"]
      },
      "faqOpportunities": [
        {
          "question": "Exact question to add",
          "answer": "Recommended answer structure (2-3 sentences)",
          "targetPage": "Where to add it",
          "schemaReady": true
        }
      ],
      "speakableContent": ["Content sections good for voice search"],
      "citableStatements": ["Quotable expertise statements to add"],
      "contentStructureRecommendations": ["Specific formatting improvements for AI readability"],
      "aeoComplianceChecklist": {
        "brandInFirstParagraph": true|false,
        "twoSameAsReferences": true|false,
        "schemaCompatibleFormatting": true|false,
        "authorAttribution": true|false,
        "redundantEntityMentions": true|false,
        "internalTopicClusterLinks": true|false,
        "backedClaimsWithCitations": true|false,
        "h1WithPrimaryTopic": true|false,
        "dateModifiedVisible": true|false,
        "overallScore": 0-100,
        "recommendations": ["specific items to fix"]
      }
    },
    "hubSpokeAnalysis": {
      "overallScore": 0-100,
      "hasHubPages": true|false,
      "hubPages": [
        {
          "topic": "Main topic this hub covers",
          "currentUrl": "/url-if-exists or null",
          "status": "missing|thin|adequate|strong",
          "currentWordCount": 0,
          "targetWordCount": 4000,
          "spokeCount": 0,
          "targetSpokeCount": 10,
          "recommendations": ["specific improvements"]
        }
      ],
      "spokePages": [
        {
          "topic": "Spoke topic",
          "parentHub": "Which hub this supports",
          "currentUrl": "/url-if-exists or null",
          "status": "missing|thin|adequate|strong",
          "currentWordCount": 0,
          "targetWordCount": 1800,
          "hasHubLink": true|false,
          "hasCrossLinks": true|false,
          "recommendations": ["specific improvements"]
        }
      ],
      "missingHubTopics": [
        {
          "topic": "Recommended hub topic",
          "rationale": "Why this hub is needed",
          "suggestedSpokes": ["8-12 spoke topics to support it"],
          "primaryKeyword": "Target keyword for hub",
          "searchIntent": "What users searching this want"
        }
      ],
      "internalLinkingScore": 0-100,
      "internalLinkingIssues": ["specific linking gaps"],
      "contentJourneyCoverage": {
        "awareness": "strong|adequate|weak|missing",
        "consideration": "strong|adequate|weak|missing",
        "decision": "strong|adequate|weak|missing",
        "gaps": ["specific journey stage content missing"]
      }
    },
    "servicePageStrategy": [
      {
        "service": "Service name",
        "currentStatus": "missing|thin|adequate|strong",
        "currentWordCount": 0,
        "recommendedUrl": "/exact-url-path",
        "titleTag": "Exact title tag (under 60 chars)",
        "metaDescription": "Exact meta description (under 160 chars)",
        "h1": "Exact H1 tag",
        "targetKeywords": ["primary", "secondary", "long-tail"],
        "contentSections": ["intro (400-500 words)", "section 1", "section 2", "FAQ (6 questions)", "CTA"],
        "wordCountTarget": 1800,
        "schemaTypes": ["Service", "FAQPage"],
        "internalLinks": {
          "toHub": "Hub page to link to",
          "toSpokes": ["related spoke pages"],
          "fromPages": ["pages that should link here"]
        },
        "externalLinkSuggestions": ["2 high-authority external link topics"]
      }
    ],
    "locationPageStrategy": [
      {
        "location": "City, State",
        "currentStatus": "missing|thin|adequate",
        "currentWordCount": 0,
        "recommendedUrl": "/exact-url-path",
        "titleTag": "Exact title tag",
        "metaDescription": "Exact meta description",
        "h1": "Exact H1 tag",
        "localKeywords": ["keyword 1", "keyword 2"],
        "contentAngle": "Unique angle for this location",
        "wordCountTarget": 1800,
        "contentSections": ["local intro", "service details", "area-specific info", "FAQ (6 questions)", "testimonials section"],
        "nearbyAreas": ["areas to mention for semantic relevance"],
        "localProofPoints": ["local testimonials, projects, landmarks to reference"],
        "schemaTypes": ["LocalBusiness", "Service with areaServed"]
      }
    ],
    "priorityRecommendations": [
      {
        "priority": 1,
        "action": "Specific action",
        "category": "Hub Content|Spoke Content|AEO|Technical SEO|Local SEO",
        "rationale": "Why this is priority",
        "expectedImpact": "What improvement to expect"
      }
    ],
    "riskFactors": [
      {
        "risk": "Specific risk or issue",
        "severity": "high|medium|low",
        "mitigation": "How to address it"
      }
    ]
  },
  "dataQualityScore": 0-100,
  "warnings": []
}

Each category field MUST follow this structure:
{
  "value": <the inferred value>,
  "source": "<data source>",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation"
}`;

/**
 * Field definitions for each category
 */
const CATEGORY_FIELDS = {
  businessContext: [
    { name: 'companyName', type: 'string', required: true },
    { name: 'yearsInBusiness', type: 'number|null', required: false },
    { name: 'teamSize', type: 'string|null', options: ['Solo', '2-5', '6-10', '11-25', '26-50', '50+'] },
    { name: 'primaryIndustry', type: 'string', required: true },
    { name: 'businessDescription', type: 'string', required: true },
    { name: 'uniqueSellingPoints', type: 'string[]', required: true },
    { name: 'targetAudience', type: 'string', required: true },
    { name: 'competitiveAdvantages', type: 'string[]', required: true },
    { name: 'businessModel', type: 'string', options: ['B2B', 'B2C', 'B2B2C', 'D2C'] },
    { name: 'seasonality', type: 'string|null', required: false },
  ],
  revenueServices: [
    { name: 'primaryServices', type: 'string[]', required: true },
    { name: 'secondaryServices', type: 'string[]', required: false },
    { name: 'serviceDeliveryMethod', type: 'string[]', options: ['On-site', 'In-store', 'Online', 'Hybrid'] },
    { name: 'averageTransactionValue', type: 'string|null', required: false },
    { name: 'pricingModel', type: 'string', options: ['Fixed', 'Hourly', 'Project-based', 'Subscription', 'Mixed'] },
    { name: 'topRevenueServices', type: 'string[]', required: false },
    { name: 'serviceAreaType', type: 'string', options: ['Local', 'Regional', 'National', 'International'] },
    { name: 'serviceRadius', type: 'string|null', required: false },
    { name: 'clientRetentionRate', type: 'string|null', required: false },
    { name: 'referralPercentage', type: 'string|null', required: false },
    { name: 'upsellOpportunities', type: 'string[]', required: false },
    { name: 'recurringRevenueServices', type: 'string[]', required: false },
  ],
  localSEO: [
    { name: 'gbpStatus', type: 'string', options: ['claimed', 'unclaimed', 'not_found', 'unknown'] },
    { name: 'gbpCompleteness', type: 'number', range: '0-100' },
    { name: 'gbpRating', type: 'number|null', range: '0-5' },
    { name: 'gbpReviewCount', type: 'number|null', required: false },
    { name: 'gbpCategories', type: 'string[]', required: false },
    { name: 'gbpPhotosCount', type: 'number|null', required: false },
    { name: 'primaryServiceArea', type: 'string', required: true },
    { name: 'serviceAreas', type: 'string[]', required: false },
    { name: 'napConsistency', type: 'number', range: '0-100' },
    { name: 'citationScore', type: 'number|null', range: '0-100' },
  ],
  websiteReadiness: [
    { name: 'websiteUrl', type: 'string', required: true },
    { name: 'cms', type: 'string|null', options: ['WordPress', 'Wix', 'Squarespace', 'Shopify', 'Custom', 'Unknown'] },
    { name: 'hasSsl', type: 'boolean', required: true },
    { name: 'isMobileResponsive', type: 'boolean', required: true },
    { name: 'hasStructuredData', type: 'boolean', required: true },
    { name: 'schemaTypes', type: 'string[]', required: false },
    { name: 'pageCount', type: 'number|null', required: false },
    { name: 'hasServicePages', type: 'boolean', required: true },
    { name: 'servicePageCount', type: 'number|null', required: false },
    { name: 'hasBlogSection', type: 'boolean', required: true },
    { name: 'blogPostCount', type: 'number|null', required: false },
    { name: 'hasLocationPages', type: 'boolean', required: false },
    { name: 'locationPageCount', type: 'number|null', required: false },
    { name: 'hasHubPages', type: 'boolean', required: false },
    { name: 'hubPageCount', type: 'number|null', required: false },
    { name: 'averagePageWordCount', type: 'string', options: ['Thin (<1000)', 'Adequate (1000-1500)', 'Strong (1500-2200)', 'Comprehensive (2200+)'] },
    { name: 'hasRobotsTxt', type: 'boolean', required: true },
    { name: 'hasLlmsTxt', type: 'boolean', required: true },
    { name: 'loadSpeed', type: 'string|null', options: ['Fast', 'Average', 'Slow'] },
    { name: 'seoScore', type: 'number|null', range: '0-100' },
    { name: 'contentDepthScore', type: 'number|null', range: '0-100' },
  ],
  toneVoice: [
    { name: 'brandTone', type: 'string', options: ['Professional', 'Friendly', 'Authoritative', 'Casual', 'Technical', 'Warm'] },
    { name: 'writingStyle', type: 'string', options: ['Formal', 'Conversational', 'Technical', 'Storytelling'] },
    { name: 'keyMessaging', type: 'string[]', required: true },
    { name: 'brandPersonality', type: 'string[]', required: true },
    { name: 'targetEmotions', type: 'string[]', required: false },
    { name: 'communicationStyle', type: 'string', options: ['Direct', 'Nurturing', 'Educational', 'Persuasive'] },
    { name: 'industryJargonLevel', type: 'string', options: ['None', 'Moderate', 'Heavy'] },
    { name: 'callToActionStyle', type: 'string', options: ['Urgent', 'Soft', 'Value-focused', 'Trust-building'] },
  ],
  conversionMeasurement: [
    { name: 'primaryConversionGoal', type: 'string', options: ['Phone calls', 'Form submissions', 'Purchases', 'Appointments', 'Quote requests'] },
    { name: 'secondaryConversionGoals', type: 'string[]', required: false },
    { name: 'currentTrackingSetup', type: 'string[]', options: ['Google Analytics', 'GTM', 'Facebook Pixel', 'None detected'] },
    { name: 'phoneTrackingStatus', type: 'boolean|null', required: false },
    { name: 'formTrackingStatus', type: 'boolean|null', required: false },
    { name: 'currentLeadVolume', type: 'string|null', required: false },
    { name: 'conversionRate', type: 'string|null', required: false },
    { name: 'customerJourneyLength', type: 'string', options: ['Same day', '1-7 days', '1-4 weeks', '1-3 months', '3+ months'] },
  ],
  aiConsiderations: [
    { name: 'aiSearchVisibility', type: 'string', options: ['High', 'Medium', 'Low', 'Unknown'] },
    { name: 'contentDepth', type: 'string', options: ['Comprehensive', 'Moderate', 'Basic', 'Minimal'] },
    { name: 'expertiseSignals', type: 'string[]', required: false },
    { name: 'trustSignals', type: 'string[]', required: false },
    { name: 'authorshipClarity', type: 'boolean', required: true },
    { name: 'contentFreshness', type: 'string', options: ['Current', 'Dated', 'Mixed', 'Unknown'] },
    { name: 'citationWorthiness', type: 'string', options: ['High', 'Medium', 'Low'] },
    { name: 'llmReadinessScore', type: 'number', range: '0-100' },
    { name: 'entityFirstScore', type: 'number', range: '0-100' },
    { name: 'hasSameAsReferences', type: 'boolean', required: false },
    { name: 'sameAsPlatforms', type: 'string[]', required: false },
    { name: 'hasAuthorBio', type: 'boolean', required: false },
    { name: 'hasCredentials', type: 'boolean', required: false },
    { name: 'aeoComplianceScore', type: 'number', range: '0-100' },
    { name: 'hubSpokeScore', type: 'number', range: '0-100' },
  ],
};

/**
 * Build the field requirements section of the prompt
 */
function buildFieldRequirements(): string {
  let requirements = '\n\n## Field Requirements by Category\n\n';

  for (const [category, fields] of Object.entries(CATEGORY_FIELDS)) {
    requirements += `### ${formatCategoryName(category)}\n`;
    for (const field of fields) {
      let fieldDesc = `- **${field.name}** (${field.type})`;
      if (field.options) {
        fieldDesc += ` - Options: ${field.options.join(', ')}`;
      }
      if ('range' in field && field.range) {
        fieldDesc += ` - Range: ${field.range}`;
      }
      requirements += fieldDesc + '\n';
    }
    requirements += '\n';
  }

  return requirements;
}

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    businessContext: 'Business Context (10 fields)',
    revenueServices: 'Revenue & Services (12 fields)',
    localSEO: 'Local SEO (10 fields)',
    websiteReadiness: 'Website Readiness (20 fields - includes Hub+Spoke assessment)',
    toneVoice: 'Tone & Voice (8 fields)',
    conversionMeasurement: 'Conversion & Measurement (8 fields)',
    aiConsiderations: 'AI & AEO Considerations (15 fields - includes Entity-First assessment)',
  };
  return names[category] || category;
}

/**
 * Format research data into context for Claude
 */
export function buildDataContext(input: AIAnalysisInput): string {
  let context = '# Research Data for Analysis\n\n';

  // Basic business info
  context += '## Business Information\n';
  context += `- Business Name: ${input.businessName}\n`;
  context += `- Website: ${input.website}\n`;
  if (input.city) context += `- City: ${input.city}\n`;
  if (input.state) context += `- State: ${input.state}\n`;
  if (input.industry) context += `- Industry: ${input.industry}\n`;
  context += '\n';

  // Google Business Profile data
  if (input.gbp && Object.keys(input.gbp).length > 0) {
    context += '## Google Business Profile Data\n';
    context += '```json\n' + JSON.stringify(input.gbp, null, 2) + '\n```\n\n';
  } else {
    context += '## Google Business Profile Data\nNo GBP data available - recommend claiming/optimizing GBP.\n\n';
  }

  // Sitemap data - raw URLs for AI to categorize
  if (input.sitemap && Object.keys(input.sitemap).length > 0) {
    context += '## Sitemap Data (Raw URLs)\n';
    context += '**IMPORTANT:** You must analyze these URLs and categorize them based on URL patterns AND titles.\n';
    context += 'Do NOT rely on pre-categorized data - analyze each URL yourself.\n\n';
    context += '```json\n' + JSON.stringify(input.sitemap, null, 2) + '\n```\n\n';
  } else {
    context += '## Sitemap Analysis\nNo sitemap found - this is a technical SEO issue to address.\n\n';
  }

  // Website crawl data - enriched pages with content, headings, and categorization
  if (input.websiteCrawl && Object.keys(input.websiteCrawl).length > 0) {
    context += '## Website Crawl Data (Enriched Pages)\n';
    context += '**Each page includes enriched data fields:**\n';
    context += '- `pageType`: Pre-categorized as service/blog/location/about/faq/contact/portfolio/other — verify against title and content\n';
    context += '- `contentPreview`: First 1,500 chars of actual page text — use for tone/voice analysis, USP extraction, team info, credentials\n';
    context += '- `headings`: H1 and H2 tags — assess content structure, keyword targeting, topical depth\n';
    context += '- `internalLinkCount` / `externalLinkCount`: Link counts — assess Hub+Spoke internal linking health\n';
    context += '- `schemaTypes`: Per-page schema.org types found — evaluate AEO compliance per page\n\n';
    context += '**Analysis guidance:**\n';
    context += '- From `contentPreview`: Extract tone, messaging themes, USPs, team info, credentials, years in business\n';
    context += '- From `headings`: Assess content structure, H1 keyword targeting, topical depth per page\n';
    context += '- From `schemaTypes`: Evaluate AEO compliance per page, identify schema gaps\n';
    context += '- From link counts: Assess Hub+Spoke internal linking, identify orphan pages (low internal links)\n';
    context += '- Service pages may NOT have "service" in the URL — verify `pageType` against title and content\n\n';
    context += '```json\n' + JSON.stringify(input.websiteCrawl, null, 2) + '\n```\n\n';
  } else {
    context += '## Website Crawl Data\nNo website crawl data available.\n\n';
  }

  // Competitors data
  if (input.competitors && input.competitors.length > 0) {
    context += '## Competitor Analysis\n';
    context += 'Use this data to identify competitive gaps and opportunities.\n';
    context += '```json\n' + JSON.stringify(input.competitors, null, 2) + '\n```\n\n';
  } else {
    context += '## Competitor Analysis\nNo competitor data available.\n\n';
  }

  // SEO audit data
  if (input.seoAudit && Object.keys(input.seoAudit).length > 0) {
    context += '## SEO Audit Results\n';
    context += '```json\n' + JSON.stringify(input.seoAudit, null, 2) + '\n```\n\n';
  } else {
    context += '## SEO Audit Results\nNo SEO audit data available.\n\n';
  }

  // Citations data
  if (input.citations && input.citations.length > 0) {
    context += '## Business Citations\n';
    context += '```json\n' + JSON.stringify(input.citations, null, 2) + '\n```\n\n';
  } else {
    context += '## Business Citations\nNo citation data available - recommend citation audit.\n\n';
  }

  // Manual input from verification (user-provided data)
  if (input.manualInput && Object.keys(input.manualInput).length > 0) {
    context += '## USER-VERIFIED DATA (HIGH CONFIDENCE)\n';
    context += '**IMPORTANT:** The following data was provided directly by the business owner/agency.\n';
    context += 'Use this data with HIGH CONFIDENCE (0.95+) for the corresponding fields.\n';
    context += 'This overrides any conflicting inferences from other data sources.\n\n';
    context += '```json\n' + JSON.stringify(input.manualInput, null, 2) + '\n```\n\n';
  }

  // Detailed analysis instructions
  context += '---\n\n';
  context += '# Analysis Instructions\n\n';
  context += '## Required Analysis\n\n';
  context += '1. **Infer all 68+ intake fields** with confidence scores\n';
  context += '2. **Identify specific content gaps** - be exact about what pages/content are missing\n';
  context += '3. **Provide implementable quick wins** - not generic advice\n';
  context += '4. **Assess Hub+Spoke content architecture** - evaluate content depth and structure\n';
  context += '5. **Evaluate AEO/Entity-First compliance** - score against AEO checklist\n\n';

  context += '## CRITICAL: Extract These Fields FROM WEBSITE DATA (High Confidence)\n\n';
  context += 'The following fields MUST be extracted directly from the scraped website content.\n';
  context += 'If found on the website, assign confidence 0.85+ (not low confidence).\n';
  context += '**Use the enriched `contentPreview`, `headings`, and `schemaTypes` fields for direct extraction.**\n\n';

  context += '### From Service Area / Location Pages:\n';
  context += '- **serviceAreas**: Look for pages listing counties, cities, neighborhoods served\n';
  context += '- **primaryServiceArea**: The main geographic focus area\n';
  context += '- **serviceRadius**: If explicitly stated (e.g., "serving 50-mile radius")\n';
  context += 'Common patterns: footer location lists, dedicated "Service Areas" or "Areas We Serve" pages, location dropdowns\n\n';

  context += '### From Team / About / Staff Pages:\n';
  context += '- **teamSize**: COUNT the team members shown on team/staff/about pages\n';
  context += '- **yearsInBusiness**: Look for "established", "since", "X years of experience", founding date\n';
  context += '- **expertiseSignals**: Certifications, licenses, credentials mentioned\n';
  context += 'Common patterns: "Our Team", "Meet the Team", "About Us", team member cards/photos\n\n';

  context += '### From Website Copy (Use `contentPreview` for Tone & Voice):\n';
  context += '- **brandTone**: Analyze `contentPreview` text across pages (Professional/Friendly/Authoritative/Casual/Warm)\n';
  context += '- **writingStyle**: Is it Formal, Conversational, Technical, or Educational? Check `contentPreview` for writing patterns\n';
  context += '- **keyMessaging**: What themes repeat across `contentPreview` and `headings.h1`/`headings.h2`?\n';
  context += 'Analyze: `contentPreview` from homepage, about, and service pages for tone and messaging themes\n\n';

  context += '### From Homepage / About / Service Pages:\n';
  context += '- **uniqueSellingPoints**: What do they emphasize as differentiators?\n';
  context += '- **primaryServices**: Main services prominently featured\n';
  context += '- **secondaryServices**: Additional/supporting services mentioned\n';
  context += '- **businessDescription**: Synthesize from about page and homepage\n';
  context += 'Look for: "Why Choose Us", "What Makes Us Different", featured services, hero sections\n\n';

  context += '### From Competitor Comparison:\n';
  context += '- **competitiveAdvantages**: Compare client services/features vs competitors\n';
  context += '  - What does the client offer that competitors do NOT?\n';
  context += '  - What certifications/credentials does client have that competitors lack?\n';
  context += '  - Better reviews? More services? Unique specializations?\n\n';

  context += '### Industry + Region Inference:\n';
  context += '- **seasonality**: Infer from industry norms + geographic location\n';
  context += '  - Home services in cold climates = winter slowdown\n';
  context += '  - Real estate follows seasonal patterns (spring/summer peak)\n';
  context += '  - HVAC = summer AC rush, winter heating rush\n';
  context += '  - Landscaping = spring-fall peak, winter slowdown\n';
  context += 'Use industry knowledge + the city/state provided to infer seasonality with 0.7+ confidence\n\n';

  context += '### Fields That REQUIRE Manual Input (Low Confidence OK):\n';
  context += 'These cannot be found on websites - low confidence is expected:\n';
  context += '- referralPercentage, clientRetentionRate, averageTransactionValue\n';
  context += '- currentLeadVolume, conversionRate\n';
  context += '- All conversion/measurement tracking details\n\n';

  context += '## SEO Analysis Requirements\n\n';
  context += 'For each page analyzed, note:\n';
  context += '- Current meta title (if found) and recommended improvement\n';
  context += '- Current meta description (if found) and recommended improvement\n';
  context += '- Estimated word count and whether it meets standards (spoke: 1,500-2,200, hub: 3,000-5,000)\n';
  context += '- Missing schema markup with exact properties needed\n';
  context += '- robots.txt status and recommended directives\n';
  context += '- llms.txt status and recommended content\n\n';

  context += '## Hub+Spoke Content Analysis\n\n';
  context += 'Evaluate the content architecture against Hub+Spoke methodology.\n';
  context += '**Use `internalLinkCount` and `externalLinkCount` per page to assess linking health.**\n';
  context += 'Pages with high internal links (8+) may be hubs; pages with low internal links (<3) may be orphans.\n\n';
  context += '**Hub Page Standards (Pillar Content):**\n';
  context += '- Word count: 3,000-5,000 words\n';
  context += '- Covers main topic comprehensively\n';
  context += '- Links to 8-12 supporting spoke pages\n';
  context += '- Table of contents with anchor links\n';
  context += '- Strong conversion elements\n\n';
  context += '**Spoke Page Standards (Supporting Content):**\n';
  context += '- Word count: 1,500-2,200 words\n';
  context += '- Introduction: 400-500 words\n';
  context += '- 4-6 main sections: 300-400 words each\n';
  context += '- FAQ section: 6 questions\n';
  context += '- Conclusion with CTA: 200-300 words\n';
  context += '- 2+ internal links (to hub and other spokes)\n';
  context += '- 2+ external high-authority links\n';
  context += '- Max 2 bulleted lists per page\n\n';
  context += '**Content Journey Coverage:**\n';
  context += '- Awareness stage content (educational, problem identification)\n';
  context += '- Consideration stage content (solution comparison, how-to)\n';
  context += '- Decision stage content (commercial, transactional)\n\n';

  context += '## CRITICAL: Page Categorization (Verify Pre-Categorized `pageType`)\n\n';
  context += '**Each page has a pre-categorized `pageType` field. Verify it against title, headings, and contentPreview.**\n';
  context += 'The `pageType` uses URL+title heuristics and may misclassify some pages.\n\n';
  context += '### Service Page Indicators (in title):\n';
  context += '- Contains service name: "HVAC Repair", "Plumbing Services", "Home Inspection"\n';
  context += '- Action words: "Repair", "Installation", "Maintenance", "Cleaning"\n';
  context += '- Location + Service: "Phoenix AC Repair", "Dallas Plumbing"\n';
  context += '- May be at URLs like: /hvac, /plumbing, /what-we-do, /our-services, /solutions\n\n';
  context += '### Blog/Article Indicators (in title):\n';
  context += '- Question format: "How to...", "What is...", "Why..."\n';
  context += '- Educational: "Guide to...", "Tips for...", "Understanding..."\n';
  context += '- Date references in title or URL\n';
  context += '- May be at: /blog, /news, /articles, /resources, /tips, /guides\n\n';
  context += '### Location Page Indicators:\n';
  context += '- City/State in title: "Services in Phoenix, AZ"\n';
  context += '- Area references: "Serving the Greater Phoenix Area"\n';
  context += '- May be at: /locations, /service-areas, /[city-name]\n\n';
  context += '### Other Page Types:\n';
  context += '- About: Company info, team, history\n';
  context += '- Contact: Contact forms, phone, address\n';
  context += '- Portfolio/Gallery: Past work, projects, case studies\n';
  context += '- FAQ: Frequently asked questions\n';
  context += '- Pricing: Rates, costs, quotes\n\n';
  context += '**Count and report actual page types based on your analysis.**\n\n';

  context += '## Service Page Analysis\n\n';
  context += 'For each service mentioned in GBP or website:\n';
  context += '- Does a dedicated page exist? (Match by TITLE, not just URL)\n';
  context += '- What is the estimated word count? (Flag if under 1,000 as "thin")\n';
  context += '- If yes: Does it meet spoke page standards? What\'s missing?\n';
  context += '- If no: Provide exact page spec following spoke page structure\n';
  context += '- Is it properly linked to a hub page?\n\n';

  context += '## Location Page Analysis\n\n';
  context += 'Based on service areas mentioned:\n';
  context += '- Are there location-specific pages?\n';
  context += '- Do they meet word count standards (1,500-2,200 words)?\n';
  context += '- What locations need dedicated pages?\n';
  context += '- Provide exact specs for each recommended location page\n\n';

  context += '## AEO (Answer Engine Optimization) Analysis\n\n';
  context += 'Evaluate using Entity-First AEO Standards.\n';
  context += '**Use per-page `schemaTypes` to assess schema compliance. Use `contentPreview` to check entity-first formatting.**\n\n';
  context += '**Entity-First Checklist (score each page):**\n';
  context += '- [ ] Brand/business name in first paragraph\n';
  context += '- [ ] 2+ sameAs platform references (LinkedIn, YouTube, etc.)\n';
  context += '- [ ] Schema-compatible formatting (FAQ, HowTo, Article structures)\n';
  context += '- [ ] Author/expert attribution with credentials\n';
  context += '- [ ] Redundant entity mentions (3-5 natural mentions)\n';
  context += '- [ ] Internal topic cluster links (hub-spoke connections)\n';
  context += '- [ ] Backed claims with citations/evidence\n';
  context += '- [ ] H1 with primary topic keyword\n';
  context += '- [ ] Date/Modified date visible\n\n';
  context += '**Authority Signals to Look For:**\n';
  context += '- Expert attribution: "Based on insights from [Name]..."\n';
  context += '- Credentials: certifications, licenses, years in business\n';
  context += '- Data/evidence: statistics, case studies, results\n';
  context += '- Original content signals: "According to our experience..."\n\n';
  context += '**Schema-Informed Content Evaluation:**\n';
  context += '- FAQPage: Are there 5-10 Q&As formatted for FAQ schema?\n';
  context += '- HowTo: Are process-based services structured with steps and time estimates?\n';
  context += '- LocalBusiness: Is all business info complete (priceRange, areaServed, etc.)?\n';
  context += '- Article/BlogPosting: Author, datePublished, dateModified present?\n\n';

  context += '## llms.txt Recommendations\n\n';
  context += 'If llms.txt is missing or incomplete, recommend content including:\n';
  context += '- Business name and description\n';
  context += '- Primary services offered\n';
  context += '- Key expertise areas and credentials\n';
  context += '- Geographic service areas\n';
  context += '- Contact preference\n';
  context += '- Links to main content hubs\n\n';

  context += '## Output Reminder\n';
  context += 'Respond with valid JSON only. Be SPECIFIC in all recommendations.\n';
  context += 'Include word counts, exact URLs, exact title/meta tags.\n';
  context += 'Score content against Hub+Spoke and AEO standards.\n';

  return context;
}

/**
 * Build the complete system prompt with field requirements
 */
export function buildSystemPrompt(): string {
  return SYSTEM_PROMPT + buildFieldRequirements();
}

/**
 * Estimate the token count for a prompt
 */
export function estimatePromptTokens(systemPrompt: string, dataContext: string): number {
  const totalChars = systemPrompt.length + dataContext.length;
  // Rough estimate: ~4 characters per token
  return Math.ceil(totalChars / 4);
}
