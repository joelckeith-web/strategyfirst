import type { ResearchResults } from '@/lib/supabase/types';
import type { IntakeData } from '@/lib/types/intake';

interface CompetitorData {
  rank: number;
  name: string;
  rating: number;
  reviewCount: number;
  website?: string;
  phone?: string;
  address?: string;
  categories?: string[];
}

/**
 * Map research results to intake form fields
 * This pre-populates the 68-field intake form with auto-discovered data
 */
export function mapResearchToIntake(
  research: ResearchResults,
  clientData: { business_name: string; website_url: string; primary_service_area: string }
): Partial<IntakeData> {
  const competitors = (research.competitors as CompetitorData[] | null) || [];
  const pageTypes = (research.sitemap_page_types as Record<string, number> | null) || {};

  return {
    // Business Context (Section 1)
    businessContext: {
      businessName: clientData.business_name,
      websiteUrl: clientData.website_url,
      primaryServiceArea: clientData.primary_service_area,
      secondaryServiceAreas: [],
      yearsInBusiness: '', // User input needed
      businessDescription: research.website_description || '',
      uniqueValueProposition: '', // User input needed
      targetDemographic: '', // User input needed
      averageJobValue: '', // User input needed
      monthlyLeadGoal: '', // User input needed
    },

    // Revenue & Services (Section 2) - mostly needs user input
    revenueServices: {
      primaryServices: research.gbp_categories || [],
      highestMarginServices: [],
      mostRequestedServices: [],
      seasonalServices: [],
      emergencyServices: [],
      serviceAreaRadius: '', // User input needed
      pricingModel: 'mixed' as const, // Default value
      averageProjectSize: '', // User input needed
      competitiveAdvantages: [],
    },

    // Local SEO (Section 3)
    localSEO: {
      googleBusinessProfileUrl: '', // Will be set from client if available
      gbpCategories: research.gbp_categories || [],
      currentGoogleRating: research.gbp_rating || 0,
      totalReviews: research.gbp_review_count || 0,
      mainCompetitors: competitors.slice(0, 5).map((c: CompetitorData) => ({
        name: c.name,
        website: c.website,
      })),
      targetKeywords: [], // User input needed
      currentRankingKeywords: [], // User input needed
      localDirectoriesListed: [], // User input needed
      napConsistencyIssues: '', // User input needed
      citationSources: [], // User input needed
    },

    // Website Readiness (Section 4)
    websiteReadiness: {
      currentCMS: research.website_cms || 'unknown',
      websiteAge: '', // Could potentially be detected
      lastMajorUpdate: '',
      hasServicePages: research.sitemap_has_service_pages || false,
      hasLocationPages: research.sitemap_has_location_pages || false,
      hasBlog: research.sitemap_has_blog || false,
      blogPostFrequency: inferBlogFrequency(pageTypes.blog || 0),
      existingContentAssets: inferContentAssets(pageTypes),
      technicalIssuesKnown: [],
      mobileResponsive: research.website_is_mobile_responsive || false,
      pageLoadSpeed: 'unknown' as const, // Would need separate check
      hasSSL: research.website_has_ssl || false,
      analyticsSetup: [], // User input needed
    },

    // Tone & Voice (Section 5) - needs user input
    toneVoice: {
      brandPersonality: [],
      communicationStyle: 'professional' as const, // Default
      targetEmotions: [],
      commonObjections: [],
      trustSignals: [],
      socialProofAvailable: inferSocialProof(research),
      competitorDifferentiators: [],
      messagingDontUse: [],
    },

    // Conversion & Measurement (Section 6) - mostly needs user input
    conversionMeasurement: {
      primaryConversionGoal: '', // User input needed
      secondaryConversionGoals: [],
      currentConversionRate: '',
      leadSources: [],
      crmSystem: '',
      callTrackingSetup: false,
      formTrackingSetup: false,
      currentMonthlyTraffic: '',
      currentMonthlyLeads: '',
      leadQualificationProcess: '',
    },

    // AI Considerations (Section 7)
    aiConsiderations: {
      awareOfAISearch: false, // User input needed
      currentAIVisibility: inferAIVisibility(research),
      hasStructuredData: research.website_has_structured_data || false,
      hasFAQContent: (pageTypes.faq || 0) > 0,
      voiceSearchOptimized: false, // Would need analysis
      contentFormatPreferences: [],
      aiToolsCurrentlyUsing: [],
      openToAIContent: false, // User input needed
    },
  };
}

/**
 * Infer blog posting frequency from blog page count
 */
function inferBlogFrequency(blogPages: number): string {
  if (blogPages === 0) return 'never';
  if (blogPages < 5) return 'rarely';
  if (blogPages < 20) return 'monthly';
  if (blogPages < 50) return 'weekly';
  return 'multiple_weekly';
}

/**
 * Infer content assets from page types
 */
function inferContentAssets(pageTypes: Record<string, number>): string[] {
  const assets: string[] = [];

  if ((pageTypes.services || 0) > 0) assets.push('service_pages');
  if ((pageTypes.blog || 0) > 0) assets.push('blog_posts');
  if ((pageTypes.locations || 0) > 0) assets.push('location_pages');
  if ((pageTypes.faq || 0) > 0) assets.push('faq_content');
  if ((pageTypes.about || 0) > 0) assets.push('about_page');

  return assets;
}

/**
 * Infer social proof availability
 */
function inferSocialProof(research: ResearchResults): string[] {
  const socialProof: string[] = [];

  if (research.gbp_review_count && research.gbp_review_count > 0) {
    socialProof.push('google_reviews');
  }

  if (research.gbp_rating && research.gbp_rating >= 4.0) {
    socialProof.push('high_rating');
  }

  if (research.gbp_photos_count && research.gbp_photos_count > 5) {
    socialProof.push('photos');
  }

  return socialProof;
}

/**
 * Infer AI visibility status
 */
function inferAIVisibility(research: ResearchResults): 'none' | 'some' | 'good' | 'unknown' {
  let score = 0;

  if (research.website_has_structured_data) score += 2;
  if (research.sitemap_total_pages && research.sitemap_total_pages > 20) score += 1;
  if (research.sitemap_has_blog) score += 1;

  const schemaTypes = research.website_schema_types || [];
  if (schemaTypes.includes('FAQPage')) score += 2;
  if (schemaTypes.includes('LocalBusiness')) score += 1;
  if (schemaTypes.includes('Organization')) score += 1;

  if (score === 0) return 'none';
  if (score < 3) return 'some';
  if (score >= 3) return 'good';
  return 'unknown';
}

/**
 * Generate a summary of what was auto-populated vs what needs user input
 */
export function getAutoPopulationSummary(intake: Partial<IntakeData>): {
  populated: string[];
  needsInput: string[];
  percentComplete: number;
} {
  const populated: string[] = [];
  const needsInput: string[] = [];

  // Business Context
  if (intake.businessContext?.businessName) populated.push('Business Name');
  if (intake.businessContext?.websiteUrl) populated.push('Website URL');
  if (intake.businessContext?.primaryServiceArea) populated.push('Service Area');
  if (intake.businessContext?.businessDescription) populated.push('Business Description');
  needsInput.push('Years in Business', 'Unique Value Proposition', 'Target Demographic', 'Average Job Value', 'Monthly Lead Goal');

  // Local SEO
  if (intake.localSEO?.currentGoogleRating) populated.push('Google Rating');
  if (intake.localSEO?.totalReviews) populated.push('Review Count');
  if (intake.localSEO?.gbpCategories?.length) populated.push('GBP Categories');
  if (intake.localSEO?.mainCompetitors?.length) populated.push('Main Competitors');
  needsInput.push('Target Keywords', 'Current Rankings', 'Citation Sources');

  // Website Readiness
  if (intake.websiteReadiness?.currentCMS && intake.websiteReadiness.currentCMS !== 'unknown') populated.push('CMS Detection');
  if (intake.websiteReadiness?.hasSSL !== undefined) populated.push('SSL Status');
  if (intake.websiteReadiness?.hasServicePages !== undefined) populated.push('Service Pages Detection');
  if (intake.websiteReadiness?.hasBlog !== undefined) populated.push('Blog Detection');
  needsInput.push('Analytics Setup', 'Technical Issues');

  // AI Considerations
  if (intake.aiConsiderations?.hasStructuredData !== undefined) populated.push('Structured Data Detection');
  needsInput.push('AI Awareness', 'Content Preferences');

  const total = populated.length + needsInput.length;
  const percentComplete = total > 0 ? Math.round((populated.length / total) * 100) : 0;

  return { populated, needsInput, percentComplete };
}
