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
 * - lightweight: true = 10 pages, depth 2, cheerio (fast HTTP scraper) - ~30-60s
 * - lightweight: false = 30 pages, depth 3, playwright:firefox - ~2-5min
 */
export async function crawlWebsite(
  url: string,
  options: CrawlWebsiteOptions = {}
): Promise<CrawlWebsiteOutput> {
  const client = getApifyClient();

  // Lightweight mode for faster initial analysis
  const isLightweight = options.lightweight ?? false;
  const maxPages = options.maxPages || (isLightweight ? 10 : 30);
  const maxDepth = options.maxDepth || (isLightweight ? 2 : 3);

  // Use cheerio for lightweight (HTTP-based, very fast)
  // Use playwright:firefox for full crawl (lighter than chrome, still handles JS)
  const crawlerType = isLightweight ? 'cheerio' : 'playwright:firefox';

  // Memory: 4GB for cheerio, 32GB for playwright (increased for larger sites)
  const memory = isLightweight ? 4096 : 32768;

  // Timeout: 3 min for lightweight, 15 min for full (increased for larger sites)
  const timeout = isLightweight ? 180 : 900;

  const input: WebsiteCrawlerInput = {
    startUrls: [{ url }],
    maxCrawlPages: maxPages,
    maxCrawlDepth: maxDepth,
    crawlerType,
    proxyConfiguration: {
      useApifyProxy: true,
    },
    // Always save HTML for structured data detection, skip screenshots for faster processing
    saveHtml: true,
    saveScreenshots: false,
    // Increase request timeout for slow pages
    requestHandlerTimeoutSecs: 60,
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
