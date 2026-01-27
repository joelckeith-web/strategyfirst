import { getApifyClient, WebsiteCrawlerInput, WebsiteCrawlerResult } from '@/lib/apify';

const ACTOR_ID = 'apify/website-content-crawler';

export interface CrawlWebsiteOptions {
  maxPages?: number;
  maxDepth?: number;
  includePatterns?: string[];
  excludePatterns?: string[];
}

export interface CrawlWebsiteOutput {
  success: boolean;
  pages: WebsiteCrawlerResult[];
  totalPages: number;
  error?: string;
}

/**
 * Crawl a website and extract content
 */
export async function crawlWebsite(
  url: string,
  options: CrawlWebsiteOptions = {}
): Promise<CrawlWebsiteOutput> {
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

  if (options.includePatterns) {
    input.includeUrlGlobs = options.includePatterns;
  }

  if (options.excludePatterns) {
    input.excludeUrlGlobs = options.excludePatterns;
  }

  try {
    const { items } = await client.callActor<WebsiteCrawlerInput, WebsiteCrawlerResult>(
      ACTOR_ID,
      input,
      { waitForFinish: 600 } // 10 minutes timeout
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
