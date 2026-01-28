import { getApifyClient, GooglePlacesCrawlerInput, GooglePlacesResult, GoogleSearchScraperInput, GoogleSearchResult } from '@/lib/apify';

const PLACES_ACTOR_ID = 'compass/crawler-google-places';
const SERP_ACTOR_ID = 'apify/google-search-scraper';

export interface SearchGooglePlacesOptions {
  maxResults?: number;
  maxReviews?: number;
  maxImages?: number;
  language?: string;
  /** Radius in kilometers for search area */
  radiusKm?: number;
  /** Center coordinates [longitude, latitude] for radius search */
  centerCoordinates?: [number, number];
  /** Zoom level 1-21 for search granularity */
  zoom?: number;
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
      PLACES_ACTOR_ID,
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

  // Add custom geolocation if center coordinates and radius provided
  if (options.centerCoordinates && options.radiusKm) {
    input.customGeolocation = {
      type: 'Point',
      coordinates: options.centerCoordinates, // [longitude, latitude]
      radiusKm: options.radiusKm,
    };
  }

  // Add zoom level if specified
  if (options.zoom) {
    input.zoom = options.zoom;
  }

  try {
    const { items } = await client.callActor<GooglePlacesCrawlerInput, GooglePlacesResult>(
      PLACES_ACTOR_ID,
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
 * Calculate prominence score for a business (used for ranking competitors)
 * Formula: rating * sqrt(reviewCount) gives a balanced score
 * that considers both quality (rating) and popularity (reviews)
 */
export function calculateProminenceScore(rating: number, reviewCount: number): number {
  if (!rating || !reviewCount) return 0;
  return rating * Math.sqrt(reviewCount);
}

/**
 * Find competitors by searching for similar businesses
 * Enhanced version with 20-mile radius and prominence-based sorting
 */
export async function findCompetitors(
  businessType: string,
  location: string,
  maxCompetitors: number = 5,
  options: {
    /** Center coordinates [longitude, latitude] for radius-based search */
    centerCoordinates?: [number, number];
    /** Radius in km (default 32km = ~20 miles) */
    radiusKm?: number;
  } = {}
): Promise<GooglePlacesOutput> {
  // Default to 32km (~20 miles) radius
  const radiusKm = options.radiusKm || 32;

  console.log(`Finding competitors for "${businessType}" in ${location} with ${radiusKm}km radius`);

  const searchOptions: SearchGooglePlacesOptions = {
    // Fetch more results initially so we can sort and filter
    maxResults: Math.max(maxCompetitors * 3, 15),
    maxReviews: 10,
    maxImages: 3,
  };

  // Add radius-based search if coordinates provided
  if (options.centerCoordinates) {
    searchOptions.centerCoordinates = options.centerCoordinates;
    searchOptions.radiusKm = radiusKm;
    // Use zoom level 12 for city-level search with good coverage
    searchOptions.zoom = 12;
  }

  const result = await searchGooglePlaces(businessType, location, searchOptions);

  if (!result.success || result.places.length === 0) {
    return result;
  }

  // Sort by prominence score (rating * sqrt(reviews))
  const sortedPlaces = result.places
    .map(place => ({
      ...place,
      prominenceScore: calculateProminenceScore(
        place.totalScore || 0,
        place.reviewsCount || 0
      ),
    }))
    .sort((a, b) => b.prominenceScore - a.prominenceScore)
    .slice(0, maxCompetitors);

  console.log(`Found ${result.places.length} total, returning top ${sortedPlaces.length} by prominence`);

  return {
    success: true,
    places: sortedPlaces,
    totalResults: sortedPlaces.length,
  };
}

/**
 * Search for Map Pack (Local 3-Pack) results from Google SERP
 * These are the top 3 businesses shown in Google search results
 */
export async function searchMapPack(
  searchQuery: string,
  location: string
): Promise<{
  success: boolean;
  mapPackResults: Array<{
    position: number;
    title: string;
    rating?: number;
    reviewsCount?: number;
    address?: string;
    phone?: string;
    category?: string;
  }>;
  error?: string;
}> {
  const client = getApifyClient();

  // Format search query for local intent
  const localQuery = `${searchQuery} in ${location}`;

  const input: GoogleSearchScraperInput = {
    queries: localQuery,
    languageCode: 'en',
    resultsPerPage: 10,
    maxPagesPerQuery: 1,
    countryCode: 'us',
  };

  try {
    const { items } = await client.callActor<GoogleSearchScraperInput, GoogleSearchResult>(
      SERP_ACTOR_ID,
      input,
      { waitForFinish: 120, memory: 4096 } // 2 minutes timeout, 4GB memory
    );

    const serpResult = items[0];
    if (!serpResult?.localResults || serpResult.localResults.length === 0) {
      console.log('No Map Pack results found in SERP');
      return {
        success: true,
        mapPackResults: [],
      };
    }

    // Map Pack typically shows top 3
    const mapPackResults = serpResult.localResults.slice(0, 3).map((result, index) => ({
      position: index + 1,
      title: result.title,
      rating: result.rating,
      reviewsCount: result.reviewsCount,
      address: result.address,
      phone: result.phone,
      category: result.category,
    }));

    console.log(`Found ${mapPackResults.length} Map Pack results`);

    return {
      success: true,
      mapPackResults,
    };
  } catch (error) {
    console.error('Map Pack search failed:', error);
    return {
      success: false,
      mapPackResults: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Enhanced competitor search combining Google Places and Map Pack
 * Returns both the top performers by prominence AND the Map Pack rankings
 */
export async function findCompetitorsEnhanced(
  businessType: string,
  location: string,
  maxCompetitors: number = 5,
  options: {
    centerCoordinates?: [number, number];
    radiusKm?: number;
    includeMapPack?: boolean;
  } = {}
): Promise<{
  success: boolean;
  competitors: GooglePlacesResult[];
  mapPack: Array<{
    position: number;
    title: string;
    rating?: number;
    reviewsCount?: number;
  }>;
  error?: string;
}> {
  const includeMapPack = options.includeMapPack ?? true;

  // Run both searches in parallel if Map Pack is requested
  const [placesResult, mapPackResult] = await Promise.all([
    findCompetitors(businessType, location, maxCompetitors, {
      centerCoordinates: options.centerCoordinates,
      radiusKm: options.radiusKm,
    }),
    includeMapPack
      ? searchMapPack(businessType, location)
      : Promise.resolve({ success: true, mapPackResults: [], error: undefined }),
  ]);

  return {
    success: placesResult.success,
    competitors: placesResult.places,
    mapPack: mapPackResult.mapPackResults || [],
    error: placesResult.error || mapPackResult.error,
  };
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
    const run = await client.runActor(PLACES_ACTOR_ID, input);
    return {
      runId: run.id,
      actorId: PLACES_ACTOR_ID,
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
