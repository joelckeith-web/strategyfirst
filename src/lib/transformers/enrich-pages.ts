/**
 * Shared page enrichment utilities for website crawl results.
 * Used by both the trigger route (initial crawl) and full-scrape endpoint.
 */

import type { WebsiteCrawlerResult } from '@/lib/apify';

// ============================================================
// Page Data Extraction Helpers
// ============================================================

/**
 * Categorize a page by its URL path and title
 */
export function categorizePageByTitleAndUrl(url: string, title: string): string {
  const lowerUrl = url.toLowerCase();
  const lowerTitle = title.toLowerCase();

  // Blog/article indicators
  if (
    lowerUrl.includes('/blog') ||
    lowerUrl.includes('/news') ||
    lowerUrl.includes('/article') ||
    lowerUrl.includes('/post') ||
    lowerTitle.match(/^(how to|what is|why |guide to|tips for|understanding|top \d+)/)
  ) {
    return 'blog';
  }

  // Location page indicators
  if (
    lowerUrl.includes('/location') ||
    lowerUrl.includes('/area') ||
    lowerUrl.includes('/service-area') ||
    lowerUrl.match(/\/areas\/[a-z-]+/) ||
    lowerTitle.match(/\bin\s+[A-Z][a-z]+,?\s+[A-Z]{2}\b/i) ||
    lowerTitle.match(/serving (the )?/i)
  ) {
    return 'location';
  }

  // FAQ
  if (lowerUrl.includes('/faq') || lowerTitle.includes('frequently asked') || lowerTitle.includes('faq')) {
    return 'faq';
  }

  // About/team
  if (
    lowerUrl.includes('/about') ||
    lowerUrl.includes('/team') ||
    lowerUrl.includes('/our-story') ||
    lowerUrl.includes('/staff') ||
    lowerTitle.match(/\b(about|our (team|story|staff)|meet the)\b/i)
  ) {
    return 'about';
  }

  // Contact
  if (lowerUrl.includes('/contact') || lowerTitle.match(/\bcontact\b/i)) {
    return 'contact';
  }

  // Portfolio/gallery
  if (
    lowerUrl.includes('/portfolio') ||
    lowerUrl.includes('/gallery') ||
    lowerUrl.includes('/our-work') ||
    lowerUrl.includes('/projects') ||
    lowerTitle.match(/\b(gallery|portfolio|our work|projects|case stud)/i)
  ) {
    return 'portfolio';
  }

  // Service pages — check both URL and title for service indicators
  if (
    lowerUrl.includes('/service') ||
    lowerUrl.includes('/what-we-do') ||
    lowerUrl.includes('/solutions') ||
    lowerTitle.match(/\b(repair|installation|maintenance|cleaning|inspection|service|removal|replacement)\b/i)
  ) {
    return 'service';
  }

  // Homepage
  try {
    const parsed = new URL(url);
    if (parsed.pathname === '/' || parsed.pathname === '') return 'other';
  } catch { /* ignore */ }

  return 'other';
}

/**
 * Extract H1 and H2 headings from HTML
 */
export function extractHeadings(html: string): { h1: string[]; h2: string[] } {
  const h1s: string[] = [];
  const h2s: string[] = [];

  // Match h1 tags - strip inner HTML tags to get text only
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let match;
  while ((match = h1Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) h1s.push(text.slice(0, 200));
  }

  // Match h2 tags
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  while ((match = h2Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) h2s.push(text.slice(0, 200));
  }

  return { h1: h1s.slice(0, 5), h2: h2s.slice(0, 15) };
}

/**
 * Count internal vs external links in HTML
 */
export function countLinks(html: string, domain: string): { internal: number; external: number } {
  let internal = 0;
  let external = 0;

  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    // Skip anchors, mailto, tel, javascript
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }

    try {
      // Relative URLs are internal
      if (href.startsWith('/') || !href.includes('://')) {
        internal++;
        continue;
      }
      const linkDomain = new URL(href).hostname.toLowerCase().replace(/^www\./, '');
      if (linkDomain === normalizedDomain) {
        internal++;
      } else {
        external++;
      }
    } catch {
      // If URL parse fails, skip
    }
  }

  return { internal, external };
}

/**
 * Extract schema.org @type values from ld+json blocks in HTML
 */
export function extractPageSchema(html: string): string[] {
  const types: string[] = [];
  const ldJsonRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let blockMatch;

  while ((blockMatch = ldJsonRegex.exec(html)) !== null) {
    const typeRegex = /"@type"\s*:\s*"([^"]+)"/g;
    let typeMatch;
    while ((typeMatch = typeRegex.exec(blockMatch[1])) !== null) {
      if (!types.includes(typeMatch[1])) {
        types.push(typeMatch[1]);
      }
    }
  }

  return types;
}

// ============================================================
// Enriched Crawl Result
// ============================================================

export interface EnrichedPage {
  url: string;
  title: string;
  description: string;
  estimatedWordCount: number;
  pageType: string;
  contentPreview: string;
  headings: { h1: string[]; h2: string[] };
  internalLinkCount: number;
  externalLinkCount: number;
  schemaTypes: string[];
}

export interface EnrichedCrawlResult {
  cms: string;
  ssl: boolean;
  mobileResponsive: boolean;
  structuredData: boolean;
  schemaTypes: string[];
  title: string;
  description: string;
  totalPages: number;
  pages: EnrichedPage[];
  pageLimitReached: boolean;
}

/**
 * Process raw crawl pages into enriched website crawl data.
 * Used by both the trigger route and the full-scrape endpoint.
 */
export function enrichCrawlResult(
  crawlPages: WebsiteCrawlerResult[],
  websiteUrl: string,
  businessName: string,
  pageLimit?: number
): EnrichedCrawlResult {
  const homePage = crawlPages.find(p => {
    try {
      const url = new URL(p.url);
      return url.pathname === '/' || url.pathname === '';
    } catch {
      return false;
    }
  }) || crawlPages[0];

  // Detect CMS and schema from first few pages only (no need to scan all HTML)
  let cms = 'Unknown';
  let hasStructuredData = false;
  const siteSchemaTypes: string[] = [];

  for (const p of crawlPages.slice(0, 10)) {
    const html = p.html || '';
    if (cms === 'Unknown') {
      if (html.includes('wp-content') || html.includes('wordpress')) cms = 'WordPress';
      else if (html.includes('wix.com')) cms = 'Wix';
      else if (html.includes('squarespace')) cms = 'Squarespace';
      else if (html.includes('shopify')) cms = 'Shopify';
    }
    if (html.includes('application/ld+json')) hasStructuredData = true;
    if (html.includes('LocalBusiness') && !siteSchemaTypes.includes('LocalBusiness')) siteSchemaTypes.push('LocalBusiness');
    if (html.includes('Organization') && !siteSchemaTypes.includes('Organization')) siteSchemaTypes.push('Organization');
    if (html.includes('WebSite') && !siteSchemaTypes.includes('WebSite')) siteSchemaTypes.push('WebSite');
  }

  // Extract domain once for link counting
  let pageDomain = '';
  try { pageDomain = new URL(websiteUrl).hostname; } catch { /* ignore */ }

  // Enrich all pages with content preview and HTML-derived data
  const pages: EnrichedPage[] = crawlPages.map(p => {
    const pageTitle = p.title || '';
    const pageUrl = p.url;
    const hasHtml = !!p.html;

    return {
      url: pageUrl,
      title: pageTitle,
      description: p.metadata?.description || '',
      estimatedWordCount: p.text ? Math.round(p.text.length / 5) : 0,
      pageType: categorizePageByTitleAndUrl(pageUrl, pageTitle),
      contentPreview: p.text ? p.text.slice(0, 1500) : '',
      headings: hasHtml ? extractHeadings(p.html!) : { h1: [], h2: [] },
      internalLinkCount: hasHtml ? countLinks(p.html!, pageDomain).internal : 0,
      externalLinkCount: hasHtml ? countLinks(p.html!, pageDomain).external : 0,
      schemaTypes: hasHtml ? extractPageSchema(p.html!) : [],
    };
  });

  return {
    cms,
    ssl: websiteUrl.startsWith('https'),
    mobileResponsive: true,
    structuredData: hasStructuredData,
    schemaTypes: siteSchemaTypes,
    title: homePage?.title || businessName,
    description: homePage?.metadata?.description || '',
    totalPages: crawlPages.length,
    pages,
    pageLimitReached: pageLimit ? crawlPages.length >= pageLimit : false,
  };
}
