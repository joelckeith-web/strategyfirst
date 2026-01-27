/**
 * Type definitions for Apify actor outputs
 * These types match the raw output from each Apify actor
 */

// ============================================
// apify/website-content-crawler output
// ============================================
export interface WebsiteCrawlerOutput {
  url: string;
  title: string;
  description: string | null;
  text: string;
  html?: string;
  links: string[];
  loadedUrl: string;
  loadedTime: string;
  referrerUrl?: string;
  depth: number;
  httpStatusCode: number;
  metadata: Record<string, string>;
  screenshotUrl?: string;
  canonicalUrl?: string;
  lang?: string;
}

export interface WebsiteCrawlerResult {
  pages: WebsiteCrawlerOutput[];
  crawledUrls: number;
  failedUrls: number;
}

// ============================================
// compass/crawler-google-places output
// ============================================
export interface GooglePlacesReview {
  name: string;
  text: string;
  publishAt: string;
  publishedAtDate: string;
  likesCount: number;
  reviewId: string;
  reviewUrl: string;
  reviewerId: string;
  reviewerUrl: string;
  reviewerNumberOfReviews: number;
  isLocalGuide: boolean;
  stars: number;
  rating: number;
  responseFromOwnerDate?: string;
  responseFromOwnerText?: string;
}

export interface GooglePlacesOutput {
  title: string;
  subTitle?: string;
  description?: string;
  price?: string;
  categoryName: string;
  address: string;
  neighborhood?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  countryCode?: string;
  phone?: string;
  phoneUnformatted?: string;
  claimThisBusiness: boolean;
  location: {
    lat: number;
    lng: number;
  };
  locatedIn?: string;
  plusCode?: string;
  website?: string;
  temporarilyClosed: boolean;
  permanentlyClosed: boolean;
  totalScore: number;
  isAdvertisement: boolean;
  rank: number;
  placeId: string;
  url: string;
  searchPageUrl?: string;
  searchString?: string;
  cid?: string;
  reviewsCount: number;
  reviewsDistribution: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  };
  imagesCount: number;
  imageUrls: string[];
  scrapedAt: string;
  reserveTableUrl?: string;
  googleFoodUrl?: string;
  hotelStars?: number;
  hotelDescription?: string;
  checkInDate?: string;
  checkOutDate?: string;
  similarHotelsNearby?: unknown[];
  hotelReviewSummary?: unknown;
  categories: string[];
  openingHours?: Array<{
    day: string;
    hours: string;
  }>;
  peopleAlsoSearch?: Array<{
    title: string;
    placeId: string;
  }>;
  reviewsTags?: Array<{
    title: string;
    count: number;
  }>;
  additionalInfo?: Record<string, Record<string, boolean>>;
  gasPrices?: unknown[];
  questions?: unknown[];
  updatesFromCustomers?: unknown[];
  ownerUpdates?: unknown[];
  reviews?: GooglePlacesReview[];
  orderBy?: string[];
  menu?: unknown;
}

// ============================================
// lukaskrivka/sitemap-sniffer or onescales/sitemap-url-extractor output
// ============================================
export interface SitemapExtractorOutput {
  url: string;
  urls: Array<{
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: string;
  }>;
  totalUrls: number;
  sitemapUrl?: string;
  errors?: string[];
}

// Alternative format from some sitemap actors
export interface SitemapUrlItem {
  url: string;
  lastModified?: string;
  changeFrequency?: string;
  priority?: number;
}

// ============================================
// SERP Analysis output (from various actors)
// ============================================
export interface SERPResult {
  position: number;
  title: string;
  url: string;
  displayedUrl: string;
  description: string;
  emphasizedKeywords?: string[];
  sitelinks?: Array<{
    title: string;
    url: string;
  }>;
  cached?: boolean;
  related?: string[];
}

export interface SERPAnalysisOutput {
  keyword: string;
  location?: string;
  searchEngine: string;
  organic: SERPResult[];
  paid?: SERPResult[];
  localPack?: GooglePlacesOutput[];
  peopleAlsoAsk?: Array<{
    question: string;
    answer: string;
  }>;
  relatedSearches?: string[];
  featuredSnippet?: {
    title: string;
    url: string;
    text: string;
  };
  totalResults?: number;
}

// ============================================
// PageSpeed / Lighthouse output
// ============================================
export interface PageSpeedMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  speedIndex: number;
  timeToInteractive: number;
}

export interface PageSpeedAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  numericValue?: number;
  numericUnit?: string;
  displayValue?: string;
}

export interface PageSpeedOutput {
  url: string;
  fetchTime: string;
  lighthouseResult: {
    requestedUrl: string;
    finalUrl: string;
    categories: {
      performance?: { score: number; title: string };
      accessibility?: { score: number; title: string };
      'best-practices'?: { score: number; title: string };
      seo?: { score: number; title: string };
    };
    audits: Record<string, PageSpeedAudit>;
  };
}

// ============================================
// Combined n8n callback payload
// ============================================
export interface N8NApifyResults {
  websiteCrawler?: WebsiteCrawlerOutput[] | WebsiteCrawlerResult;
  googlePlaces?: GooglePlacesOutput;
  sitemapExtractor?: SitemapExtractorOutput;
  serpAnalysis?: SERPAnalysisOutput[];
  competitorGBPs?: GooglePlacesOutput[];
  pageSpeed?: PageSpeedOutput;
}

export interface N8NCallbackPayload {
  sessionId: string;
  status: 'completed' | 'failed' | 'partial';

  // Raw Apify outputs
  apifyResults?: N8NApifyResults;

  // Pre-processed by n8n (optional)
  processedData?: {
    gbp?: unknown;
    competitors?: unknown[];
    seoAudit?: unknown;
    keywords?: unknown[];
  };

  // Step-by-step results (alternative format)
  step?: 'gbp' | 'competitors' | 'seo' | 'sitemap' | 'website' | 'citations' | 'complete';
  data?: unknown;

  // Errors from any step
  errors?: Array<{
    step: string;
    actor?: string;
    code?: string;
    message: string;
    recoverable?: boolean;
  }>;

  // Metadata
  executionTime?: number;
  executionId?: string;
  timestamp?: string;
}
