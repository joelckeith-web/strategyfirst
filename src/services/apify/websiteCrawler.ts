import { getApifyClient, WebsiteCrawlerInput, WebsiteCrawlerResult } from '@/lib/apify';

const ACTOR_ID = 'apify/website-content-crawler';

export interface CrawlWebsiteOptions {
  maxPages?: number;
  maxDepth?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
  /** Use lightweight mode for faster crawling (fewer pages, HTTP-based) */
  lightweight?: boolean;
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
 * - lightweight: true = 15 pages, depth 2, cheerio - ~30-60s
 * - lightweight: false = 30 pages, depth 3, cheerio - ~1-3min
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
  // Reduced max pages to prevent timeouts on larger sites
  const maxPages = options.maxPages || (isLightweight ? 15 : 30);
  const maxDepth = options.maxDepth || (isLightweight ? 2 : 3);

  // Use cheerio for ALL crawls - HTTP-based, extremely fast
  // Only switch to playwright if site requires JS rendering (rare)
  const crawlerType = 'cheerio';

  // Memory: 4GB for cheerio (lightweight on resources)
  const memory = 4096;

  // Timeout: 2 min for lightweight, 8 min for full (allow more time for larger sites)
  const timeout = isLightweight ? 120 : 480;

  const input: WebsiteCrawlerInput = {
    startUrls: [{ url }],
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
    // Concurrency - moderate to avoid overwhelming target servers
    maxConcurrency: 10,
    minConcurrency: 3,
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
