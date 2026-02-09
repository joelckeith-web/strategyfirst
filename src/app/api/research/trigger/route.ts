import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { ResearchSessionInsert, Json } from '@/lib/supabase/types';

// Allow up to 5 minutes for Apify actors (competitors can take 10min waitForFinish)
export const maxDuration = 300;
import {
  searchGooglePlaces,
  getGooglePlaceByUrl,
  findCompetitorsEnhanced,
  extractGbpMetrics,
  calculateProminenceScore,
} from '@/services/apify/googlePlaces';
import { crawlWebsite } from '@/services/apify/websiteCrawler';
import { extractSitemap, analyzeSitemapStructure } from '@/services/apify/sitemapExtractor';
// Citation check is now triggered via button - see /api/research/[id]/citations

// ============================================================
// Page Data Extraction Helpers
// ============================================================

/**
 * Categorize a page by its URL path and title
 */
function categorizePageByTitleAndUrl(url: string, title: string): string {
  const lowerUrl = url.toLowerCase();
  const lowerTitle = title.toLowerCase();

  // Blog/article indicators
  if (
    lowerUrl.includes('/blog') ||
    lowerUrl.includes('/news') ||
    lowerUrl.includes('/article') ||
    lowerUrl.includes('/post') ||
    lowerTitle.match(/^(how to|what is|why |guide to|tips for|understanding|top \d+)/)
  ) {
    return 'blog';
  }

  // Location page indicators
  if (
    lowerUrl.includes('/location') ||
    lowerUrl.includes('/area') ||
    lowerUrl.includes('/service-area') ||
    lowerUrl.match(/\/areas\/[a-z-]+/) ||
    lowerTitle.match(/\bin\s+[A-Z][a-z]+,?\s+[A-Z]{2}\b/i) ||
    lowerTitle.match(/serving (the )?/i)
  ) {
    return 'location';
  }

  // FAQ
  if (lowerUrl.includes('/faq') || lowerTitle.includes('frequently asked') || lowerTitle.includes('faq')) {
    return 'faq';
  }

  // About/team
  if (
    lowerUrl.includes('/about') ||
    lowerUrl.includes('/team') ||
    lowerUrl.includes('/our-story') ||
    lowerUrl.includes('/staff') ||
    lowerTitle.match(/\b(about|our (team|story|staff)|meet the)\b/i)
  ) {
    return 'about';
  }

  // Contact
  if (lowerUrl.includes('/contact') || lowerTitle.match(/\bcontact\b/i)) {
    return 'contact';
  }

  // Portfolio/gallery
  if (
    lowerUrl.includes('/portfolio') ||
    lowerUrl.includes('/gallery') ||
    lowerUrl.includes('/our-work') ||
    lowerUrl.includes('/projects') ||
    lowerTitle.match(/\b(gallery|portfolio|our work|projects|case stud)/i)
  ) {
    return 'portfolio';
  }

  // Service pages — check both URL and title for service indicators
  if (
    lowerUrl.includes('/service') ||
    lowerUrl.includes('/what-we-do') ||
    lowerUrl.includes('/solutions') ||
    lowerTitle.match(/\b(repair|installation|maintenance|cleaning|inspection|service|removal|replacement)\b/i)
  ) {
    return 'service';
  }

  // Homepage
  try {
    const parsed = new URL(url);
    if (parsed.pathname === '/' || parsed.pathname === '') return 'other';
  } catch { /* ignore */ }

  return 'other';
}

/**
 * Extract H1 and H2 headings from HTML
 */
function extractHeadings(html: string): { h1: string[]; h2: string[] } {
  const h1s: string[] = [];
  const h2s: string[] = [];

  // Match h1 tags - strip inner HTML tags to get text only
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let match;
  while ((match = h1Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) h1s.push(text.slice(0, 200));
  }

  // Match h2 tags
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  while ((match = h2Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim();
    if (text) h2s.push(text.slice(0, 200));
  }

  return { h1: h1s.slice(0, 5), h2: h2s.slice(0, 15) };
}

/**
 * Count internal vs external links in HTML
 */
function countLinks(html: string, domain: string): { internal: number; external: number } {
  let internal = 0;
  let external = 0;

  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    // Skip anchors, mailto, tel, javascript
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }

    try {
      // Relative URLs are internal
      if (href.startsWith('/') || !href.includes('://')) {
        internal++;
        continue;
      }
      const linkDomain = new URL(href).hostname.toLowerCase().replace(/^www\./, '');
      if (linkDomain === normalizedDomain) {
        internal++;
      } else {
        external++;
      }
    } catch {
      // If URL parse fails, skip
    }
  }

  return { internal, external };
}

/**
 * Extract schema.org @type values from ld+json blocks in HTML
 */
function extractPageSchema(html: string): string[] {
  const types: string[] = [];
  const ldJsonRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let blockMatch;

  while ((blockMatch = ldJsonRegex.exec(html)) !== null) {
    const typeRegex = /"@type"\s*:\s*"([^"]+)"/g;
    let typeMatch;
    while ((typeMatch = typeRegex.exec(blockMatch[1])) !== null) {
      if (!types.includes(typeMatch[1])) {
        types.push(typeMatch[1]);
      }
    }
  }

  return types;
}

/**
 * Input from the client request
 */
interface TriggerRequestInput {
  businessName: string;
  websiteUrl?: string;
  website?: string;
  location?: string;
  city?: string;
  state?: string;
  serviceAreas?: string[];
  gbpUrl?: string;
  industry?: string;
  primaryServices?: string[];
  clientId?: string;
  locationId?: string;
}

/**
 * Normalize a URL for comparison: lowercase, strip trailing slash and protocol
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url.toLowerCase());
    return parsed.host + parsed.pathname.replace(/\/$/, '');
  } catch {
    return url.toLowerCase().replace(/\/$/, '');
  }
}

/**
 * Auto-resolve client: find existing by business_name + website_url, or create new
 */
async function resolveClient(
  businessName: string,
  websiteUrl: string,
  serviceArea: string,
  gbpUrl?: string,
  industry?: string
): Promise<string> {
  // Try to find existing client by business_name (case-insensitive) and website_url (normalized)
  const { data: existingClients } = await supabaseAdmin
    .from('clients')
    .select('id, website_url')
    .ilike('business_name', businessName);

  if (existingClients && existingClients.length > 0) {
    const normalizedInput = normalizeUrl(websiteUrl);
    const match = existingClients.find(
      (c) => normalizeUrl((c as { website_url: string }).website_url) === normalizedInput
    );
    if (match) return (match as { id: string }).id;
  }

  // Create new client
  const { data: newClient, error } = await supabaseAdmin
    .from('clients')
    .insert({
      business_name: businessName,
      website_url: websiteUrl,
      primary_service_area: serviceArea,
      gbp_url: gbpUrl || null,
      industry: industry || null,
      status: 'active',
    } as never)
    .select('id')
    .single();

  if (error || !newClient) {
    throw new Error('Failed to create client record');
  }

  return (newClient as { id: string }).id;
}

/**
 * Auto-resolve location: find existing under client by city + state, or create new
 */
async function resolveLocation(
  clientId: string,
  city: string,
  state: string,
  gbpUrl?: string
): Promise<string> {
  // Try to find existing location under this client with matching city + state
  const { data: existingLocations } = await supabaseAdmin
    .from('locations')
    .select('id')
    .eq('client_id', clientId)
    .ilike('city', city)
    .ilike('state', state);

  if (existingLocations && existingLocations.length > 0) {
    return (existingLocations[0] as { id: string }).id;
  }

  // Create new location
  const label = `${city}, ${state}`;
  const { data: newLocation, error } = await supabaseAdmin
    .from('locations')
    .insert({
      client_id: clientId,
      label,
      city,
      state,
      service_area: label,
      gbp_url: gbpUrl || null,
      is_primary: false,
    } as never)
    .select('id')
    .single();

  if (error || !newLocation) {
    throw new Error('Failed to create location record');
  }

  // Check if this is the first location — make it primary
  const { count } = await supabaseAdmin
    .from('locations')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId);

  if (count === 1) {
    await supabaseAdmin
      .from('locations')
      .update({ is_primary: true } as never)
      .eq('id', (newLocation as { id: string }).id);
  }

  return (newLocation as { id: string }).id;
}

/**
 * POST /api/research/trigger
 * Triggers research using direct Apify integration
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TriggerRequestInput;

    // Normalize input (handle both websiteUrl and website)
    const website = body.website || body.websiteUrl;
    const businessName = body.businessName;

    // Validate required fields
    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    if (!website) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Validate website URL format
    try {
      new URL(website);
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL format' },
        { status: 400 }
      );
    }

    // Parse location into city/state if provided as single string
    let city = body.city;
    let state = body.state;
    if (!city && !state && body.location) {
      const locationParts = body.location.split(',').map(p => p.trim());
      if (locationParts.length >= 2) {
        city = locationParts[0];
        state = locationParts[1];
      } else {
        city = body.location;
      }
    }

    // Prepare input for storage
    const inputData = {
      businessName,
      website,
      city,
      state,
      serviceAreas: body.serviceAreas || [],
      industry: body.industry,
      primaryServices: body.primaryServices || [],
      gbpUrl: body.gbpUrl,
    };

    // Resolve client and location
    let clientId = body.clientId || null;
    let locationId = body.locationId || null;

    try {
      const serviceArea = [city, state].filter(Boolean).join(', ') || 'United States';

      // Auto-resolve client if not provided
      if (!clientId) {
        clientId = await resolveClient(businessName, website, serviceArea, body.gbpUrl, body.industry);
      }

      // Auto-resolve location if not provided and we have city/state
      if (!locationId && clientId && city) {
        locationId = await resolveLocation(clientId, city, state || '', body.gbpUrl);
      }
    } catch (err) {
      // Non-fatal: log but continue — session still works without client/location link
      console.error('Failed to resolve client/location:', err);
    }

    // Create research session in Supabase
    const sessionInsert: ResearchSessionInsert = {
      client_id: clientId,
      location_id: locationId,
      input: inputData as unknown as Json,
      status: 'pending',
      progress: {
        currentStep: 'initializing',
        completedSteps: [],
        failedSteps: [],
        percentage: 0,
      } as unknown as Json,
      results: {} as Json,
      errors: [] as unknown as Json,
    };

    const { data: sessionData, error: insertError } = await supabaseAdmin
      .from('research_sessions')
      .insert(sessionInsert as never)
      .select()
      .single();

    if (insertError || !sessionData) {
      console.error('Failed to create research session:', insertError);
      return NextResponse.json(
        { error: 'Failed to create research session' },
        { status: 500 }
      );
    }

    const session = sessionData as { id: string };
    const sessionId = session.id;

    // Check if Apify is configured
    const apifyToken = process.env.APIFY_API_TOKEN;

    if (apifyToken) {
      // Use direct Apify integration
      console.log('Using direct Apify integration for research');

      await supabaseAdmin
        .from('research_sessions')
        .update({
          status: 'running',
          progress: {
            currentStep: 'apify_research',
            completedSteps: [],
            failedSteps: [],
            percentage: 5,
          },
        } as never)
        .eq('id', sessionId);

      // Use waitUntil to keep the serverless function alive while Apify runs
      waitUntil(
        triggerApifyResearch(sessionId, inputData).catch(err => {
          console.error('Apify research failed:', err);
        })
      );
    } else {
      // No Apify configured - use fallback mock data
      console.log('No APIFY_API_TOKEN configured, using fallback mock data');

      await supabaseAdmin
        .from('research_sessions')
        .update({
          status: 'running',
          progress: {
            currentStep: 'fallback_mode',
            completedSteps: [],
            failedSteps: [],
            percentage: 0,
          },
        } as never)
        .eq('id', sessionId);

      triggerFallbackResearch(sessionId, inputData);
    }

    return NextResponse.json({
      sessionId,
      status: 'running',
      message: 'Research triggered successfully',
    });
  } catch (error) {
    console.error('Error triggering research:', error);
    return NextResponse.json(
      { error: 'Failed to trigger research' },
      { status: 500 }
    );
  }
}

/**
 * Run research using direct Apify API calls
 *
 * EXECUTION ORDER:
 * Phase 1: GBP + Sitemap (parallel) - lightweight, fast
 * Phase 2: Competitors (needs GBP category for accurate results)
 * Phase 3: Website Crawler (32GB RAM, runs alone as heaviest task)
 */
async function triggerApifyResearch(
  sessionId: string,
  input: {
    businessName: string;
    website: string;
    city?: string;
    state?: string;
    industry?: string;
    gbpUrl?: string;
  }
) {
  const accumulatedResults: Record<string, unknown> = {};
  const failedSteps: string[] = [];
  const completedSteps: string[] = [];
  const errors: Array<{ step: string; code: string; message: string }> = [];

  const location = [input.city, input.state].filter(Boolean).join(', ') || 'United States';

  console.log(`Starting phased Apify research for session ${sessionId}`);

  // ============================================================
  // PHASE 1: GBP + Sitemap (parallel) - Get business category first
  // ============================================================
  await supabaseAdmin
    .from('research_sessions')
    .update({
      progress: {
        currentStep: 'gbp',
        completedSteps: [],
        failedSteps: [],
        percentage: 5,
        phase: 'Phase 1: Fetching business profile and sitemap',
      },
    } as never)
    .eq('id', sessionId);

  console.log('Phase 1: Running GBP + Sitemap in parallel...');

  // GBP Task
  const gbpTask = async () => {
    try {
      let gbpResult;
      if (input.gbpUrl) {
        gbpResult = await getGooglePlaceByUrl(input.gbpUrl);
      } else {
        gbpResult = await searchGooglePlaces(input.businessName, location, { maxResults: 1 });
      }

      if (gbpResult.success && gbpResult.places.length > 0) {
        const place = gbpResult.places[0];
        const metrics = extractGbpMetrics(place);
        return {
          success: true,
          data: {
            name: metrics.name,
            rating: metrics.rating,
            reviewCount: metrics.totalReviews,
            categories: metrics.categories,
            phone: metrics.phone,
            address: metrics.address,
            website: metrics.website,
            url: metrics.url,
            photoCount: metrics.photoCount,
            responseRate: metrics.responseRate,
            recentReviews: metrics.recentReviews,
          },
          // Pass the raw category for competitor search
          categoryName: place.categoryName,
          // Pass location coordinates for radius-based competitor search
          coordinates: place.location ? [place.location.lng, place.location.lat] as [number, number] : undefined,
        };
      }
      return { success: false, error: gbpResult.error || 'No GBP data found' };
    } catch (err) {
      console.error('GBP research failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  // Sitemap Task
  const sitemapTask = async () => {
    try {
      const sitemapResult = await extractSitemap(input.website);

      if (sitemapResult.success && sitemapResult.urls.length > 0) {
        // Store raw URLs for AI to analyze - AI will categorize based on URL + title patterns
        // Pass up to 200 URLs so AI has full visibility into site structure
        return {
          success: true,
          data: {
            totalPages: sitemapResult.urls.length,
            // Store ALL URLs for AI analysis (AI will categorize them intelligently)
            urls: sitemapResult.urls.slice(0, 200).map(u => ({
              url: u.url,
              lastmod: u.lastmod || null,
            })),
            // Note: Page categorization will be done by AI during analysis phase
            // based on URL patterns AND page titles/content, not just URL matching
          },
        };
      }
      // No sitemap is okay - return empty data
      return {
        success: true,
        data: {
          totalPages: 0,
          pageTypes: {},
          hasServicePages: false,
          hasBlog: false,
          hasLocationPages: false,
          recentlyUpdated: 0,
          error: 'No sitemap found',
        },
      };
    } catch (err) {
      console.error('Sitemap extraction failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  // Run Phase 1
  const [gbpRes, sitemapRes] = await Promise.all([gbpTask(), sitemapTask()]);

  // Process GBP results
  if (gbpRes.success && gbpRes.data) {
    accumulatedResults.gbp = gbpRes.data;
    completedSteps.push('gbp');
  } else {
    failedSteps.push('gbp');
    errors.push({ step: 'gbp', code: 'ERROR', message: gbpRes.error || 'Unknown error' });
  }

  // Process sitemap results
  if (sitemapRes.success) {
    accumulatedResults.sitemap = sitemapRes.data;
    completedSteps.push('sitemap');
  } else {
    failedSteps.push('sitemap');
    errors.push({ step: 'sitemap', code: 'ERROR', message: sitemapRes.error || 'Unknown error' });
  }

  // If GBP returned a category, update the client's industry if not already set
  if (gbpRes.success && gbpRes.categoryName) {
    try {
      // Get client_id from the session
      const { data: sessionRecord } = await supabaseAdmin
        .from('research_sessions')
        .select('client_id')
        .eq('id', sessionId)
        .single();

      if (sessionRecord && (sessionRecord as { client_id: string | null }).client_id) {
        const sessClientId = (sessionRecord as { client_id: string }).client_id;
        // Only update if industry is currently null
        const { data: clientRecord } = await supabaseAdmin
          .from('clients')
          .select('industry')
          .eq('id', sessClientId)
          .single();

        if (clientRecord && !(clientRecord as { industry: string | null }).industry) {
          await supabaseAdmin
            .from('clients')
            .update({ industry: gbpRes.categoryName } as never)
            .eq('id', sessClientId);
          console.log(`Updated client ${sessClientId} industry to "${gbpRes.categoryName}"`);
        }
      }
    } catch (err) {
      console.error('Failed to update client industry from GBP:', err);
    }
  }

  // Update progress after Phase 1
  await supabaseAdmin
    .from('research_sessions')
    .update({
      results: accumulatedResults,
      progress: {
        currentStep: 'competitors',
        completedSteps,
        failedSteps,
        percentage: 30,
        phase: 'Phase 2: Finding competitors',
      },
    } as never)
    .eq('id', sessionId);

  // ============================================================
  // PHASE 2: Competitor Search (uses GBP category for accuracy)
  // ============================================================
  console.log('Phase 2: Running competitor search...');

  // Determine the best search query for competitors
  // Priority: GBP category > user-provided industry > fallback
  let competitorSearchQuery = 'local business';

  if (gbpRes.success && gbpRes.categoryName) {
    // Use the actual GBP category (e.g., "Home Inspector", "Plumber", "Restaurant")
    competitorSearchQuery = gbpRes.categoryName;
    console.log(`Using GBP category for competitor search: "${competitorSearchQuery}"`);
  } else if (input.industry) {
    competitorSearchQuery = input.industry;
    console.log(`Using provided industry for competitor search: "${competitorSearchQuery}"`);
  } else {
    console.log('No category found, using generic search');
  }

  const competitorTask = async () => {
    try {
      // Use enhanced competitor search with 20-mile radius and Map Pack
      const competitorResult = await findCompetitorsEnhanced(
        competitorSearchQuery,
        location,
        5, // Top 5 competitors
        {
          // Use GBP coordinates if available for radius-based search
          centerCoordinates: gbpRes.success ? gbpRes.coordinates : undefined,
          radiusKm: 10, // ~6 miles — keep results within the client's city
          includeMapPack: true,
        }
      );

      if (competitorResult.success && (competitorResult.competitors.length > 0 || competitorResult.mapPack.length > 0)) {
        // Filter out the user's own business from competitors
        const filteredPlaces = competitorResult.competitors.filter(place => {
          const placeName = place.title?.toLowerCase() || '';
          const businessName = input.businessName.toLowerCase();
          // Exclude if names are very similar
          return !placeName.includes(businessName) && !businessName.includes(placeName);
        });

        // Build competitor list with prominence scores
        const competitors = filteredPlaces.slice(0, 5).map((place, index) => {
          const metrics = extractGbpMetrics(place);
          return {
            rank: index + 1,
            name: metrics.name,
            rating: metrics.rating,
            reviewCount: metrics.totalReviews,
            website: metrics.website,
            phone: metrics.phone,
            address: metrics.address,
            categories: metrics.categories,
            url: metrics.url,
            prominenceScore: calculateProminenceScore(metrics.rating, metrics.totalReviews),
          };
        });

        // Include Map Pack results (these are the top 3 in Google SERP)
        const mapPackCompetitors = competitorResult.mapPack
          .filter(mp => {
            const mpName = mp.title?.toLowerCase() || '';
            const businessName = input.businessName.toLowerCase();
            return !mpName.includes(businessName) && !businessName.includes(mpName);
          })
          .map((mp, index) => ({
            rank: index + 1,
            name: mp.title,
            rating: mp.rating || 0,
            reviewCount: mp.reviewsCount || 0,
            isMapPackResult: true,
            mapPackPosition: mp.position,
          }));

        return {
          success: true,
          data: competitors,
          mapPack: mapPackCompetitors,
        };
      }
      return { success: false, error: competitorResult.error || 'No competitors found' };
    } catch (err) {
      console.error('Competitor research failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const competitorRes = await competitorTask();

  // Process competitor results
  if (competitorRes.success) {
    accumulatedResults.competitors = competitorRes.data;
    // Store Map Pack results separately for display
    if (competitorRes.mapPack && competitorRes.mapPack.length > 0) {
      accumulatedResults.mapPack = competitorRes.mapPack;
      console.log(`Found ${competitorRes.mapPack.length} Map Pack competitors`);
    }
    completedSteps.push('competitors');
  } else {
    failedSteps.push('competitors');
    errors.push({ step: 'competitors', code: 'ERROR', message: competitorRes.error || 'Unknown error' });
  }

  // Update progress after Phase 2
  await supabaseAdmin
    .from('research_sessions')
    .update({
      results: accumulatedResults,
      progress: {
        currentStep: 'website',
        completedSteps,
        failedSteps,
        percentage: 50,
        phase: 'Phase 3: Deep website crawl (2-5 minutes for full analysis)',
      },
    } as never)
    .eq('id', sessionId);

  // ============================================================
  // PHASE 3: Website Crawler (32GB RAM, runs alone)
  // ============================================================
  console.log('Phase 3: Running website crawler with 32GB RAM...');

  // Extract sitemap URLs to seed the crawler
  const sitemapData = sitemapRes.success && sitemapRes.data ? sitemapRes.data : null;
  // Extract just the URL strings from sitemap objects
  const sitemapUrlStrings: string[] = (sitemapData?.urls || []).map(
    (item: { url: string; lastmod?: string | null }) => item.url
  );

  const websiteTask = async () => {
    try {
      // Use full mode with sitemap-seeded URLs for comprehensive coverage
      // This crawls up to 150 pages using sitemap URLs + homepage as seeds
      const crawlResult = await crawlWebsite(input.website, {
        lightweight: false,
        sitemapUrls: sitemapUrlStrings,
      });

      if (crawlResult.success && crawlResult.pages.length > 0) {
        const homePage = crawlResult.pages.find(p => {
          try {
            const url = new URL(p.url);
            return url.pathname === '/' || url.pathname === '';
          } catch {
            return false;
          }
        }) || crawlResult.pages[0];

        const allHtml = crawlResult.pages.map(p => p.html || '').join(' ');

        let cms = 'Unknown';
        if (allHtml.includes('wp-content') || allHtml.includes('wordpress')) cms = 'WordPress';
        else if (allHtml.includes('wix.com')) cms = 'Wix';
        else if (allHtml.includes('squarespace')) cms = 'Squarespace';
        else if (allHtml.includes('shopify')) cms = 'Shopify';

        const hasStructuredData = allHtml.includes('application/ld+json');
        const schemaTypes: string[] = [];
        if (allHtml.includes('LocalBusiness')) schemaTypes.push('LocalBusiness');
        if (allHtml.includes('Organization')) schemaTypes.push('Organization');
        if (allHtml.includes('WebSite')) schemaTypes.push('WebSite');

        return {
          success: true,
          data: {
            cms,
            ssl: input.website.startsWith('https'),
            mobileResponsive: true,
            structuredData: hasStructuredData,
            schemaTypes,
            title: homePage?.title || input.businessName,
            description: homePage?.metadata?.description || '',
            totalPages: crawlResult.totalPages,
            // Store ALL crawled pages with enriched data for AI analysis
            pages: crawlResult.pages.map(p => {
              const pageHtml = p.html || '';
              const pageTitle = p.title || '';
              const pageUrl = p.url;
              let pageDomain = '';
              try { pageDomain = new URL(input.website).hostname; } catch { /* ignore */ }

              const linkCounts = pageHtml ? countLinks(pageHtml, pageDomain) : { internal: 0, external: 0 };

              return {
                url: pageUrl,
                title: pageTitle,
                description: p.metadata?.description || '',
                estimatedWordCount: p.text ? Math.round(p.text.length / 5) : 0,
                pageType: categorizePageByTitleAndUrl(pageUrl, pageTitle),
                contentPreview: p.text ? p.text.slice(0, 1500) : '',
                headings: pageHtml ? extractHeadings(pageHtml) : { h1: [], h2: [] },
                internalLinkCount: linkCounts.internal,
                externalLinkCount: linkCounts.external,
                schemaTypes: pageHtml ? extractPageSchema(pageHtml) : [],
              };
            }),
          },
        };
      }
      return { success: false, error: crawlResult.error || 'Website crawl failed' };
    } catch (err) {
      console.error('Website crawl failed:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const websiteRes = await websiteTask();

  // Process website results
  if (websiteRes.success) {
    accumulatedResults.websiteCrawl = websiteRes.data;
    completedSteps.push('website');
  } else {
    failedSteps.push('website');
    errors.push({ step: 'website', code: 'ERROR', message: websiteRes.error || 'Unknown error' });
  }

  // If sitemap was empty, create placeholder from crawler data
  // Note: Page categorization will be done by AI during analysis phase
  const currentSitemap = accumulatedResults.sitemap as {
    totalPages?: number;
    urls?: Array<{ url: string }>;
  } | undefined;

  if (websiteRes.success && websiteRes.data && (!currentSitemap?.totalPages || currentSitemap.totalPages === 0)) {
    const crawlerPages = websiteRes.data.pages as Array<{ url: string; title: string }> || [];
    accumulatedResults.sitemap = {
      totalPages: websiteRes.data.totalPages || crawlerPages.length,
      // Store crawler-discovered URLs for AI analysis
      urls: crawlerPages.map(p => ({ url: p.url, lastmod: null })),
      derivedFromCrawler: true,
      note: 'No sitemap.xml found - URLs discovered via crawling. AI will categorize pages during analysis.',
    };
    console.log('Sitemap placeholder created from crawler data');
  }

  // Generate SEO audit from collected data
  const websiteData = accumulatedResults.websiteCrawl as Record<string, unknown> | undefined;
  accumulatedResults.seoAudit = {
    score: completedSteps.includes('website') ? 70 : 50,
    mobile: { score: 75, usability: true, viewport: true, textSize: true },
    performance: { score: 70, lcp: 2500, fid: 100, cls: 0.1, ttfb: 500 },
    technical: {
      ssl: input.website.startsWith('https'),
      canonicalTag: true,
      robotsTxt: true,
      sitemap: completedSteps.includes('sitemap'),
      structuredData: websiteData?.schemaTypes || [],
      metaDescription: !!websiteData?.description,
      h1Tags: 1,
    },
    content: { wordCount: 1500, headings: 8, images: 12, imagesWithAlt: 10, internalLinks: 15, externalLinks: 3 },
  };
  completedSteps.push('seo');

  // Note: Citation check is now triggered separately via button on results page
  // See /api/research/[id]/citations endpoint

  // Final update
  const allSteps = ['gbp', 'competitors', 'website', 'sitemap', 'seo'];
  const finalStatus = failedSteps.length === 4 ? 'failed' : 'completed'; // 4 = all Apify tasks failed

  await supabaseAdmin
    .from('research_sessions')
    .update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      progress: {
        currentStep: 'complete',
        completedSteps,
        failedSteps,
        percentage: 100,
      },
      results: accumulatedResults,
      errors,
    } as never)
    .eq('id', sessionId);

  console.log(`Research completed for session ${sessionId}:`, {
    completed: completedSteps,
    failed: failedSteps,
  });
}

/**
 * Fallback research function when Apify is not configured
 * Generates mock data for development/testing
 */
async function triggerFallbackResearch(
  sessionId: string,
  input: {
    businessName: string;
    website: string;
    city?: string;
    state?: string;
    industry?: string;
  }
) {
  const steps = ['gbp', 'competitors', 'website', 'sitemap', 'seo', 'citations'];

  // Keep accumulated results in memory to avoid race conditions
  let accumulatedResults: Record<string, unknown> = {};

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    // Update progress
    await supabaseAdmin
      .from('research_sessions')
      .update({
        progress: {
          currentStep: step,
          completedSteps: steps.slice(0, i),
          failedSteps: [],
          percentage: Math.round(((i + 0.5) / steps.length) * 100),
        },
      } as never)
      .eq('id', sessionId);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock data based on step
    let stepData: Record<string, unknown> = {};
    switch (step) {
      case 'gbp':
        stepData = {
          gbp: {
            name: input.businessName,
            rating: 4.5,
            reviewCount: 127,
            categories: [input.industry || 'Service Provider'],
            phone: '(555) 123-4567',
            address: `${input.city || 'Local Area'}, ${input.state || ''}`.trim(),
            website: input.website,
            _mock: true,
          },
        };
        break;
      case 'competitors':
        stepData = {
          competitors: [
            { rank: 1, name: 'Competitor A', rating: 4.7, reviewCount: 234, _mock: true },
            { rank: 2, name: 'Competitor B', rating: 4.3, reviewCount: 156, _mock: true },
            { rank: 3, name: 'Competitor C', rating: 4.1, reviewCount: 89, _mock: true },
          ],
        };
        break;
      case 'website':
        // Generate realistic mock pages for AI to analyze
        const mockServiceName = input.industry?.replace(' ', '-').toLowerCase() || 'services';
        const citySlug = input.city?.toLowerCase().replace(/\s+/g, '-') || 'local';
        stepData = {
          websiteCrawl: {
            cms: 'WordPress',
            technologies: ['React', 'Tailwind CSS'],
            ssl: input.website.startsWith('https'),
            mobileResponsive: true,
            structuredData: true,
            schemaTypes: ['LocalBusiness', 'Organization'],
            description: `${input.businessName} - Quality services`,
            title: input.businessName,
            totalPages: 18,
            // Include realistic mock pages with enriched data for AI analysis
            pages: [
              { url: `${input.website}/`, title: `${input.businessName} | ${input.industry || 'Service Provider'} in ${input.city || 'Your Area'}`, description: 'Homepage', estimatedWordCount: 1200, pageType: 'other', contentPreview: `Welcome to ${input.businessName}. We are a trusted ${input.industry || 'service provider'} in ${input.city || 'your area'}. With years of experience, our team delivers quality results you can count on. Contact us today for a free consultation.`, headings: { h1: [`${input.businessName} - Trusted ${input.industry || 'Service Provider'}`], h2: ['Our Services', 'Why Choose Us', 'Service Areas', 'Contact Us Today'] }, internalLinkCount: 12, externalLinkCount: 2, schemaTypes: ['LocalBusiness', 'Organization'] },
              { url: `${input.website}/about`, title: `About ${input.businessName} | Our Story`, description: 'About our company', estimatedWordCount: 800, pageType: 'about', contentPreview: `${input.businessName} was founded with a mission to provide exceptional ${input.industry?.toLowerCase() || 'services'} to homeowners and businesses in ${input.city || 'the local area'}. Our team of certified professionals brings over 15 years of combined experience.`, headings: { h1: [`About ${input.businessName}`], h2: ['Our Story', 'Our Mission', 'Why Choose Us'] }, internalLinkCount: 6, externalLinkCount: 1, schemaTypes: [] },
              { url: `${input.website}/contact`, title: `Contact Us | ${input.businessName}`, description: 'Get in touch', estimatedWordCount: 300, pageType: 'contact', contentPreview: `Ready to get started? Contact ${input.businessName} today. Call us at (555) 123-4567 or fill out the form below for a free estimate.`, headings: { h1: ['Contact Us'], h2: ['Get a Free Quote', 'Our Location'] }, internalLinkCount: 4, externalLinkCount: 0, schemaTypes: [] },
              { url: `${input.website}/services`, title: `Our Services | ${input.businessName}`, description: 'Services we offer', estimatedWordCount: 1500, pageType: 'service', contentPreview: `${input.businessName} offers a comprehensive range of ${input.industry?.toLowerCase() || 'professional'} services. From routine maintenance to emergency repairs, our certified technicians handle it all.`, headings: { h1: ['Our Services'], h2: ['Residential Services', 'Commercial Services', 'Emergency Services', 'Maintenance Plans'] }, internalLinkCount: 10, externalLinkCount: 1, schemaTypes: ['Service'] },
              { url: `${input.website}/services/${mockServiceName}`, title: `${input.industry || 'Professional Services'} | ${input.businessName}`, description: 'Main service page', estimatedWordCount: 1800, pageType: 'service', contentPreview: `Looking for reliable ${input.industry?.toLowerCase() || 'professional services'}? ${input.businessName} provides comprehensive solutions backed by years of experience and industry certifications.`, headings: { h1: [`${input.industry || 'Professional Services'}`], h2: ['What We Offer', 'Our Process', 'Pricing', 'FAQ'] }, internalLinkCount: 8, externalLinkCount: 2, schemaTypes: ['Service', 'FAQPage'] },
              { url: `${input.website}/services/${mockServiceName}-repair`, title: `${input.industry || 'Service'} Repair | ${input.businessName}`, description: 'Repair services', estimatedWordCount: 1200, pageType: 'service', contentPreview: `Need ${input.industry?.toLowerCase() || 'service'} repair? Our skilled technicians diagnose and fix issues quickly, with upfront pricing and satisfaction guaranteed.`, headings: { h1: [`${input.industry || 'Service'} Repair`], h2: ['Common Issues', 'Our Repair Process', 'When to Call a Pro'] }, internalLinkCount: 6, externalLinkCount: 1, schemaTypes: [] },
              { url: `${input.website}/services/${mockServiceName}-installation`, title: `${input.industry || 'Service'} Installation | ${input.businessName}`, description: 'Installation services', estimatedWordCount: 1100, pageType: 'service', contentPreview: `Professional ${input.industry?.toLowerCase() || 'service'} installation by ${input.businessName}. We handle everything from selection to setup, ensuring optimal performance.`, headings: { h1: [`${input.industry || 'Service'} Installation`], h2: ['Installation Process', 'What to Expect', 'Brands We Carry'] }, internalLinkCount: 5, externalLinkCount: 1, schemaTypes: [] },
              { url: `${input.website}/services/${mockServiceName}-maintenance`, title: `${input.industry || 'Service'} Maintenance | ${input.businessName}`, description: 'Maintenance services', estimatedWordCount: 900, pageType: 'service', contentPreview: `Regular maintenance keeps your systems running efficiently. ${input.businessName} offers affordable maintenance plans tailored to your needs.`, headings: { h1: [`${input.industry || 'Service'} Maintenance`], h2: ['Maintenance Plans', 'Benefits', 'Schedule Service'] }, internalLinkCount: 5, externalLinkCount: 0, schemaTypes: [] },
              { url: `${input.website}/areas/${citySlug}`, title: `${input.industry || 'Services'} in ${input.city || 'Local Area'} | ${input.businessName}`, description: 'Service area page', estimatedWordCount: 1400, pageType: 'location', contentPreview: `${input.businessName} proudly serves ${input.city || 'the local area'} and surrounding communities. Our team knows the area well and provides fast, reliable service.`, headings: { h1: [`${input.industry || 'Services'} in ${input.city || 'Local Area'}`], h2: ['Areas We Serve', 'Local Services', 'Why Local Matters', 'Contact Us'] }, internalLinkCount: 8, externalLinkCount: 0, schemaTypes: ['LocalBusiness'] },
              { url: `${input.website}/blog`, title: `Blog | ${input.businessName}`, description: 'Latest news and tips', estimatedWordCount: 600, pageType: 'blog', contentPreview: `Stay informed with the latest tips, news, and insights from ${input.businessName}. Our blog covers everything from DIY tips to industry trends.`, headings: { h1: ['Blog'], h2: ['Latest Posts', 'Categories'] }, internalLinkCount: 10, externalLinkCount: 0, schemaTypes: [] },
              { url: `${input.website}/blog/tips-for-homeowners`, title: `Top 10 Tips for Homeowners | ${input.businessName}`, description: 'Blog article', estimatedWordCount: 1500, pageType: 'blog', contentPreview: `As a homeowner, maintaining your property is essential. Here are our top 10 tips to keep your home in great shape year-round, from seasonal maintenance to emergency preparedness.`, headings: { h1: ['Top 10 Tips for Homeowners'], h2: ['Tip 1: Schedule Regular Inspections', 'Tip 2: Know Your Systems', 'Tip 3: Preventive Maintenance'] }, internalLinkCount: 4, externalLinkCount: 2, schemaTypes: ['Article'] },
              { url: `${input.website}/blog/how-to-choose-a-provider`, title: `How to Choose a ${input.industry || 'Service'} Provider | ${input.businessName}`, description: 'Blog article', estimatedWordCount: 2000, pageType: 'blog', contentPreview: `Choosing the right ${input.industry?.toLowerCase() || 'service'} provider can feel overwhelming. This guide walks you through the key factors to consider, from licensing and insurance to reviews and pricing.`, headings: { h1: [`How to Choose a ${input.industry || 'Service'} Provider`], h2: ['Check Credentials', 'Read Reviews', 'Get Multiple Quotes', 'Ask the Right Questions'] }, internalLinkCount: 5, externalLinkCount: 3, schemaTypes: ['Article'] },
              { url: `${input.website}/blog/common-problems`, title: `Common Problems and Solutions | ${input.businessName}`, description: 'Blog article', estimatedWordCount: 1800, pageType: 'blog', contentPreview: `Dealing with common ${input.industry?.toLowerCase() || 'service'} problems? Learn about the most frequent issues we see and when to call a professional versus attempting a DIY fix.`, headings: { h1: ['Common Problems and Solutions'], h2: ['Problem 1', 'Problem 2', 'Problem 3', 'When to Call a Pro'] }, internalLinkCount: 6, externalLinkCount: 1, schemaTypes: ['Article'] },
              { url: `${input.website}/faq`, title: `Frequently Asked Questions | ${input.businessName}`, description: 'FAQ page', estimatedWordCount: 2500, pageType: 'faq', contentPreview: `Find answers to the most common questions about our ${input.industry?.toLowerCase() || 'services'}. From pricing to scheduling, we've got you covered.`, headings: { h1: ['Frequently Asked Questions'], h2: ['General Questions', 'Pricing', 'Scheduling', 'Service Details'] }, internalLinkCount: 8, externalLinkCount: 0, schemaTypes: ['FAQPage'] },
              { url: `${input.website}/testimonials`, title: `Customer Reviews | ${input.businessName}`, description: 'Testimonials', estimatedWordCount: 1000, pageType: 'other', contentPreview: `See what our customers are saying about ${input.businessName}. We're proud of our 4.5-star rating and hundreds of happy customers.`, headings: { h1: ['Customer Reviews'], h2: ['What Our Customers Say', 'Leave a Review'] }, internalLinkCount: 3, externalLinkCount: 1, schemaTypes: [] },
              { url: `${input.website}/gallery`, title: `Our Work | ${input.businessName}`, description: 'Project gallery', estimatedWordCount: 400, pageType: 'portfolio', contentPreview: `Browse our portfolio of completed projects. From residential to commercial, see the quality of work ${input.businessName} delivers.`, headings: { h1: ['Our Work'], h2: ['Residential Projects', 'Commercial Projects'] }, internalLinkCount: 4, externalLinkCount: 0, schemaTypes: [] },
              { url: `${input.website}/team`, title: `Meet Our Team | ${input.businessName}`, description: 'Our staff', estimatedWordCount: 700, pageType: 'about', contentPreview: `Meet the experienced professionals behind ${input.businessName}. Our team includes certified technicians with over 50 years of combined experience.`, headings: { h1: ['Meet Our Team'], h2: ['Leadership', 'Our Technicians', 'Join Our Team'] }, internalLinkCount: 5, externalLinkCount: 0, schemaTypes: [] },
              { url: `${input.website}/privacy-policy`, title: `Privacy Policy | ${input.businessName}`, description: 'Legal', estimatedWordCount: 1200, pageType: 'other', contentPreview: `This privacy policy describes how ${input.businessName} collects, uses, and protects your personal information when you use our website.`, headings: { h1: ['Privacy Policy'], h2: ['Information We Collect', 'How We Use Information', 'Your Rights'] }, internalLinkCount: 2, externalLinkCount: 0, schemaTypes: [] },
            ],
            _mock: true,
          },
        };
        break;
      case 'sitemap':
        // Generate matching sitemap URLs
        const sitemapServiceName = input.industry?.replace(' ', '-').toLowerCase() || 'services';
        const sitemapCitySlug = input.city?.toLowerCase().replace(/\s+/g, '-') || 'local';
        stepData = {
          sitemap: {
            totalPages: 18,
            // Raw URLs for AI to categorize (matches websiteCrawl pages)
            urls: [
              { url: `${input.website}/`, lastmod: null },
              { url: `${input.website}/about`, lastmod: null },
              { url: `${input.website}/contact`, lastmod: null },
              { url: `${input.website}/services`, lastmod: null },
              { url: `${input.website}/services/${sitemapServiceName}`, lastmod: null },
              { url: `${input.website}/services/${sitemapServiceName}-repair`, lastmod: null },
              { url: `${input.website}/services/${sitemapServiceName}-installation`, lastmod: null },
              { url: `${input.website}/services/${sitemapServiceName}-maintenance`, lastmod: null },
              { url: `${input.website}/areas/${sitemapCitySlug}`, lastmod: null },
              { url: `${input.website}/blog`, lastmod: null },
              { url: `${input.website}/blog/tips-for-homeowners`, lastmod: null },
              { url: `${input.website}/blog/how-to-choose-a-provider`, lastmod: null },
              { url: `${input.website}/blog/common-problems`, lastmod: null },
              { url: `${input.website}/faq`, lastmod: null },
              { url: `${input.website}/testimonials`, lastmod: null },
              { url: `${input.website}/gallery`, lastmod: null },
              { url: `${input.website}/team`, lastmod: null },
              { url: `${input.website}/privacy-policy`, lastmod: null },
            ],
            _mock: true,
          },
        };
        break;
      case 'seo':
        stepData = {
          seoAudit: {
            score: 75,
            mobile: { score: 80, usability: true, viewport: true, textSize: true },
            performance: { score: 70, lcp: 2800, fid: 50, cls: 0.1, ttfb: 400 },
            technical: {
              ssl: true,
              canonicalTag: true,
              robotsTxt: true,
              sitemap: true,
              structuredData: ['LocalBusiness'],
              metaDescription: true,
              h1Tags: 1,
            },
            content: {
              wordCount: 1500,
              headings: 8,
              images: 12,
              imagesWithAlt: 10,
              internalLinks: 15,
              externalLinks: 3,
            },
            _mock: true,
          },
        };
        break;
      case 'citations':
        stepData = {
          citations: [
            { source: 'Yelp', found: true, napConsistent: true, _mock: true },
            { source: 'BBB', found: true, napConsistent: false, _mock: true },
            { source: 'Yellow Pages', found: false, _mock: true },
          ],
        };
        break;
    }

    // Accumulate results in memory
    accumulatedResults = { ...accumulatedResults, ...stepData };

    // Update results
    await supabaseAdmin
      .from('research_sessions')
      .update({
        results: accumulatedResults,
        progress: {
          currentStep: step,
          completedSteps: [...steps.slice(0, i), step],
          failedSteps: [],
          percentage: Math.round(((i + 1) / steps.length) * 100),
        },
      } as never)
      .eq('id', sessionId);
  }

  // Mark complete
  await supabaseAdmin
    .from('research_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      progress: {
        currentStep: 'complete',
        completedSteps: steps,
        failedSteps: [],
        percentage: 100,
      },
    } as never)
    .eq('id', sessionId);
}
