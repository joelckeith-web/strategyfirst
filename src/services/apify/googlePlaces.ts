import { getApifyClient, GooglePlacesCrawlerInput, GooglePlacesResult } from '@/lib/apify';

const ACTOR_ID = 'compass/crawler-google-places';

export interface SearchGooglePlacesOptions {
  maxResults?: number;
  maxReviews?: number;
  maxImages?: number;
  language?: string;
}

export interface GooglePlacesOutput {
  success: boolean;
  places: GooglePlacesResult[];
  totalResults: number;
  error?: string;
}

/**
 * Search for a business on Google Places by URL
 */
export async function getGooglePlaceByUrl(
  googleMapsUrl: string,
  options: SearchGooglePlacesOptions = {}
): Promise<GooglePlacesOutput> {
  const client = getApifyClient();

  const input: GooglePlacesCrawlerInput = {
    startUrls: [{ url: googleMapsUrl }],
    maxCrawledPlacesPerSearch: 1,
    maxReviews: options.maxReviews || 20,
    maxImages: options.maxImages || 10,
    language: options.language || 'en',
    scrapeReviewerName: true,
    scrapeResponseFromOwnerText: true,
  };

  try {
    const { items } = await client.callActor<GooglePlacesCrawlerInput, GooglePlacesResult>(
      ACTOR_ID,
      input,
      { waitForFinish: 300, memory: 8192 } // 5 minutes timeout, 8GB memory
    );

    return {
      success: true,
      places: items,
      totalResults: items.length,
    };
  } catch (error) {
    console.error('Google Places search failed:', error);
    return {
      success: false,
      places: [],
      totalResults: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Search for businesses by search query and location
 */
export async function searchGooglePlaces(
  searchQuery: string,
  location: string,
  options: SearchGooglePlacesOptions = {}
): Promise<GooglePlacesOutput> {
  const client = getApifyClient();

  const input: GooglePlacesCrawlerInput = {
    searchStringsArray: [searchQuery],
    locationQuery: location,
    maxCrawledPlacesPerSearch: options.maxResults || 10,
    maxReviews: options.maxReviews || 10,
    maxImages: options.maxImages || 5,
    language: options.language || 'en',
    scrapeReviewerName: true,
    scrapeResponseFromOwnerText: true,
  };

  try {
    const { items } = await client.callActor<GooglePlacesCrawlerInput, GooglePlacesResult>(
      ACTOR_ID,
      input,
      { waitForFinish: 600, memory: 8192 } // 10 minutes timeout, 8GB memory
    );

    return {
      success: true,
      places: items,
      totalResults: items.length,
    };
  } catch (error) {
    console.error('Google Places search failed:', error);
    return {
      success: false,
      places: [],
      totalResults: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Find competitors by searching for similar businesses
 */
export async function findCompetitors(
  businessType: string,
  location: string,
  maxCompetitors: number = 5
): Promise<GooglePlacesOutput> {
  return searchGooglePlaces(businessType, location, {
    maxResults: maxCompetitors,
    maxReviews: 10,
    maxImages: 3,
  });
}

/**
 * Start a Google Places search without waiting (async)
 */
export async function startGooglePlacesSearch(
  searchQuery: string,
  location: string,
  options: SearchGooglePlacesOptions = {}
): Promise<{ runId: string; actorId: string } | null> {
  const client = getApifyClient();

  const input: GooglePlacesCrawlerInput = {
    searchStringsArray: [searchQuery],
    locationQuery: location,
    maxCrawledPlacesPerSearch: options.maxResults || 10,
    maxReviews: options.maxReviews || 10,
    language: options.language || 'en',
  };

  try {
    const run = await client.runActor(ACTOR_ID, input);
    return {
      runId: run.id,
      actorId: ACTOR_ID,
    };
  } catch (error) {
    console.error('Failed to start Google Places search:', error);
    return null;
  }
}

/**
 * Get results from a completed search
 */
export async function getGooglePlacesResults(
  datasetId: string
): Promise<GooglePlacesResult[]> {
  const client = getApifyClient();
  return client.getDatasetItems<GooglePlacesResult>(datasetId, { limit: 100 });
}

/**
 * Extract GBP metrics from a Google Places result
 */
export function extractGbpMetrics(place: GooglePlacesResult) {
  const reviewResponses = place.reviews?.filter(r => r.responseFromOwnerText)?.length || 0;
  const totalReviews = place.reviews?.length || 0;
  const responseRate = totalReviews > 0 ? (reviewResponses / totalReviews) * 100 : 0;

  const averageRating = place.totalScore || 0;
  const recentReviews = place.reviews?.filter(r => {
    if (!r.publishedAtDate) return false;
    const reviewDate = new Date(r.publishedAtDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return reviewDate > thirtyDaysAgo;
  })?.length || 0;

  return {
    name: place.title,
    rating: averageRating,
    totalReviews: place.reviewsCount || 0,
    recentReviews,
    responseRate,
    hasWebsite: !!place.website,
    hasPhone: !!place.phone,
    hasAddress: !!place.address,
    photoCount: place.images?.length || 0,
    hasOpeningHours: (place.openingHours?.length || 0) > 0,
    categories: place.categoryName ? [place.categoryName] : [],
    url: place.url,
    website: place.website,
    phone: place.phone,
    address: place.address,
    location: place.location,
  };
}
