import { getApifyClient } from '@/lib/apify';

const ACTOR_ID = 'alizarin_refrigerator-owner/citation-checker-ai';

/**
 * Input for the Citation Checker AI actor
 */
export interface CitationCheckerInput {
  /** The exact business name as it should appear in directories */
  businessName: string;
  /** Street address */
  streetAddress?: string;
  /** City */
  city?: string;
  /** State (2-letter code preferred) */
  state?: string;
  /** ZIP code */
  zipCode?: string;
  /** Phone number (any format) */
  phone?: string;
  /** Website URL */
  website?: string;
  /** Pre-known listing URLs for faster checking */
  preknownUrls?: Record<string, string>;
  /** Enable AI-powered correction suggestions (requires Anthropic API key in actor settings) */
  enableAiSuggestions?: boolean;
}

/**
 * Individual citation result from a directory
 */
export interface CitationResult {
  /** Directory name (e.g., "Yelp", "Google Business Profile") */
  directory: string;
  /** Whether the business was found on this directory */
  found: boolean;
  /** The URL where the listing was found */
  listingUrl?: string;
  /** NAP data found on the directory */
  napData?: {
    name?: string;
    address?: string;
    phone?: string;
    website?: string;
  };
  /** Whether NAP is consistent with input */
  napConsistent?: boolean;
  /** Specific inconsistencies found */
  inconsistencies?: string[];
  /** AI-suggested corrections (if enabled) */
  suggestedCorrections?: string[];
  /** Confidence score for the match */
  confidence?: number;
}

/**
 * Output from the Citation Checker AI actor
 */
export interface CitationCheckerOutput {
  success: boolean;
  /** Total directories checked */
  totalDirectoriesChecked: number;
  /** Directories where business was found */
  directoriesFound: number;
  /** Directories with NAP consistency issues */
  directoriesWithIssues: number;
  /** Overall NAP consistency score (0-100) */
  napConsistencyScore: number;
  /** Individual citation results */
  citations: CitationResult[];
  /** Summary of common issues */
  commonIssues?: string[];
  /** Recommended actions */
  recommendations?: string[];
  /** Error message if failed */
  error?: string;
}

/**
 * Check business citations across 36+ directories
 *
 * This actor verifies NAP (Name, Address, Phone) consistency
 * across major business directories like Yelp, BBB, Yellow Pages, etc.
 *
 * Cost: ~$0.46 per run ($0.10 start + $0.01 per directory)
 */
export async function checkCitations(
  input: CitationCheckerInput
): Promise<CitationCheckerOutput> {
  const client = getApifyClient();

  // Build actor input - field names must match actor's expected schema
  // Required: businessName, city, state
  // Optional: address (street only), phone, website, platforms, providedUrls, anthropicApiKey, enableAiAnalysis
  const actorInput: Record<string, unknown> = {
    businessName: input.businessName,
  };

  // City and State are REQUIRED separate fields
  if (input.city) actorInput.city = input.city;
  if (input.state) actorInput.state = input.state;

  // Address is just the street address (optional)
  if (input.streetAddress) actorInput.address = input.streetAddress;

  // Other optional fields
  if (input.phone) actorInput.phone = input.phone;
  if (input.website) actorInput.website = input.website;
  if (input.preknownUrls) actorInput.providedUrls = input.preknownUrls; // Note: field name is providedUrls
  if (input.enableAiSuggestions) actorInput.enableAiAnalysis = input.enableAiSuggestions; // Note: field name is enableAiAnalysis

  // Memory: 4GB, Timeout: 10 minutes (checking 36+ directories takes time)
  const memory = 4096;
  const timeout = 600;

  console.log(`Starting citation check for: ${input.businessName}`);
  console.log(`Location: ${input.city}, ${input.state}`);
  console.log(`Citation checker input:`, JSON.stringify(actorInput, null, 2));

  try {
    const { items } = await client.callActor<Record<string, unknown>, CitationResult>(
      ACTOR_ID,
      actorInput,
      { waitForFinish: timeout, timeout, memory }
    );

    // Log raw response for debugging
    console.log(`Citation checker raw response: ${items?.length || 0} items`);
    if (items && items.length > 0) {
      console.log('First item structure:', JSON.stringify(items[0], null, 2));
    }

    // Process results - actor returns { summary, citations, aiAnalysis? }
    // Or it might return the citations array directly
    let citations: CitationResult[] = [];
    let rawData = items as unknown;

    // Handle both array response and object with citations property
    let citationsArray: Record<string, unknown>[] = [];
    if (Array.isArray(rawData)) {
      // Check if first item has 'citations' property (wrapped response)
      if (rawData.length === 1 && rawData[0] && typeof rawData[0] === 'object' && 'citations' in rawData[0]) {
        citationsArray = (rawData[0] as Record<string, unknown>).citations as Record<string, unknown>[];
        console.log('Found wrapped response with citations array');
      } else {
        citationsArray = rawData as Record<string, unknown>[];
      }
    }

    if (citationsArray.length > 0) {
      // Map actor output to our CitationResult format
      // Actor returns: platform, status (correct/incorrect/missing/found), url, nameMatch, addressMatch, phoneMatch
      citations = citationsArray.map((item) => {
        const status = (item.status as string) || '';
        const isFound = status === 'correct' || status === 'incorrect' || status === 'found';
        const isConsistent = status === 'correct';

        // Build inconsistencies list from match fields
        const inconsistencies: string[] = [];
        if (item.nameMatch === false) inconsistencies.push('Business name mismatch');
        if (item.addressMatch === false) inconsistencies.push('Address mismatch');
        if (item.phoneMatch === false) inconsistencies.push('Phone number mismatch');

        return {
          directory: (item.platform || item.directory || item.source || 'Unknown') as string,
          found: isFound,
          listingUrl: (item.url || item.listingUrl) as string | undefined,
          napData: {
            name: item.foundName as string | undefined,
            address: item.foundAddress as string | undefined,
            phone: item.foundPhone as string | undefined,
          },
          napConsistent: isFound ? isConsistent : undefined,
          inconsistencies,
          confidence: isFound ? (isConsistent ? 1.0 : 0.5) : 0,
        };
      });
    }

    console.log(`Processed ${citations.length} citations`);
    const found = citations.filter(c => c.found);
    const withIssues = citations.filter(c => c.found && !c.napConsistent);

    // Calculate NAP consistency score
    const napConsistencyScore = found.length > 0
      ? Math.round(((found.length - withIssues.length) / found.length) * 100)
      : 0;

    // Extract common issues
    const allIssues = citations
      .filter(c => c.inconsistencies && c.inconsistencies.length > 0)
      .flatMap(c => c.inconsistencies || []);

    const issueCounts = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonIssues = Object.entries(issueCounts)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .map(([issue, count]) => `${issue} (${count} directories)`);

    // Generate recommendations
    const recommendations: string[] = [];

    if (withIssues.length > 0) {
      recommendations.push(`Fix NAP inconsistencies on ${withIssues.length} directories`);
    }

    const notFound = citations.filter(c => !c.found);
    if (notFound.length > 10) {
      recommendations.push(`Claim listings on ${notFound.length} directories where not found`);
    }

    if (napConsistencyScore < 80) {
      recommendations.push('Prioritize NAP consistency to improve local SEO');
    }

    console.log(`Citation check completed: ${found.length}/${citations.length} found, ${napConsistencyScore}% consistent`);

    return {
      success: true,
      totalDirectoriesChecked: citations.length,
      directoriesFound: found.length,
      directoriesWithIssues: withIssues.length,
      napConsistencyScore,
      citations,
      commonIssues,
      recommendations,
    };
  } catch (error) {
    console.error('Citation check failed:', error);
    return {
      success: false,
      totalDirectoriesChecked: 0,
      directoriesFound: 0,
      directoriesWithIssues: 0,
      napConsistencyScore: 0,
      citations: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Start citation check without waiting (async)
 */
export async function startCitationCheck(
  input: CitationCheckerInput
): Promise<{ runId: string; actorId: string } | null> {
  const client = getApifyClient();

  const actorInput: Record<string, unknown> = {
    businessName: input.businessName,
  };

  if (input.streetAddress) actorInput.streetAddress = input.streetAddress;
  if (input.city) actorInput.city = input.city;
  if (input.state) actorInput.state = input.state;
  if (input.zipCode) actorInput.zipCode = input.zipCode;
  if (input.phone) actorInput.phone = input.phone;
  if (input.website) actorInput.website = input.website;

  try {
    const run = await client.runActor(ACTOR_ID, actorInput);
    return {
      runId: run.id,
      actorId: ACTOR_ID,
    };
  } catch (error) {
    console.error('Failed to start citation check:', error);
    return null;
  }
}

/**
 * Get results from a completed citation check
 */
export async function getCitationResults(
  datasetId: string
): Promise<CitationResult[]> {
  const client = getApifyClient();
  return client.getDatasetItems<CitationResult>(datasetId, { limit: 100 });
}

/**
 * Transform citation results to the format used in research results
 */
export function transformCitationResults(
  output: CitationCheckerOutput
): Array<{
  source: string;
  found: boolean;
  napConsistent: boolean | null;
  url?: string;
  issues?: string[];
}> {
  return output.citations.map(citation => ({
    source: citation.directory,
    found: citation.found,
    napConsistent: citation.found ? citation.napConsistent ?? null : null,
    url: citation.listingUrl,
    issues: citation.inconsistencies,
  }));
}
