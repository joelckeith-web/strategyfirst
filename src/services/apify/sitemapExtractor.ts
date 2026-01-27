import { getApifyClient, SitemapExtractorInput, SitemapExtractorResult } from '@/lib/apify';

const ACTOR_ID = 'onescales/sitemap-url-extractor';

export interface ExtractSitemapOptions {
  includePatterns?: string[];
  excludePatterns?: string[];
  maxUrls?: number;
}

export interface ExtractSitemapOutput {
  success: boolean;
  urls: SitemapExtractorResult[];
  totalUrls: number;
  error?: string;
}

/**
 * Find sitemap URL from a website
 */
function getSitemapUrl(websiteUrl: string): string {
  try {
    const url = new URL(websiteUrl);
    return `${url.origin}/sitemap.xml`;
  } catch {
    return `${websiteUrl}/sitemap.xml`;
  }
}

/**
 * Extract URLs from a sitemap
 */
export async function extractSitemap(
  websiteUrl: string,
  options: ExtractSitemapOptions = {}
): Promise<ExtractSitemapOutput> {
  const client = getApifyClient();
  const sitemapUrl = getSitemapUrl(websiteUrl);

  const input: SitemapExtractorInput = {
    sitemapUrls: [sitemapUrl],
    maxUrls: options.maxUrls || 500,
  };

  if (options.includePatterns) {
    input.includePatterns = options.includePatterns;
  }

  if (options.excludePatterns) {
    input.excludePatterns = options.excludePatterns;
  }

  try {
    const { items } = await client.callActor<SitemapExtractorInput, SitemapExtractorResult>(
      ACTOR_ID,
      input,
      { waitForFinish: 120, memory: 8192 } // 2 minutes timeout, 8GB memory
    );

    return {
      success: true,
      urls: items,
      totalUrls: items.length,
    };
  } catch (error) {
    console.error('Sitemap extraction failed:', error);
    return {
      success: false,
      urls: [],
      totalUrls: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Start sitemap extraction without waiting (async)
 */
export async function startSitemapExtraction(
  websiteUrl: string,
  options: ExtractSitemapOptions = {}
): Promise<{ runId: string; actorId: string } | null> {
  const client = getApifyClient();
  const sitemapUrl = getSitemapUrl(websiteUrl);

  const input: SitemapExtractorInput = {
    sitemapUrls: [sitemapUrl],
    maxUrls: options.maxUrls || 500,
  };

  try {
    const run = await client.runActor(ACTOR_ID, input);
    return {
      runId: run.id,
      actorId: ACTOR_ID,
    };
  } catch (error) {
    console.error('Failed to start sitemap extraction:', error);
    return null;
  }
}

/**
 * Get results from a completed extraction
 */
export async function getSitemapResults(
  datasetId: string
): Promise<SitemapExtractorResult[]> {
  const client = getApifyClient();
  return client.getDatasetItems<SitemapExtractorResult>(datasetId, { limit: 1000 });
}

/**
 * Analyze sitemap structure
 */
export function analyzeSitemapStructure(urls: SitemapExtractorResult[]): {
  totalPages: number;
  pageTypes: Record<string, number>;
  recentlyUpdated: number;
  hasServicePages: boolean;
  hasBlog: boolean;
  hasLocationPages: boolean;
} {
  const pageTypes: Record<string, number> = {};
  let recentlyUpdated = 0;
  let hasServicePages = false;
  let hasBlog = false;
  let hasLocationPages = false;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const item of urls) {
    // Categorize by URL pattern
    const urlLower = item.url.toLowerCase();

    if (urlLower.includes('/service') || urlLower.includes('/services')) {
      pageTypes['services'] = (pageTypes['services'] || 0) + 1;
      hasServicePages = true;
    } else if (urlLower.includes('/blog') || urlLower.includes('/news') || urlLower.includes('/article')) {
      pageTypes['blog'] = (pageTypes['blog'] || 0) + 1;
      hasBlog = true;
    } else if (urlLower.includes('/location') || urlLower.includes('/area') || urlLower.includes('/city')) {
      pageTypes['locations'] = (pageTypes['locations'] || 0) + 1;
      hasLocationPages = true;
    } else if (urlLower.includes('/about')) {
      pageTypes['about'] = (pageTypes['about'] || 0) + 1;
    } else if (urlLower.includes('/contact')) {
      pageTypes['contact'] = (pageTypes['contact'] || 0) + 1;
    } else if (urlLower.includes('/faq')) {
      pageTypes['faq'] = (pageTypes['faq'] || 0) + 1;
    } else {
      pageTypes['other'] = (pageTypes['other'] || 0) + 1;
    }

    // Check if recently updated
    if (item.lastmod) {
      const lastMod = new Date(item.lastmod);
      if (lastMod > thirtyDaysAgo) {
        recentlyUpdated++;
      }
    }
  }

  return {
    totalPages: urls.length,
    pageTypes,
    recentlyUpdated,
    hasServicePages,
    hasBlog,
    hasLocationPages,
  };
}
