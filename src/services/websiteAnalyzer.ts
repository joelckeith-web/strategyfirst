import type { WebsiteCrawlerResult } from '@/lib/apify';

export interface WebsiteAnalysis {
  cms: string | null;
  hasSSL: boolean;
  isMobileResponsive: boolean | null;
  hasStructuredData: boolean;
  schemaTypes: string[];
  description: string | null;
  technologies: string[];
}

/**
 * Detect CMS from HTML content and meta tags
 */
function detectCMS(html: string): string | null {
  const htmlLower = html.toLowerCase();

  // WordPress detection
  if (
    htmlLower.includes('wp-content') ||
    htmlLower.includes('wp-includes') ||
    htmlLower.includes('wordpress')
  ) {
    return 'WordPress';
  }

  // Wix detection
  if (
    htmlLower.includes('wix.com') ||
    htmlLower.includes('wixstatic.com') ||
    htmlLower.includes('_wix_')
  ) {
    return 'Wix';
  }

  // Squarespace detection
  if (
    htmlLower.includes('squarespace') ||
    htmlLower.includes('sqsp.net')
  ) {
    return 'Squarespace';
  }

  // Shopify detection
  if (
    htmlLower.includes('shopify') ||
    htmlLower.includes('cdn.shopify.com')
  ) {
    return 'Shopify';
  }

  // Webflow detection
  if (
    htmlLower.includes('webflow.com') ||
    htmlLower.includes('assets-global.website-files.com')
  ) {
    return 'Webflow';
  }

  // Drupal detection
  if (
    htmlLower.includes('drupal') ||
    htmlLower.includes('/sites/default/files')
  ) {
    return 'Drupal';
  }

  // Joomla detection
  if (
    htmlLower.includes('joomla') ||
    htmlLower.includes('/media/system/js')
  ) {
    return 'Joomla';
  }

  // GoDaddy Website Builder
  if (htmlLower.includes('godaddy.com')) {
    return 'GoDaddy Website Builder';
  }

  // Weebly detection
  if (htmlLower.includes('weebly.com')) {
    return 'Weebly';
  }

  // HubSpot CMS
  if (htmlLower.includes('hubspot')) {
    return 'HubSpot CMS';
  }

  // Next.js detection
  if (
    htmlLower.includes('_next/static') ||
    htmlLower.includes('__next')
  ) {
    return 'Next.js';
  }

  // Gatsby detection
  if (htmlLower.includes('gatsby')) {
    return 'Gatsby';
  }

  return null;
}

/**
 * Extract schema types from structured data
 */
function extractSchemaTypes(html: string): string[] {
  const schemaTypes: Set<string> = new Set();

  // JSON-LD schema detection
  const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonLd = JSON.parse(match[1]);
      if (jsonLd['@type']) {
        if (Array.isArray(jsonLd['@type'])) {
          jsonLd['@type'].forEach((t: string) => schemaTypes.add(t));
        } else {
          schemaTypes.add(jsonLd['@type']);
        }
      }
      // Check for @graph
      if (jsonLd['@graph'] && Array.isArray(jsonLd['@graph'])) {
        jsonLd['@graph'].forEach((item: { '@type'?: string | string[] }) => {
          if (item['@type']) {
            if (Array.isArray(item['@type'])) {
              item['@type'].forEach((t: string) => schemaTypes.add(t));
            } else {
              schemaTypes.add(item['@type']);
            }
          }
        });
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // Microdata detection
  const microdataRegex = /itemtype="([^"]+)"/gi;
  while ((match = microdataRegex.exec(html)) !== null) {
    const typeUrl = match[1];
    const typeName = typeUrl.split('/').pop();
    if (typeName) {
      schemaTypes.add(typeName);
    }
  }

  return Array.from(schemaTypes);
}

/**
 * Extract meta description
 */
function extractDescription(html: string): string | null {
  // Look for meta description
  const descriptionMatch = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
  );
  if (descriptionMatch) {
    return descriptionMatch[1];
  }

  // Look for og:description
  const ogMatch = html.match(
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i
  );
  if (ogMatch) {
    return ogMatch[1];
  }

  return null;
}

/**
 * Detect viewport meta tag (mobile responsiveness indicator)
 */
function detectMobileResponsive(html: string): boolean | null {
  const viewportMatch = html.match(
    /<meta[^>]*name=["']viewport["'][^>]*>/i
  );

  if (!viewportMatch) {
    return false;
  }

  // Check if viewport has width=device-width
  return viewportMatch[0].includes('width=device-width');
}

/**
 * Detect common web technologies
 */
function detectTechnologies(html: string): string[] {
  const technologies: string[] = [];
  const htmlLower = html.toLowerCase();

  // Analytics
  if (htmlLower.includes('google-analytics.com') || htmlLower.includes('gtag')) {
    technologies.push('Google Analytics');
  }
  if (htmlLower.includes('googletagmanager.com')) {
    technologies.push('Google Tag Manager');
  }
  if (htmlLower.includes('facebook.com/tr') || htmlLower.includes('connect.facebook.net')) {
    technologies.push('Facebook Pixel');
  }

  // CSS Frameworks
  if (htmlLower.includes('bootstrap')) {
    technologies.push('Bootstrap');
  }
  if (htmlLower.includes('tailwind')) {
    technologies.push('Tailwind CSS');
  }

  // JavaScript Libraries
  if (htmlLower.includes('jquery')) {
    technologies.push('jQuery');
  }
  if (htmlLower.includes('react')) {
    technologies.push('React');
  }
  if (htmlLower.includes('vue')) {
    technologies.push('Vue.js');
  }

  // Marketing/Chat
  if (htmlLower.includes('intercom')) {
    technologies.push('Intercom');
  }
  if (htmlLower.includes('drift')) {
    technologies.push('Drift');
  }
  if (htmlLower.includes('hubspot')) {
    technologies.push('HubSpot');
  }
  if (htmlLower.includes('crisp.chat')) {
    technologies.push('Crisp');
  }

  // CDN
  if (htmlLower.includes('cloudflare')) {
    technologies.push('Cloudflare');
  }
  if (htmlLower.includes('cdn.jsdelivr.net')) {
    technologies.push('jsDelivr CDN');
  }

  return technologies;
}

/**
 * Analyze website data from crawler results
 */
export function analyzeWebsiteData(pages: WebsiteCrawlerResult[]): WebsiteAnalysis {
  if (pages.length === 0) {
    return {
      cms: null,
      hasSSL: false,
      isMobileResponsive: null,
      hasStructuredData: false,
      schemaTypes: [],
      description: null,
      technologies: [],
    };
  }

  // Analyze the first page (usually homepage)
  const homePage = pages[0];
  const html = homePage.html || '';
  const url = homePage.url || '';

  // Check SSL
  const hasSSL = url.startsWith('https://');

  // Detect CMS
  const cms = detectCMS(html);

  // Check mobile responsiveness
  const isMobileResponsive = detectMobileResponsive(html);

  // Extract schema types from all pages
  const allSchemaTypes: Set<string> = new Set();
  for (const page of pages) {
    const pageHtml = page.html || '';
    const types = extractSchemaTypes(pageHtml);
    types.forEach(t => allSchemaTypes.add(t));
  }
  const schemaTypes = Array.from(allSchemaTypes);
  const hasStructuredData = schemaTypes.length > 0;

  // Extract description
  const description = extractDescription(html);

  // Detect technologies
  const technologies = detectTechnologies(html);

  return {
    cms,
    hasSSL,
    isMobileResponsive,
    hasStructuredData,
    schemaTypes,
    description,
    technologies,
  };
}
