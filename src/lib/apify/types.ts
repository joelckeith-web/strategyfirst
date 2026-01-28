// Apify Actor Run Status
export type ApifyRunStatus =
  | 'READY'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'TIMING-OUT'
  | 'TIMED-OUT'
  | 'ABORTING'
  | 'ABORTED';

// Base Apify Run Result
export interface ApifyRunResult {
  id: string;
  actId: string;
  status: ApifyRunStatus;
  startedAt: string;
  finishedAt?: string;
  defaultDatasetId: string;
  defaultKeyValueStoreId: string;
}

// Website Content Crawler Types
export interface WebsiteCrawlerInput {
  startUrls: { url: string }[];
  maxCrawlPages?: number;
  maxCrawlDepth?: number;
  includeUrlGlobs?: string[];
  excludeUrlGlobs?: string[];
  crawlerType?: 'playwright:firefox' | 'playwright:chrome' | 'cheerio';
  proxyConfiguration?: {
    useApifyProxy: boolean;
    apifyProxyGroups?: string[];
  };
  /** Whether to save full HTML content (disable for faster crawls) */
  saveHtml?: boolean;
  /** Whether to save screenshots (disable for faster crawls) */
  saveScreenshots?: boolean;
  /** Timeout for each page request in seconds (default 30) */
  requestHandlerTimeoutSecs?: number;
}

export interface WebsiteCrawlerResult {
  url: string;
  title: string;
  text: string;
  markdown?: string;
  html?: string;
  metadata?: {
    canonicalUrl?: string;
    description?: string;
    keywords?: string[];
    author?: string;
    languageCode?: string;
  };
  links?: { url: string; text: string }[];
  loadedAt: string;
  screenshotUrl?: string;
}

// Sitemap Extractor Types
export interface SitemapExtractorInput {
  sitemapUrls: string[];
  includePatterns?: string[];
  excludePatterns?: string[];
  maxUrls?: number;
}

export interface SitemapExtractorResult {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  sitemapUrl: string;
}

// Google Places Crawler Types
export interface GooglePlacesCrawlerInput {
  searchStringsArray?: string[];
  startUrls?: { url: string }[];
  locationQuery?: string;
  maxCrawledPlacesPerSearch?: number;
  language?: string;
  maxReviews?: number;
  maxImages?: number;
  scrapeReviewerName?: boolean;
  scrapeReviewerUrl?: boolean;
  scrapeReviewId?: boolean;
  scrapeReviewUrl?: boolean;
  scrapeResponseFromOwnerText?: boolean;
  /** Custom geolocation using GeoJSON (Point with radiusKm, Polygon, or MultiPolygon) */
  customGeolocation?: {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][];
    /** Radius in kilometers (only for Point type, default 5km) */
    radiusKm?: number;
  };
  /** Zoom level 1-21 (higher = more granular, more results) */
  zoom?: number;
}

// Google Search (SERP) Scraper Types
export interface GoogleSearchScraperInput {
  queries: string;
  languageCode?: string;
  resultsPerPage?: number;
  maxPagesPerQuery?: number;
  mobileResults?: boolean;
  /** Country code for localized results (e.g., 'us', 'uk') */
  countryCode?: string;
  /** Custom geolocation name for local results */
  customGeolocation?: string;
}

export interface GoogleSearchResult {
  searchQuery: {
    term: string;
    page: number;
    type: string;
    countryCode: string;
    languageCode: string;
  };
  url: string;
  organicResults: Array<{
    title: string;
    url: string;
    displayedUrl: string;
    description: string;
    siteLinks?: Array<{ title: string; url: string }>;
  }>;
  /** Local Pack / Map Pack results from SERP */
  localResults?: Array<{
    title: string;
    url?: string;
    rating?: number;
    reviewsCount?: number;
    address?: string;
    phone?: string;
    category?: string;
    position?: number;
  }>;
  paidResults?: Array<{
    title: string;
    url: string;
    displayedUrl: string;
    description: string;
  }>;
  relatedQueries?: Array<{
    title: string;
    url: string;
  }>;
  peopleAlsoAsk?: Array<{
    question: string;
    answer: string;
    url: string;
    title: string;
  }>;
}

export interface GooglePlacesResult {
  title: string;
  totalScore?: number;
  reviewsCount?: number;
  categoryName?: string;
  address?: string;
  phone?: string;
  website?: string;
  url: string;
  plusCode?: string;
  placeId?: string;
  location?: {
    lat: number;
    lng: number;
  };
  openingHours?: {
    day: string;
    hours: string;
  }[];
  popularTimesHistogram?: Record<string, { hour: number; occupancyPercent: number }[]>;
  reviews?: GooglePlaceReview[];
  images?: { url: string; title?: string }[];
  additionalInfo?: Record<string, string[]>;
}

export interface GooglePlaceReview {
  name?: string;
  text?: string;
  rating?: number;
  publishedAtDate?: string;
  responseFromOwnerText?: string;
  responseFromOwnerDate?: string;
  reviewUrl?: string;
  reviewId?: string;
}

// Combined Analysis Job Types
export interface AnalysisJob {
  id: string;
  intakeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  error?: string;
  tasks: {
    websiteCrawl: ApifyTaskStatus;
    sitemapExtract: ApifyTaskStatus;
    googlePlaces: ApifyTaskStatus;
    competitorAnalysis: ApifyTaskStatus;
  };
  results?: {
    websiteContent?: WebsiteCrawlerResult[];
    sitemapUrls?: SitemapExtractorResult[];
    googlePlaces?: GooglePlacesResult;
    competitorPlaces?: GooglePlacesResult[];
  };
}

export interface ApifyTaskStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  runId?: string;
  datasetId?: string;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  itemCount?: number;
}

// API Response Types
export interface ApifyActorCallOptions {
  waitForFinish?: number;
  timeout?: number;
  memory?: number;
  build?: string;
}

export interface ApifyDatasetListOptions {
  offset?: number;
  limit?: number;
  clean?: boolean;
  fields?: string[];
}
