import { AnalysisRequest, AnalysisResult } from '@/lib/types';
import { IntakeData } from '@/lib/types/intake';
import { generateId } from '@/lib/utils/helpers';
import { saveAnalysis, updateAnalysis, getAnalysis } from '@/lib/store';
import { clientLookup } from './clientLookup';
import { competitorFinder } from './competitorFinder';
import { serpAnalysis } from './serpAnalysis';
import { seoAudit } from './seoAudit';
import { gbpAnalysis } from './gbpAnalysis';
import { localSeoAudit } from './localSeoAudit';
import {
  extractSitemap,
  analyzeSitemapStructure,
  searchGooglePlaces,
  extractGbpMetrics,
  findCompetitors,
} from './apify';

export interface AnalysisOrchestrationResult {
  analysisId: string;
  status: 'started' | 'error';
  error?: string;
}

// Create initial analysis record
export function createAnalysisJob(request: AnalysisRequest): string {
  const id = generateId();

  const initialResult: AnalysisResult = {
    id,
    status: 'pending',
    createdAt: new Date(),
    client: {
      id: '',
      name: request.businessName,
      address: {
        street: '',
        city: request.location.split(',')[0]?.trim() || '',
        state: request.location.split(',')[1]?.trim() || '',
        zip: '',
      },
      phone: '',
      website: '',
      industry: request.industry,
      serviceArea: [],
      categories: request.specificServices || [],
    },
    competitors: [],
    serp: {
      keywords: [],
      organicPositions: [],
      paidPositions: [],
      featuredSnippets: [],
      localPackRankings: [],
    },
    seo: {
      domainAuthority: 0,
      pageAuthority: 0,
      backlinks: {
        totalBacklinks: 0,
        referringDomains: 0,
        doFollowRatio: 0,
        topReferrers: [],
      },
      technicalSeo: {
        mobileScore: 0,
        pageSpeedDesktop: 0,
        pageSpeedMobile: 0,
        httpsEnabled: false,
        hasXmlSitemap: false,
        hasRobotsTxt: false,
        canonicalTagsValid: false,
        noIndexIssues: 0,
        brokenLinks: 0,
        coreWebVitals: { lcp: 0, fid: 0, cls: 0 },
      },
      contentScore: 0,
      aeoReadiness: {
        structuredDataScore: 0,
        faqPresence: false,
        voiceSearchOptimization: 0,
        answerBoxEligibility: 0,
        schemaTypes: [],
      },
    },
    gbp: {
      profileCompleteness: 0,
      rating: 0,
      reviewCount: 0,
      recentReviews: [],
      photos: { count: 0, quality: 0 },
      posts: [],
      qAndA: [],
      attributes: [],
      serviceAreas: [],
      businessHours: [],
      verified: false,
    },
    localSeo: {
      citationConsistency: 0,
      napConsistency: 0,
      directoryListings: [],
      proximityFactors: {
        distanceToCenter: 0,
        serviceAreaCoverage: 0,
        competitorDensity: 0,
        marketSaturation: 0,
      },
      localKeywordRankings: [],
    },
  };

  saveAnalysis(initialResult);
  return id;
}

// Run the full analysis (called asynchronously)
export async function runFullAnalysis(id: string, request: AnalysisRequest): Promise<void> {
  try {
    // Update status to processing
    updateAnalysis(id, { status: 'processing' });

    // Step 1: Look up client info
    const clientResult = await clientLookup({
      businessName: request.businessName,
      location: request.location,
      industry: request.industry,
    });

    if (request.specificServices && request.specificServices.length > 0) {
      clientResult.business.categories = request.specificServices;
    }

    updateAnalysis(id, { client: clientResult.business });

    // Step 2: Find competitors
    const competitorResult = await competitorFinder({
      client: clientResult.business,
    });

    updateAnalysis(id, { competitors: competitorResult.competitors });

    // Step 3: Run all analyses in parallel
    const [serpResult, seoResult, gbpResult, localSeoResult] = await Promise.all([
      serpAnalysis({
        client: clientResult.business,
        competitors: competitorResult.competitors,
      }),
      seoAudit({
        client: clientResult.business,
        websiteUrl: clientResult.business.website,
      }),
      gbpAnalysis({
        client: clientResult.business,
      }),
      localSeoAudit({
        client: clientResult.business,
        competitors: competitorResult.competitors,
      }),
    ]);

    // Step 4: Update with final results
    updateAnalysis(id, {
      status: 'completed',
      completedAt: new Date(),
      serp: serpResult.serp,
      seo: seoResult.seo,
      gbp: gbpResult.gbp,
      localSeo: localSeoResult.localSeo,
    });
  } catch (error) {
    updateAnalysis(id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}

// Extended analysis result for intake-based analysis
export interface IntakeAnalysisResult {
  id: string;
  intakeId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  intake: IntakeData;
  gbp?: {
    place: ReturnType<typeof extractGbpMetrics>;
    metrics: ReturnType<typeof extractGbpMetrics>;
  };
  competitors?: Array<{
    rank: number;
    name: string;
    rating: number;
    totalReviews: number;
    hasWebsite: boolean;
    website?: string;
    phone?: string;
    address?: string;
    categories: string[];
    url?: string;
  }>;
  sitemap?: {
    totalPages: number;
    pageTypes: Record<string, number>;
    hasServicePages: boolean;
    hasBlog: boolean;
    hasLocationPages: boolean;
  };
  seo?: {
    domainAuthority: number;
    pageAuthority: number;
    mobileScore: number;
    pageSpeedDesktop: number;
    pageSpeedMobile: number;
    contentScore: number;
    structuredDataScore: number;
  };
}

// In-memory store for intake-based analyses
const intakeAnalysisStore = new Map<string, IntakeAnalysisResult>();

export function saveIntakeAnalysis(result: IntakeAnalysisResult): void {
  intakeAnalysisStore.set(result.id, result);
}

export function getIntakeAnalysis(id: string): IntakeAnalysisResult | undefined {
  return intakeAnalysisStore.get(id);
}

export function updateIntakeAnalysis(id: string, updates: Partial<IntakeAnalysisResult>): void {
  const existing = intakeAnalysisStore.get(id);
  if (existing) {
    intakeAnalysisStore.set(id, { ...existing, ...updates });
  }
}

// Create an intake-based analysis job
export function createIntakeAnalysisJob(intake: IntakeData): string {
  const id = generateId();

  const initialResult: IntakeAnalysisResult = {
    id,
    intakeId: intake.id || '',
    status: 'pending',
    createdAt: new Date(),
    intake,
  };

  saveIntakeAnalysis(initialResult);
  return id;
}

// Run intake-based analysis using Apify services
export async function runIntakeAnalysis(analysisId: string): Promise<void> {
  const analysis = getIntakeAnalysis(analysisId);
  if (!analysis) {
    throw new Error('Analysis not found');
  }

  try {
    updateIntakeAnalysis(analysisId, { status: 'processing' });

    const { intake } = analysis;
    const results: Partial<IntakeAnalysisResult> = {};

    // Step 1: Get GBP data if URL provided
    if (intake.localSEO.googleBusinessProfileUrl) {
      try {
        const gbpResult = await searchGooglePlaces(
          intake.businessContext.businessName,
          intake.businessContext.primaryServiceArea,
          { maxResults: 1 }
        );

        if (gbpResult.success && gbpResult.places.length > 0) {
          const place = gbpResult.places[0];
          const metrics = extractGbpMetrics(place);
          results.gbp = { place: metrics, metrics };
        }
      } catch (error) {
        console.error('GBP analysis failed:', error);
      }
    }

    // Step 2: Find competitors
    try {
      const primaryService = intake.revenueServices.primaryServices[0] || 'services';
      const competitorResult = await findCompetitors(
        primaryService,
        intake.businessContext.primaryServiceArea,
        5
      );

      if (competitorResult.success) {
        results.competitors = competitorResult.places.map((comp, index) => ({
          rank: index + 1,
          name: comp.title || 'Unknown',
          rating: comp.totalScore || 0,
          totalReviews: comp.reviewsCount || 0,
          hasWebsite: !!comp.website,
          website: comp.website || undefined,
          phone: comp.phone || undefined,
          address: comp.address || undefined,
          categories: comp.categoryName ? [comp.categoryName] : [],
          url: comp.url || undefined,
        }));
      }
    } catch (error) {
      console.error('Competitor analysis failed:', error);
    }

    // Step 3: Analyze sitemap if website provided
    if (intake.businessContext.websiteUrl) {
      try {
        const sitemapResult = await extractSitemap(intake.businessContext.websiteUrl, {
          maxUrls: 200,
        });

        if (sitemapResult.success && sitemapResult.urls.length > 0) {
          const sitemapAnalysis = analyzeSitemapStructure(sitemapResult.urls);
          results.sitemap = sitemapAnalysis;
        }
      } catch (error) {
        console.error('Sitemap analysis failed:', error);
      }
    }

    // Step 4: Generate estimated SEO metrics based on available data
    const isFastPageLoad = intake.websiteReadiness.pageLoadSpeed === 'fast';
    results.seo = {
      domainAuthority: Math.floor(Math.random() * 30) + 20, // Placeholder - would use real API
      pageAuthority: Math.floor(Math.random() * 30) + 15,
      mobileScore: intake.websiteReadiness.mobileResponsive ? 85 : 60,
      pageSpeedDesktop: isFastPageLoad ? 80 : 55,
      pageSpeedMobile: isFastPageLoad ? 70 : 45,
      contentScore: results.sitemap?.totalPages ? Math.min(results.sitemap.totalPages * 5, 100) : 30,
      structuredDataScore: intake.aiConsiderations.hasStructuredData ? 80 : 20,
    };

    // Update with final results
    updateIntakeAnalysis(analysisId, {
      ...results,
      status: 'completed',
      completedAt: new Date(),
    });
  } catch (error) {
    updateIntakeAnalysis(analysisId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
