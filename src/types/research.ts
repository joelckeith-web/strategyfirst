/**
 * Types for the Strategy First research data flow
 * Used for n8n webhook integration and form auto-population
 */

// Input from the user in Steps 1-2 of the intake form
export interface ResearchInput {
  businessName: string;
  websiteUrl: string;
  location?: string;
  gbpUrl?: string;
  industry?: string;
  targetKeywords?: string[];
}

// Status of the research session
export type ResearchStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'timeout';

// Individual research step status
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

// Research progress tracking
export interface ResearchProgress {
  currentStep: string;
  completedSteps: string[];
  failedSteps: string[];
  percentage: number;
  estimatedTimeRemaining?: number;
}

// GBP (Google Business Profile) data from n8n
export interface GBPData {
  name: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  phone?: string;
  address?: string;
  website?: string;
  hours?: Record<string, string>;
  photos?: string[];
  attributes?: string[];
  placeId?: string;
  mapsUrl?: string;
}

// Competitor data from n8n
export interface CompetitorData {
  rank: number;
  name: string;
  rating: number;
  reviewCount: number;
  website?: string;
  phone?: string;
  address?: string;
  categories?: string[];
  distance?: string;
  priceLevel?: string;
}

// SEO audit data from n8n
export interface SEOAuditData {
  score: number;
  mobile: {
    score: number;
    usability: boolean;
    viewport: boolean;
    textSize: boolean;
  };
  performance: {
    score: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  technical: {
    ssl: boolean;
    canonicalTag: boolean;
    robotsTxt: boolean;
    sitemap: boolean;
    structuredData: string[];
    metaDescription: boolean;
    h1Tags: number;
  };
  content: {
    wordCount: number;
    headings: number;
    images: number;
    imagesWithAlt: number;
    internalLinks: number;
    externalLinks: number;
  };
}

// Sitemap analysis data
export interface SitemapData {
  totalPages: number;
  pageTypes: Record<string, number>;
  hasServicePages: boolean;
  hasBlog: boolean;
  hasLocationPages: boolean;
  recentlyUpdated: number;
  oldestPage?: string;
  newestPage?: string;
}

// Website crawl data
export interface WebsiteCrawlData {
  cms: string | null;
  technologies: string[];
  ssl: boolean;
  mobileResponsive: boolean;
  structuredData: boolean;
  schemaTypes: string[];
  description: string | null;
  title: string | null;
  pages: {
    url: string;
    title: string;
    wordCount: number;
  }[];
}

// Citation/directory listing data
export interface CitationData {
  source: string;
  found: boolean;
  url?: string;
  napConsistent?: boolean;
  claimed?: boolean;
}

// Complete research results from n8n
export interface ResearchResults {
  gbp: GBPData | null;
  competitors: CompetitorData[];
  seoAudit: SEOAuditData | null;
  sitemap: SitemapData | null;
  websiteCrawl: WebsiteCrawlData | null;
  citations: CitationData[];
  errors: ResearchError[];
  metadata: {
    startedAt: string;
    completedAt: string;
    duration: number;
    dataConfidence: number;
  };
}

// Research error
export interface ResearchError {
  step: string;
  code: string;
  message: string;
  recoverable: boolean;
}

// Full research session stored in memory/database
export interface ResearchSession {
  id: string;
  input: ResearchInput;
  status: ResearchStatus;
  progress: ResearchProgress;
  results: Partial<ResearchResults>;
  errors: ResearchError[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Request to trigger research via n8n webhook
export interface TriggerResearchRequest {
  sessionId: string;
  input: ResearchInput;
  callbackUrl: string;
}

// Response from n8n webhook
export interface TriggerResearchResponse {
  success: boolean;
  message: string;
  executionId?: string;
}

// Callback payload from n8n when step completes
export interface ResearchCallbackPayload {
  sessionId: string;
  step: 'gbp' | 'competitors' | 'seo' | 'sitemap' | 'website' | 'citations' | 'complete';
  status: StepStatus;
  data?: unknown;
  error?: ResearchError;
}

// Mapping research results to intake form fields
export interface FormFieldMapping {
  // Local SEO section (Section 3)
  localSEO: {
    googleBusinessProfileUrl: string;
    gbpCategories: string[];
    currentGoogleRating: number;
    totalReviews: number;
    mainCompetitors: { name: string; website?: string; location?: string }[];
    targetKeywords: string[];
    currentRankingKeywords: string[];
    localDirectoriesListed: string[];
    napConsistencyIssues: string;
    citationSources: string[];
  };
  // Website Readiness section (Section 4)
  websiteReadiness: {
    currentCMS: string;
    hasServicePages: boolean;
    hasLocationPages: boolean;
    hasBlog: boolean;
    blogPostFrequency: string;
    existingContentAssets: string[];
    technicalIssuesKnown: string[];
    mobileResponsive: boolean;
    pageLoadSpeed: 'fast' | 'average' | 'slow' | 'unknown';
    hasSSL: boolean;
  };
}

// Function to map research results to form fields
export function mapResultsToFormFields(results: Partial<ResearchResults>): FormFieldMapping {
  const { gbp, competitors, seoAudit, sitemap, websiteCrawl, citations } = results;

  return {
    localSEO: {
      googleBusinessProfileUrl: gbp?.mapsUrl || '',
      gbpCategories: gbp?.categories || [],
      currentGoogleRating: gbp?.rating || 0,
      totalReviews: gbp?.reviewCount || 0,
      mainCompetitors: (competitors || []).slice(0, 5).map(c => ({
        name: c.name,
        website: c.website,
        location: c.address,
      })),
      targetKeywords: [],
      currentRankingKeywords: [],
      localDirectoriesListed: (citations || [])
        .filter(c => c.found)
        .map(c => c.source),
      napConsistencyIssues: (citations || [])
        .filter(c => c.found && c.napConsistent === false)
        .map(c => c.source)
        .join(', ') || 'None detected',
      citationSources: (citations || []).map(c => c.source),
    },
    websiteReadiness: {
      currentCMS: websiteCrawl?.cms || 'unknown',
      hasServicePages: sitemap?.hasServicePages || false,
      hasLocationPages: sitemap?.hasLocationPages || false,
      hasBlog: sitemap?.hasBlog || false,
      blogPostFrequency: inferBlogFrequency(sitemap?.pageTypes?.blog || 0),
      existingContentAssets: inferContentAssets(sitemap?.pageTypes || {}),
      technicalIssuesKnown: inferTechnicalIssues(seoAudit),
      mobileResponsive: websiteCrawl?.mobileResponsive || seoAudit?.mobile.usability || false,
      pageLoadSpeed: inferPageSpeed(seoAudit?.performance.lcp),
      hasSSL: websiteCrawl?.ssl || seoAudit?.technical.ssl || false,
    },
  };
}

function inferBlogFrequency(blogPages: number): string {
  if (blogPages === 0) return 'never';
  if (blogPages < 5) return 'rarely';
  if (blogPages < 20) return 'monthly';
  if (blogPages < 50) return 'weekly';
  return 'multiple_weekly';
}

function inferContentAssets(pageTypes: Record<string, number>): string[] {
  const assets: string[] = [];
  if ((pageTypes.services || 0) > 0) assets.push('service_pages');
  if ((pageTypes.blog || 0) > 0) assets.push('blog_posts');
  if ((pageTypes.locations || 0) > 0) assets.push('location_pages');
  if ((pageTypes.faq || 0) > 0) assets.push('faq_content');
  if ((pageTypes.about || 0) > 0) assets.push('about_page');
  return assets;
}

function inferTechnicalIssues(seoAudit: SEOAuditData | null | undefined): string[] {
  if (!seoAudit) return [];
  const issues: string[] = [];

  if (!seoAudit.technical.ssl) issues.push('Missing SSL certificate');
  if (!seoAudit.technical.sitemap) issues.push('No XML sitemap');
  if (!seoAudit.technical.robotsTxt) issues.push('Missing robots.txt');
  if (!seoAudit.technical.metaDescription) issues.push('Missing meta descriptions');
  if (seoAudit.technical.h1Tags === 0) issues.push('Missing H1 tags');
  if (seoAudit.mobile.score < 50) issues.push('Poor mobile performance');
  if (seoAudit.performance.lcp > 4000) issues.push('Slow page load (LCP > 4s)');
  if (seoAudit.performance.cls > 0.25) issues.push('Layout shift issues (CLS > 0.25)');

  return issues;
}

function inferPageSpeed(lcp: number | undefined): 'fast' | 'average' | 'slow' | 'unknown' {
  if (lcp === undefined) return 'unknown';
  if (lcp < 2500) return 'fast';
  if (lcp < 4000) return 'average';
  return 'slow';
}
