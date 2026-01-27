import { getServerClient } from '@/lib/supabase';
import type { Client, ResearchResultsUpdate, ResearchResults } from '@/lib/supabase/types';
import {
  searchGooglePlaces,
  getGooglePlaceByUrl,
  extractGbpMetrics,
  findCompetitors as findGbpCompetitors
} from './apify/googlePlaces';
import { extractSitemap, analyzeSitemapStructure } from './apify/sitemapExtractor';
import { crawlWebsite } from './apify/websiteCrawler';
import { analyzeWebsiteData } from './websiteAnalyzer';

export type ResearchTaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ResearchProgress {
  clientId: string;
  gbp: { status: ResearchTaskStatus; error?: string };
  sitemap: { status: ResearchTaskStatus; error?: string };
  website: { status: ResearchTaskStatus; error?: string };
  competitors: { status: ResearchTaskStatus; error?: string };
  overallStatus: 'pending' | 'running' | 'completed' | 'partial';
}

interface ResearchInput {
  businessName: string;
  websiteUrl: string;
  gbpUrl?: string;
  primaryServiceArea: string;
}

/**
 * Create a new client and initialize research
 */
export async function createResearchJob(input: ResearchInput): Promise<string> {
  const supabase = getServerClient();

  // Create client record
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      business_name: input.businessName,
      website_url: input.websiteUrl,
      gbp_url: input.gbpUrl || null,
      primary_service_area: input.primaryServiceArea,
      status: 'researching',
    } as never)
    .select()
    .single();

  if (error || !client) {
    throw new Error(`Failed to create client: ${error?.message}`);
  }

  const clientData = client as Client;

  // Create research results record with pending statuses
  const { error: researchError } = await supabase
    .from('research_results')
    .insert({
      client_id: clientData.id,
      gbp_status: 'pending',
      sitemap_status: 'pending',
      website_status: 'pending',
      competitors_status: 'pending',
    } as never);

  if (researchError) {
    throw new Error(`Failed to create research record: ${researchError.message}`);
  }

  return clientData.id;
}

/**
 * Update a specific task status
 */
async function updateTaskStatus(
  clientId: string,
  task: 'gbp' | 'sitemap' | 'website' | 'competitors',
  status: ResearchTaskStatus,
  error?: string
): Promise<void> {
  const supabase = getServerClient();

  const updates: Record<string, string | null> = {
    [`${task}_status`]: status,
  };

  if (error) {
    updates[`${task}_error`] = error;
  }

  await supabase
    .from('research_results')
    .update(updates as never)
    .eq('client_id', clientId);
}

/**
 * Save research results to database
 */
async function saveResearchResults(
  clientId: string,
  updates: ResearchResultsUpdate
): Promise<void> {
  const supabase = getServerClient();

  await supabase
    .from('research_results')
    .update(updates as never)
    .eq('client_id', clientId);
}

/**
 * Run GBP research task
 */
async function runGbpResearch(client: Client): Promise<ResearchResultsUpdate> {
  await updateTaskStatus(client.id, 'gbp', 'running');

  try {
    let result;

    // If GBP URL provided, use it directly
    if (client.gbp_url) {
      result = await getGooglePlaceByUrl(client.gbp_url);
    } else {
      // Search by business name and location
      result = await searchGooglePlaces(
        client.business_name,
        client.primary_service_area,
        { maxResults: 1 }
      );
    }

    if (!result.success || result.places.length === 0) {
      await updateTaskStatus(client.id, 'gbp', 'failed', result.error || 'No results found');
      return { gbp_status: 'failed', gbp_error: result.error || 'No results found' };
    }

    const place = result.places[0];
    const metrics = extractGbpMetrics(place);

    const updates: ResearchResultsUpdate = {
      gbp_rating: metrics.rating,
      gbp_review_count: metrics.totalReviews,
      gbp_categories: metrics.categories,
      gbp_phone: metrics.phone,
      gbp_address: metrics.address,
      gbp_photos_count: metrics.photoCount,
      gbp_raw_data: place as never,
      gbp_status: 'completed',
    };

    await saveResearchResults(client.id, updates);
    await updateTaskStatus(client.id, 'gbp', 'completed');

    return updates;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await updateTaskStatus(client.id, 'gbp', 'failed', errorMsg);
    return { gbp_status: 'failed', gbp_error: errorMsg };
  }
}

/**
 * Run sitemap research task
 */
async function runSitemapResearch(client: Client): Promise<ResearchResultsUpdate> {
  await updateTaskStatus(client.id, 'sitemap', 'running');

  try {
    const result = await extractSitemap(client.website_url);

    if (!result.success) {
      await updateTaskStatus(client.id, 'sitemap', 'failed', result.error || 'Extraction failed');
      return { sitemap_status: 'failed', sitemap_error: result.error };
    }

    const analysis = analyzeSitemapStructure(result.urls);

    const updates: ResearchResultsUpdate = {
      sitemap_total_pages: analysis.totalPages,
      sitemap_has_service_pages: analysis.hasServicePages,
      sitemap_has_blog: analysis.hasBlog,
      sitemap_has_location_pages: analysis.hasLocationPages,
      sitemap_page_types: analysis.pageTypes,
      sitemap_status: 'completed',
    };

    await saveResearchResults(client.id, updates);
    await updateTaskStatus(client.id, 'sitemap', 'completed');

    return updates;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await updateTaskStatus(client.id, 'sitemap', 'failed', errorMsg);
    return { sitemap_status: 'failed', sitemap_error: errorMsg };
  }
}

/**
 * Run website crawl research task
 */
async function runWebsiteResearch(client: Client): Promise<ResearchResultsUpdate> {
  await updateTaskStatus(client.id, 'website', 'running');

  try {
    const result = await crawlWebsite(client.website_url, {
      maxPages: 10,
      maxDepth: 2,
    });

    if (!result.success || result.pages.length === 0) {
      await updateTaskStatus(client.id, 'website', 'failed', result.error || 'No pages crawled');
      return { website_status: 'failed', website_error: result.error };
    }

    // Analyze website data to detect CMS, schema, etc.
    const analysis = analyzeWebsiteData(result.pages);

    const updates: ResearchResultsUpdate = {
      website_cms: analysis.cms,
      website_has_ssl: analysis.hasSSL,
      website_is_mobile_responsive: analysis.isMobileResponsive,
      website_has_structured_data: analysis.hasStructuredData,
      website_description: analysis.description,
      website_schema_types: analysis.schemaTypes,
      website_raw_data: { pages: result.pages.slice(0, 5) } as never, // Store first 5 pages
      website_status: 'completed',
    };

    await saveResearchResults(client.id, updates);
    await updateTaskStatus(client.id, 'website', 'completed');

    return updates;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await updateTaskStatus(client.id, 'website', 'failed', errorMsg);
    return { website_status: 'failed', website_error: errorMsg };
  }
}

/**
 * Run competitor research task
 */
async function runCompetitorResearch(client: Client): Promise<ResearchResultsUpdate> {
  await updateTaskStatus(client.id, 'competitors', 'running');

  try {
    // Infer business type from business name or use generic search
    const searchQuery = client.business_name.split(' ').slice(-1)[0] || 'services';

    const result = await findGbpCompetitors(
      searchQuery,
      client.primary_service_area,
      5
    );

    if (!result.success) {
      await updateTaskStatus(client.id, 'competitors', 'failed', result.error);
      return { competitors_status: 'failed', competitors_error: result.error };
    }

    // Extract metrics for each competitor
    const competitors = result.places.map((place, index) => ({
      rank: index + 1,
      name: place.title,
      rating: place.totalScore || 0,
      reviewCount: place.reviewsCount || 0,
      website: place.website,
      phone: place.phone,
      address: place.address,
      categories: place.categoryName ? [place.categoryName] : [],
    }));

    const updates: ResearchResultsUpdate = {
      competitors: competitors,
      competitors_status: 'completed',
    };

    await saveResearchResults(client.id, updates);
    await updateTaskStatus(client.id, 'competitors', 'completed');

    return updates;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await updateTaskStatus(client.id, 'competitors', 'failed', errorMsg);
    return { competitors_status: 'failed', competitors_error: errorMsg };
  }
}

/**
 * Run all research tasks in parallel
 */
export async function runResearch(clientId: string): Promise<void> {
  const supabase = getServerClient();

  // Get client data
  const { data: clientData, error } = await supabase
    .from('clients')
    .select()
    .eq('id', clientId)
    .single();

  const client = clientData as Client | null;

  if (error || !client) {
    throw new Error(`Client not found: ${clientId}`);
  }

  // Run all research tasks in parallel
  await Promise.allSettled([
    runGbpResearch(client),
    runSitemapResearch(client),
    runWebsiteResearch(client),
    runCompetitorResearch(client),
  ]);

  // Update client status based on results
  const { data: researchData } = await supabase
    .from('research_results')
    .select()
    .eq('client_id', clientId)
    .single();

  const research = researchData as ResearchResults | null;

  if (research) {
    const allCompleted =
      research.gbp_status === 'completed' &&
      research.sitemap_status === 'completed' &&
      research.website_status === 'completed' &&
      research.competitors_status === 'completed';

    const allFailed =
      research.gbp_status === 'failed' &&
      research.sitemap_status === 'failed' &&
      research.website_status === 'failed' &&
      research.competitors_status === 'failed';

    const newStatus = allCompleted ? 'ready' : allFailed ? 'draft' : 'ready';

    await supabase
      .from('clients')
      .update({ status: newStatus } as never)
      .eq('id', clientId);
  }
}

/**
 * Get research progress for a client
 */
export async function getResearchProgress(clientId: string): Promise<ResearchProgress | null> {
  const supabase = getServerClient();

  const { data: researchData, error } = await supabase
    .from('research_results')
    .select()
    .eq('client_id', clientId)
    .single();

  const research = researchData as ResearchResults | null;

  if (error || !research) {
    return null;
  }

  const statuses = [
    research.gbp_status,
    research.sitemap_status,
    research.website_status,
    research.competitors_status,
  ];

  let overallStatus: ResearchProgress['overallStatus'] = 'pending';

  if (statuses.every(s => s === 'completed')) {
    overallStatus = 'completed';
  } else if (statuses.some(s => s === 'running')) {
    overallStatus = 'running';
  } else if (statuses.some(s => s === 'completed') || statuses.some(s => s === 'failed')) {
    overallStatus = 'partial';
  }

  return {
    clientId,
    gbp: {
      status: research.gbp_status as ResearchTaskStatus,
      error: research.gbp_error || undefined
    },
    sitemap: {
      status: research.sitemap_status as ResearchTaskStatus,
      error: research.sitemap_error || undefined
    },
    website: {
      status: research.website_status as ResearchTaskStatus,
      error: research.website_error || undefined
    },
    competitors: {
      status: research.competitors_status as ResearchTaskStatus,
      error: research.competitors_error || undefined
    },
    overallStatus,
  };
}

/**
 * Get client with research results
 */
export async function getClientWithResearch(clientId: string) {
  const supabase = getServerClient();

  const { data: clientData, error: clientError } = await supabase
    .from('clients')
    .select()
    .eq('id', clientId)
    .single();

  const client = clientData as Client | null;

  if (clientError || !client) {
    return null;
  }

  const { data: researchData } = await supabase
    .from('research_results')
    .select()
    .eq('client_id', clientId)
    .single();

  const research = researchData as ResearchResults | null;

  return {
    ...client,
    research_results: research,
  };
}

/**
 * List all clients with their research status
 */
export async function listClients() {
  const supabase = getServerClient();

  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      research_results (
        gbp_status,
        sitemap_status,
        website_status,
        competitors_status
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to list clients:', error);
    return [];
  }

  return data || [];
}
