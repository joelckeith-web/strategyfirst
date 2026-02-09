import { getApifyClient, WebsiteCrawlerInput, WebsiteCrawlerResult } from '@/lib/apify';

const ACTOR_ID = 'apify/website-content-crawler';

export interface CrawlWebsiteOptions {
  maxPages?: number;
  maxDepth?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  /** Use lightweight mode for faster crawling (fewer pages, HTTP-based) */
  lightweight?: boolean;
  /** Additional URLs from sitemap to ensure important pages are crawled */
  sitemapUrls?: string[];
}

export interface CrawlWebsiteOutput {
  success: boolean;
  pages: WebsiteCrawlerResult[];
  totalPages: number;
  error?: string;
}

/**
 * Crawl a website and extract content
 *
 * Performance options:
 * - lightweight: true = 25 pages, depth 3, cheerio - ~1-2min
 * - lightweight: false = 300 pages, depth 5, cheerio - ~5-15min
 *
 * Using cheerio (HTTP-based) for all crawls - 10-50x faster than Playwright.
 * Playwright only needed for heavy JS-rendered SPAs (rare for local businesses).
 */
export async function crawlWebsite(
  url: string,
  options: CrawlWebsiteOptions = {}
): Promise<CrawlWebsiteOutput> {
  const client = getApifyClient();

  // Lightweight mode for faster initial analysis
  const isLightweight = options.lightweight ?? false;
  // Full mode crawls up to 300 pages for comprehensive site analysis
  const maxPages = options.maxPages || (isLightweight ? 25 : 300);
  const maxDepth = options.maxDepth || (isLightweight ? 3 : 5);

  // Use cheerio for ALL crawls - HTTP-based, extremely fast
  // Only switch to playwright if site requires JS rendering (rare)
  const crawlerType = 'cheerio';

  // Memory: 16GB for comprehensive crawling
  const memory = 16384;

  // Timeout: 3 min for lightweight, 20 min for full (allow time for larger sites)
  const timeout = isLightweight ? 180 : 1200;

  // Build start URLs - include homepage plus important sitemap URLs
  const startUrls: { url: string }[] = [{ url }];

  if (options.sitemapUrls && options.sitemapUrls.length > 0) {
    // Prioritize important page types from sitemap
    const priorityPatterns = ['/service', '/about', '/contact', '/blog', '/faq', '/pricing', '/team'];
    const priorityUrls: string[] = [];
    const otherUrls: string[] = [];

    for (const sitemapUrl of options.sitemapUrls) {
      const urlLower = sitemapUrl.toLowerCase();
      // Skip homepage (already added)
      if (urlLower.endsWith('/') && new URL(sitemapUrl).pathname === '/') continue;

      if (priorityPatterns.some(p => urlLower.includes(p))) {
        priorityUrls.push(sitemapUrl);
      } else {
        otherUrls.push(sitemapUrl);
      }
    }

    // Add priority URLs first (up to 50), then fill with others (up to 50)
    const urlsToAdd = [...priorityUrls.slice(0, 50), ...otherUrls.slice(0, 50)];
    for (const sitemapUrl of urlsToAdd) {
      if (!startUrls.some(s => s.url === sitemapUrl)) {
        startUrls.push({ url: sitemapUrl });
      }
    }

    console.log(`Seeding crawler with ${startUrls.length} URLs (1 homepage + ${startUrls.length - 1} from sitemap)`);
  }

  const input: WebsiteCrawlerInput = {
    startUrls,
    maxCrawlPages: maxPages,
    maxCrawlDepth: maxDepth,
    crawlerType,
    // Use Apify Proxy for reliability (required by the actor)
    proxyConfiguration: {
      useApifyProxy: true,
    },
    // Save HTML for structured data detection, skip screenshots
    saveHtml: true,
    saveScreenshots: false,
    // Request settings - allow more time per page for reliability
    requestHandlerTimeoutSecs: 60,
    // Concurrency - higher with 16GB RAM available
    maxConcurrency: 20,
    minConcurrency: 5,
  };

  if (options.includePatterns) {
    input.includeUrlGlobs = options.includePatterns;
  }

  if (options.excludePatterns) {
    input.excludeUrlGlobs = options.excludePatterns;
  }

  console.log(`Starting ${isLightweight ? 'lightweight' : 'full'} website crawl: ${maxPages} pages, depth ${maxDepth}, ${crawlerType}, memory=${memory}MB, timeout=${timeout}s`);

  try {
    const { items } = await client.callActor<WebsiteCrawlerInput, WebsiteCrawlerResult>(
      ACTOR_ID,
      input,
      { waitForFinish: timeout, timeout, memory }
    );

    return {
      success: true,
      pages: items,
      totalPages: items.length,
    };
  } catch (error) {
    console.error('Website crawl failed:', error);
    return {
      success: false,
      pages: [],
      totalPages: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Start a website crawl without waiting (async)
 */
export async function startWebsiteCrawl(
  url: string,
  options: CrawlWebsiteOptions = {}
): Promise<{ runId: string; actorId: string } | null> {
  const client = getApifyClient();

  const input: WebsiteCrawlerInput = {
    startUrls: [{ url }],
    maxCrawlPages: options.maxPages || 50,
    maxCrawlDepth: options.maxDepth || 3,
    crawlerType: 'playwright:chrome',
    proxyConfiguration: {
      useApifyProxy: true,
    },
  };

  try {
    const run = await client.runActor(ACTOR_ID, input);
    return {
      runId: run.id,
      actorId: ACTOR_ID,
    };
  } catch (error) {
    console.error('Failed to start website crawl:', error);
    return null;
  }
}

/**
 * Get results from a completed crawl
 */
export async function getCrawlResults(
  datasetId: string
): Promise<WebsiteCrawlerResult[]> {
  const client = getApifyClient();
  return client.getDatasetItems<WebsiteCrawlerResult>(datasetId, { limit: 1000 });
}
