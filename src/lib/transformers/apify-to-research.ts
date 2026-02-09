/**
 * Transformer functions to convert Apify actor outputs to app types
 */

import type {
  GooglePlacesOutput,
  WebsiteCrawlerOutput,
  SitemapExtractorOutput,
  PageSpeedOutput,
  PageSpeedAudit,
  N8NApifyResults,
} from '@/types/apify-outputs';

import type {
  GBPData,
  CompetitorData,
  WebsiteCrawlData,
  SitemapData,
  SEOAuditData,
  CitationData,
  ResearchResults,
} from '@/types/research';

// ============================================
// Google Places → GBP Data
// ============================================
export function transformGooglePlacesToGBP(input: GooglePlacesOutput): GBPData {
  return {
    name: input.title,
    rating: input.totalScore || 0,
    reviewCount: input.reviewsCount || 0,
    categories: input.categories || [],
    phone: input.phone || undefined,
    address: input.address || undefined,
    website: input.website || undefined,
    hours: input.openingHours
      ? Object.fromEntries(input.openingHours.map(h => [h.day, h.hours]))
      : undefined,
    photos: input.imageUrls || undefined,
    attributes: input.additionalInfo
      ? Object.keys(input.additionalInfo)
      : undefined,
    placeId: input.placeId || undefined,
    mapsUrl: input.url || undefined,
  };
}

// ============================================
// Google Places → Competitor Data
// ============================================
export function transformGooglePlacesToCompetitor(
  input: GooglePlacesOutput,
  rank: number
): CompetitorData {
  return {
    rank,
    name: input.title,
    rating: input.totalScore || 0,
    reviewCount: input.reviewsCount || 0,
    website: input.website || undefined,
    phone: input.phone || undefined,
    address: input.address || undefined,
    categories: input.categories || undefined,
    distance: undefined, // Would need to calculate from lat/lng
    priceLevel: input.price || undefined,
  };
}

export function transformCompetitorGBPs(
  inputs: GooglePlacesOutput[],
  excludeBusinessName?: string
): CompetitorData[] {
  return inputs
    .filter(place => !excludeBusinessName || place.title !== excludeBusinessName)
    .slice(0, 20)
    .map((place, index) => transformGooglePlacesToCompetitor(place, index + 1));
}

// ============================================
// Website Crawler → Website Crawl Data
// ============================================
export function transformWebsiteCrawlerToWebsiteData(
  inputs: WebsiteCrawlerOutput[]
): WebsiteCrawlData {
  const firstPage = inputs[0];
  const allHtml = inputs.map(p => p.html || '').join(' ');
  const allText = inputs.map(p => p.text || '').join(' ');

  return {
    cms: detectCMS(allHtml),
    technologies: detectTechnologies(allHtml),
    ssl: firstPage?.url?.startsWith('https') || false,
    mobileResponsive: detectMobileResponsive(allHtml),
    structuredData: allHtml.includes('application/ld+json'),
    schemaTypes: extractSchemaTypes(allHtml),
    description: firstPage?.description || null,
    title: firstPage?.title || null,
    pages: inputs.slice(0, 150).map(page => ({
      url: page.url,
      title: page.title || '',
      wordCount: (page.text || '').split(/\s+/).filter(Boolean).length,
      contentPreview: (page.text || '').slice(0, 1500),
      pageType: categorizeUrl(page.url),
    })),
  };
}

function detectCMS(html: string): string | null {
  const lowerHtml = html.toLowerCase();

  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wordpress')) return 'WordPress';
  if (lowerHtml.includes('shopify') || lowerHtml.includes('cdn.shopify')) return 'Shopify';
  if (lowerHtml.includes('wix.com') || lowerHtml.includes('wixsite')) return 'Wix';
  if (lowerHtml.includes('squarespace')) return 'Squarespace';
  if (lowerHtml.includes('webflow')) return 'Webflow';
  if (lowerHtml.includes('drupal')) return 'Drupal';
  if (lowerHtml.includes('joomla')) return 'Joomla';
  if (lowerHtml.includes('ghost')) return 'Ghost';
  if (lowerHtml.includes('weebly')) return 'Weebly';
  if (lowerHtml.includes('godaddy')) return 'GoDaddy Website Builder';
  if (lowerHtml.includes('duda')) return 'Duda';
  if (lowerHtml.includes('hubspot')) return 'HubSpot CMS';

  return null;
}

function detectTechnologies(html: string): string[] {
  const technologies: string[] = [];
  const lowerHtml = html.toLowerCase();

  // JavaScript frameworks
  if (lowerHtml.includes('react') || lowerHtml.includes('_next')) technologies.push('React');
  if (lowerHtml.includes('vue') || lowerHtml.includes('vuejs')) technologies.push('Vue.js');
  if (lowerHtml.includes('angular')) technologies.push('Angular');
  if (lowerHtml.includes('jquery')) technologies.push('jQuery');

  // CSS frameworks
  if (lowerHtml.includes('bootstrap')) technologies.push('Bootstrap');
  if (lowerHtml.includes('tailwind')) technologies.push('Tailwind CSS');
  if (lowerHtml.includes('foundation')) technologies.push('Foundation');

  // Analytics
  if (lowerHtml.includes('google-analytics') || lowerHtml.includes('gtag')) technologies.push('Google Analytics');
  if (lowerHtml.includes('gtm.js') || lowerHtml.includes('googletagmanager')) technologies.push('Google Tag Manager');
  if (lowerHtml.includes('facebook.net/en_us/fbevents')) technologies.push('Facebook Pixel');
  if (lowerHtml.includes('hotjar')) technologies.push('Hotjar');

  // Other tools
  if (lowerHtml.includes('recaptcha')) technologies.push('reCAPTCHA');
  if (lowerHtml.includes('cloudflare')) technologies.push('Cloudflare');
  if (lowerHtml.includes('intercom')) technologies.push('Intercom');
  if (lowerHtml.includes('zendesk')) technologies.push('Zendesk');
  if (lowerHtml.includes('mailchimp')) technologies.push('Mailchimp');

  return technologies;
}

function detectMobileResponsive(html: string): boolean {
  const lowerHtml = html.toLowerCase();
  return (
    lowerHtml.includes('viewport') &&
    (lowerHtml.includes('width=device-width') || lowerHtml.includes('responsive'))
  );
}

function extractSchemaTypes(html: string): string[] {
  const schemaTypes: string[] = [];
  const schemaRegex = /"@type"\s*:\s*"([^"]+)"/g;
  let match;

  while ((match = schemaRegex.exec(html)) !== null) {
    if (!schemaTypes.includes(match[1])) {
      schemaTypes.push(match[1]);
    }
  }

  return schemaTypes;
}

// ============================================
// Sitemap Extractor → Sitemap Data
// ============================================
export function transformSitemapToSitemapData(
  input: SitemapExtractorOutput
): SitemapData {
  const urls = input.urls || [];
  const pageTypes: Record<string, number> = {};

  urls.forEach(item => {
    const url = typeof item === 'string' ? item : item.loc;
    const type = categorizeUrl(url);
    pageTypes[type] = (pageTypes[type] || 0) + 1;
  });

  // Count recently updated (within last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentlyUpdated = urls.filter(item => {
    if (typeof item === 'string') return false;
    if (!item.lastmod) return false;
    const lastMod = new Date(item.lastmod);
    return lastMod >= thirtyDaysAgo;
  }).length;

  // Find oldest and newest pages
  const sortedByDate = urls
    .filter(item => typeof item !== 'string' && item.lastmod)
    .sort((a, b) => {
      const dateA = new Date((a as { lastmod?: string }).lastmod || 0);
      const dateB = new Date((b as { lastmod?: string }).lastmod || 0);
      return dateA.getTime() - dateB.getTime();
    });

  return {
    totalPages: input.totalUrls || urls.length,
    pageTypes,
    hasServicePages: (pageTypes['services'] || 0) > 0,
    hasBlog: (pageTypes['blog'] || 0) > 0,
    hasLocationPages: (pageTypes['locations'] || 0) > 0,
    recentlyUpdated,
    oldestPage: sortedByDate[0]
      ? (sortedByDate[0] as { lastmod?: string }).lastmod
      : undefined,
    newestPage: sortedByDate[sortedByDate.length - 1]
      ? (sortedByDate[sortedByDate.length - 1] as { lastmod?: string }).lastmod
      : undefined,
  };
}

function categorizeUrl(url: string): string {
  const lower = url.toLowerCase();

  if (lower.includes('/service') || lower.includes('/what-we-do') || lower.includes('/solutions')) return 'services';
  if (lower.includes('/blog') || lower.includes('/news') || lower.includes('/article') || lower.includes('/post')) return 'blog';
  if (lower.includes('/location') || lower.includes('/area') || lower.includes('/city') || lower.includes('/region')) return 'locations';
  if (lower.includes('/about') || lower.includes('/team') || lower.includes('/our-story')) return 'about';
  if (lower.includes('/contact') || lower.includes('/get-in-touch')) return 'contact';
  if (lower.includes('/faq') || lower.includes('/frequently-asked')) return 'faq';
  if (lower.includes('/testimonial') || lower.includes('/review') || lower.includes('/case-stud')) return 'testimonials';
  if (lower.includes('/product') || lower.includes('/shop') || lower.includes('/store')) return 'products';
  if (lower.includes('/portfolio') || lower.includes('/work') || lower.includes('/project')) return 'portfolio';
  if (lower.includes('/career') || lower.includes('/job') || lower.includes('/hiring')) return 'careers';

  return 'other';
}

// ============================================
// PageSpeed → SEO Audit Data
// ============================================
export function transformPageSpeedToSEOAudit(
  input: PageSpeedOutput,
  websiteUrl: string
): SEOAuditData {
  const lighthouse = input.lighthouseResult;
  const categories = lighthouse?.categories || {};
  const audits = lighthouse?.audits || {};

  return {
    score: Math.round((categories.seo?.score || 0) * 100),
    mobile: {
      score: Math.round((categories.performance?.score || 0) * 100),
      usability: getAuditScore(audits, 'viewport') === 1,
      viewport: getAuditScore(audits, 'viewport') === 1,
      textSize: getAuditScore(audits, 'font-size') >= 0.9,
    },
    performance: {
      score: Math.round((categories.performance?.score || 0) * 100),
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      fid: audits['max-potential-fid']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      ttfb: audits['server-response-time']?.numericValue || 0,
    },
    technical: {
      ssl: websiteUrl.startsWith('https'),
      canonicalTag: getAuditScore(audits, 'canonical') === 1,
      robotsTxt: getAuditScore(audits, 'robots-txt') === 1,
      sitemap: true, // Assume true if we got sitemap data
      structuredData: extractStructuredDataTypes(audits),
      metaDescription: getAuditScore(audits, 'meta-description') === 1,
      h1Tags: countH1Tags(audits),
    },
    content: {
      wordCount: 0, // Would need to get from website crawl
      headings: 0,
      images: countImages(audits),
      imagesWithAlt: countImagesWithAlt(audits),
      internalLinks: 0,
      externalLinks: 0,
    },
  };
}

function getAuditScore(audits: Record<string, { score?: number | null }>, key: string): number {
  return audits[key]?.score ?? 0;
}

function extractStructuredDataTypes(audits: Record<string, PageSpeedAudit>): string[] {
  const structuredDataAudit = audits['structured-data-item'] as PageSpeedAudit & {
    details?: { items?: Array<{ itemType?: string }> }
  };
  if (!structuredDataAudit?.details?.items) return [];
  return structuredDataAudit.details.items
    .map(item => item.itemType)
    .filter((type): type is string => Boolean(type));
}

function countH1Tags(audits: Record<string, PageSpeedAudit>): number {
  // The heading-order audit might give us this info
  return 1; // Default assumption
}

function countImages(audits: Record<string, PageSpeedAudit>): number {
  const imageAudit = audits['image-alt'] as PageSpeedAudit & {
    details?: { items?: unknown[] }
  };
  return imageAudit?.details?.items?.length || 0;
}

function countImagesWithAlt(audits: Record<string, PageSpeedAudit>): number {
  const imageAudit = audits['image-alt'] as PageSpeedAudit & {
    details?: { items?: unknown[] }
  };
  const total = imageAudit?.details?.items?.length || 0;
  const score = imageAudit?.score || 0;
  return Math.round(total * score);
}

// ============================================
// Generate Citation Data (placeholder checks)
// ============================================
export function generateCitationChecks(businessName: string): CitationData[] {
  // List of common citation sources
  const sources = [
    'Yelp',
    'Google Business Profile',
    'Facebook',
    'BBB',
    'Yellow Pages',
    'Angi',
    'HomeAdvisor',
    'Thumbtack',
    'Nextdoor',
    'Apple Maps',
    'Bing Places',
    'Foursquare',
    'MapQuest',
  ];

  // In a real implementation, you'd check each source
  // For now, return placeholder data
  return sources.map(source => ({
    source,
    found: false, // Would be determined by actual check
    url: undefined,
    napConsistent: undefined,
    claimed: undefined,
  }));
}

// ============================================
// Transform All Apify Results
// ============================================
export function transformApifyResultsToResearch(
  apifyResults: N8NApifyResults,
  businessName: string,
  websiteUrl: string
): Partial<ResearchResults> {
  const results: Partial<ResearchResults> = {
    errors: [],
  };

  // Transform GBP data
  if (apifyResults.googlePlaces) {
    results.gbp = transformGooglePlacesToGBP(apifyResults.googlePlaces);
  }

  // Transform competitors
  if (apifyResults.competitorGBPs && Array.isArray(apifyResults.competitorGBPs)) {
    results.competitors = transformCompetitorGBPs(apifyResults.competitorGBPs, businessName);
  }

  // Transform website data
  if (apifyResults.websiteCrawler) {
    const crawlerData = Array.isArray(apifyResults.websiteCrawler)
      ? apifyResults.websiteCrawler
      : (apifyResults.websiteCrawler as { pages?: WebsiteCrawlerOutput[] }).pages || [];
    if (crawlerData.length > 0) {
      results.websiteCrawl = transformWebsiteCrawlerToWebsiteData(crawlerData);
    }
  }

  // Transform sitemap data
  if (apifyResults.sitemapExtractor) {
    results.sitemap = transformSitemapToSitemapData(apifyResults.sitemapExtractor);
  }

  // Transform SEO audit
  if (apifyResults.pageSpeed) {
    results.seoAudit = transformPageSpeedToSEOAudit(apifyResults.pageSpeed, websiteUrl);
  }

  // Generate citation checks (placeholder)
  results.citations = generateCitationChecks(businessName);

  return results;
}
