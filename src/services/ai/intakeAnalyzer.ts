/**
 * Intake Analyzer Service
 *
 * Main orchestrator for AI analysis of research data.
 * Maps scraped data to intake fields and calculates confidence scores.
 */

import { getClaudeClient, isClaudeReady } from './claudeClient';
import { buildSystemPrompt, buildDataContext, estimatePromptTokens } from './promptBuilder';
import { DEFAULT_MODEL, ANALYSIS_CONFIG, estimateCost } from '@/lib/ai/config';
import type {
  AIAnalysisInput,
  AIAnalysisResult,
  BusinessContextFields,
  RevenueServicesFields,
  LocalSEOFields,
  WebsiteReadinessFields,
  ToneVoiceFields,
  ConversionMeasurementFields,
  AIConsiderationsFields,
  StrategicInsights,
  InferredField,
} from '@/types/ai-analysis';

/**
 * Result wrapper for the analysis
 */
export interface AnalyzeResult {
  success: boolean;
  data?: AIAnalysisResult;
  error?: string;
  estimatedCost?: number;
}

/**
 * Create a default inferred field with low confidence
 */
function createDefaultField<T>(value: T, reason: string): InferredField<T> {
  return {
    value,
    source: 'ai',
    confidence: 0.1,
    reasoning: reason,
  };
}

/**
 * Create default business context fields
 */
function createDefaultBusinessContext(input: AIAnalysisInput): BusinessContextFields {
  return {
    companyName: createDefaultField(input.businessName, 'From user input'),
    yearsInBusiness: createDefaultField(null, 'Unable to determine'),
    teamSize: createDefaultField(null, 'Unable to determine'),
    primaryIndustry: createDefaultField(input.industry || 'Service Provider', 'From user input or default'),
    businessDescription: createDefaultField(`${input.businessName} - Local business`, 'Generated default'),
    uniqueSellingPoints: createDefaultField([], 'Unable to determine'),
    targetAudience: createDefaultField('Local customers', 'Default assumption'),
    competitiveAdvantages: createDefaultField([], 'Unable to determine'),
    businessModel: createDefaultField('B2C', 'Default assumption for local business'),
    seasonality: createDefaultField(null, 'Unable to determine'),
  };
}

/**
 * Create default revenue services fields
 */
function createDefaultRevenueServices(input: AIAnalysisInput): RevenueServicesFields {
  return {
    primaryServices: createDefaultField([], 'Unable to determine'),
    secondaryServices: createDefaultField([], 'Unable to determine'),
    serviceDeliveryMethod: createDefaultField(['On-site'], 'Default assumption'),
    averageTransactionValue: createDefaultField(null, 'Unable to determine'),
    pricingModel: createDefaultField('Project-based', 'Default assumption'),
    topRevenueServices: createDefaultField([], 'Unable to determine'),
    serviceAreaType: createDefaultField('Local', 'Default assumption'),
    serviceRadius: createDefaultField(null, 'Unable to determine'),
    clientRetentionRate: createDefaultField(null, 'Unable to determine'),
    referralPercentage: createDefaultField(null, 'Unable to determine'),
    upsellOpportunities: createDefaultField([], 'Unable to determine'),
    recurringRevenueServices: createDefaultField([], 'Unable to determine'),
  };
}

/**
 * Create default local SEO fields
 */
function createDefaultLocalSEO(input: AIAnalysisInput): LocalSEOFields {
  const gbpData = input.gbp as Record<string, unknown> | undefined;
  return {
    gbpStatus: createDefaultField(gbpData ? 'claimed' : 'unknown', gbpData ? 'GBP data found' : 'No GBP data'),
    gbpCompleteness: createDefaultField(0, 'Unable to determine'),
    gbpRating: createDefaultField(null, 'Unable to determine'),
    gbpReviewCount: createDefaultField(null, 'Unable to determine'),
    gbpCategories: createDefaultField([], 'Unable to determine'),
    gbpPhotosCount: createDefaultField(null, 'Unable to determine'),
    primaryServiceArea: createDefaultField(
      [input.city, input.state].filter(Boolean).join(', ') || 'Local area',
      'From user input'
    ),
    serviceAreas: createDefaultField([], 'Unable to determine'),
    napConsistency: createDefaultField(0, 'Unable to determine'),
    citationScore: createDefaultField(null, 'Unable to determine'),
  };
}

/**
 * Create default website readiness fields
 */
function createDefaultWebsiteReadiness(input: AIAnalysisInput): WebsiteReadinessFields {
  return {
    websiteUrl: createDefaultField(input.website, 'From user input'),
    cms: createDefaultField(null, 'Unable to determine'),
    hasSsl: createDefaultField(input.website.startsWith('https'), 'From URL protocol'),
    isMobileResponsive: createDefaultField(true, 'Default assumption'),
    hasStructuredData: createDefaultField(false, 'Unable to determine'),
    schemaTypes: createDefaultField([], 'Unable to determine'),
    pageCount: createDefaultField(null, 'Unable to determine'),
    hasServicePages: createDefaultField(false, 'Unable to determine'),
    servicePageCount: createDefaultField(null, 'Unable to determine'),
    hasBlogSection: createDefaultField(false, 'Unable to determine'),
    hasLocationPages: createDefaultField(false, 'Unable to determine'),
    locationPageCount: createDefaultField(null, 'Unable to determine'),
    hasHubPages: createDefaultField(false, 'Unable to determine'),
    hubPageCount: createDefaultField(null, 'Unable to determine'),
    averagePageWordCount: createDefaultField('Thin (<1000)', 'Default assumption'),
    hasRobotsTxt: createDefaultField(false, 'Unable to determine'),
    hasLlmsTxt: createDefaultField(false, 'Unable to determine'),
    loadSpeed: createDefaultField(null, 'Unable to determine'),
    seoScore: createDefaultField(null, 'Unable to determine'),
    contentDepthScore: createDefaultField(null, 'Unable to determine'),
  };
}

/**
 * Create default tone voice fields
 */
function createDefaultToneVoice(): ToneVoiceFields {
  return {
    brandTone: createDefaultField('Professional', 'Default assumption'),
    writingStyle: createDefaultField('Conversational', 'Default assumption'),
    keyMessaging: createDefaultField([], 'Unable to determine'),
    brandPersonality: createDefaultField([], 'Unable to determine'),
    targetEmotions: createDefaultField([], 'Unable to determine'),
    communicationStyle: createDefaultField('Direct', 'Default assumption'),
    industryJargonLevel: createDefaultField('Moderate', 'Default assumption'),
    callToActionStyle: createDefaultField('Value-focused', 'Default assumption'),
  };
}

/**
 * Create default conversion measurement fields
 */
function createDefaultConversionMeasurement(): ConversionMeasurementFields {
  return {
    primaryConversionGoal: createDefaultField('Phone calls', 'Default for local business'),
    secondaryConversionGoals: createDefaultField(['Form submissions'], 'Default assumption'),
    currentTrackingSetup: createDefaultField(['None detected'], 'Unable to determine'),
    phoneTrackingStatus: createDefaultField(null, 'Unable to determine'),
    formTrackingStatus: createDefaultField(null, 'Unable to determine'),
    currentLeadVolume: createDefaultField(null, 'Unable to determine'),
    conversionRate: createDefaultField(null, 'Unable to determine'),
    customerJourneyLength: createDefaultField('1-7 days', 'Default assumption'),
  };
}

/**
 * Create default AI considerations fields
 */
function createDefaultAIConsiderations(): AIConsiderationsFields {
  return {
    aiSearchVisibility: createDefaultField('Unknown', 'Unable to determine'),
    contentDepth: createDefaultField('Basic', 'Default assumption'),
    expertiseSignals: createDefaultField([], 'Unable to determine'),
    trustSignals: createDefaultField([], 'Unable to determine'),
    authorshipClarity: createDefaultField(false, 'Unable to determine'),
    contentFreshness: createDefaultField('Unknown', 'Unable to determine'),
    citationWorthiness: createDefaultField('Low', 'Default assumption'),
    llmReadinessScore: createDefaultField(30, 'Default low score'),
    entityFirstScore: createDefaultField(20, 'Default low score - needs entity-first formatting'),
    hasSameAsReferences: createDefaultField(false, 'Unable to determine'),
    sameAsPlatforms: createDefaultField([], 'Unable to determine'),
    hasAuthorBio: createDefaultField(false, 'Unable to determine'),
    hasCredentials: createDefaultField(false, 'Unable to determine'),
    aeoComplianceScore: createDefaultField(20, 'Default low score - needs AEO optimization'),
    hubSpokeScore: createDefaultField(20, 'Default low score - needs Hub+Spoke content architecture'),
  };
}

/**
 * Create default strategic insights
 */
function createDefaultInsights(): StrategicInsights {
  return {
    contentGaps: [
      {
        gap: 'Service descriptions need detailed content (1,500-2,200 words)',
        priority: 'high',
        action: 'Create comprehensive service pages following spoke page standards',
        category: 'Spoke Page',
        targetKeyword: '',
        estimatedImpact: 'Improved rankings for service keywords',
        wordCountTarget: 1800,
      },
    ],
    competitiveInsights: [],
    competitorComparison: {
      clientProfile: {
        name: '',
        website: '',
        gbpRating: null,
        gbpReviewCount: null,
        gbpPhotosCount: null,
        gbpCategories: [],
        gbpResponseRate: null,
        estimatedPageCount: null,
        hasServicePages: false,
        servicePageCount: null,
        hasBlogSection: false,
        blogPostCount: null,
        hasLocationPages: false,
        contentDepthAssessment: 'minimal',
        hasSsl: false,
        hasSchema: false,
        schemaTypes: [],
        primaryServices: [],
        uniqueValueProps: [],
        pricingIndicators: null,
        targetAudience: '',
        strengths: [],
        weaknesses: [],
      },
      competitors: [],
      gbpComparison: {
        clientRank: 0,
        averageCompetitorRating: 0,
        reviewCountComparison: 'below',
        photoCountComparison: 'below',
        recommendations: ['Complete competitor research to generate GBP comparison'],
      },
      contentComparison: {
        clientContentScore: 0,
        averageCompetitorScore: 0,
        contentGapsVsCompetitors: [],
        contentAdvantages: [],
        wordCountComparison: 'below',
      },
      serviceComparison: {
        sharedServices: [],
        uniqueToClient: [],
        missingFromClient: [],
        pricingPosition: 'unknown',
      },
      technicalComparison: {
        schemaAdoption: [],
        clientSchemaGaps: [],
      },
      overallPosition: 'laggard',
      competitiveAdvantages: [],
      competitiveDisadvantages: ['Insufficient data for competitive analysis'],
      marketOpportunities: [],
    },
    icpAnalysis: {
      primaryICP: {
        demographics: {
          ageRange: 'Unknown',
          gender: 'All',
          incomeLevel: 'Unknown',
          homeownership: 'Unknown',
          familyStatus: 'Unknown',
          location: 'Local area',
        },
        psychographics: {
          values: [],
          lifestyle: 'Unknown',
          buyingMotivation: 'Unknown',
          decisionStyle: 'Research-heavy',
        },
        painPoints: [],
        needs: [],
        objections: [],
        buyingBehavior: {
          researchSources: ['Google Search', 'Online Reviews'],
          decisionTimeframe: '1-7 days',
          decisionInfluencers: [],
          priceWeight: 'secondary',
          qualityExpectations: 'Unknown',
        },
        marketingChannels: {
          primary: ['Google Search', 'Google Business Profile'],
          secondary: [],
          messagingThemes: [],
        },
        confidence: 0.1,
        reasoning: 'Insufficient data to identify ICP - complete research tasks first',
      },
      secondaryICPs: [],
      avatars: [],
      marketInsights: {
        estimatedMarketSize: 'Unknown',
        competitionLevel: 'medium',
        growthTrend: 'stable',
        seasonalPatterns: [],
      },
      targetingRecommendations: ['Complete research to generate targeting recommendations'],
      messagingRecommendations: ['Complete research to generate messaging recommendations'],
      channelRecommendations: ['Complete research to generate channel recommendations'],
    },
    serpGapAnalysis: {
      overallOpportunityScore: 0,
      marketSaturation: 'medium',
      quickWinCount: 0,
      serpOpportunities: [],
      topicCoverageGaps: [],
      contentFreshnessGaps: [],
      technicalGaps: [],
      competitorWeaknessSummary: [],
      quickWinActions: [],
      longTermOpportunities: [],
    },
    suggestedKeywords: [],
    quickWins: [
      {
        action: 'Claim and optimize Google Business Profile',
        impact: 'high',
        effort: 'easy',
        category: 'Local SEO',
        timeframe: 'Immediate',
        implementation: 'Go to business.google.com, claim listing, complete all fields',
      },
    ],
    seoTechnical: {
      metaTitleTemplate: '[Service] in [City], [State] | [Business Name]',
      metaDescriptionTemplate: '[Business Name] provides [service] in [City]. [Value prop]. Call [phone] for a free quote.',
      robotsTxtStatus: 'missing',
      robotsTxtRecommendations: ['Add robots.txt with sitemap reference'],
      llmsTxtStatus: 'missing',
      llmsTxtRecommendations: 'Create llms.txt with business description, services, expertise, and contact info',
      missingSchemaTypes: ['LocalBusiness', 'Service', 'FAQPage'],
      canonicalIssues: [],
    },
    aeoStrategy: {
      currentReadiness: 'low',
      entityFirstScore: 20,
      entityAssessment: {
        brandNameInFirstParagraph: false,
        authorAttribution: false,
        sameAsReferences: [],
        missingSameAs: ['LinkedIn', 'YouTube', 'Facebook'],
        redundantEntityMentions: false,
        expertiseSignalsFound: [],
        authoritySignalsMissing: ['Credentials', 'Years in business', 'Certifications'],
      },
      schemaReadiness: {
        faqSchemaPresent: false,
        howToSchemaPresent: false,
        localBusinessSchemaComplete: false,
        articleSchemaPresent: false,
        missingSchemaOpportunities: ['LocalBusiness', 'Service', 'FAQPage', 'HowTo'],
      },
      faqOpportunities: [],
      speakableContent: [],
      citableStatements: [],
      contentStructureRecommendations: ['Add FAQ sections to service pages', 'Include author bios with credentials'],
      aeoComplianceChecklist: {
        brandInFirstParagraph: false,
        twoSameAsReferences: false,
        schemaCompatibleFormatting: false,
        authorAttribution: false,
        redundantEntityMentions: false,
        internalTopicClusterLinks: false,
        backedClaimsWithCitations: false,
        h1WithPrimaryTopic: false,
        dateModifiedVisible: false,
        overallScore: 20,
        recommendations: ['Complete analysis to generate specific recommendations'],
      },
    },
    hubSpokeAnalysis: {
      overallScore: 20,
      hasHubPages: false,
      hubPages: [],
      spokePages: [],
      missingHubTopics: [],
      internalLinkingScore: 20,
      internalLinkingIssues: ['No hub-spoke content architecture detected'],
      contentJourneyCoverage: {
        awareness: 'missing',
        consideration: 'missing',
        decision: 'missing',
        gaps: ['All customer journey stages need content'],
      },
    },
    servicePageStrategy: [],
    locationPageStrategy: [],
    priorityRecommendations: [
      {
        priority: 1,
        action: 'Complete analysis data collection',
        category: 'Technical SEO',
        rationale: 'Need more data for comprehensive recommendations',
        expectedImpact: 'Enable full analysis and specific recommendations',
      },
    ],
    riskFactors: [
      {
        risk: 'Insufficient data for comprehensive analysis',
        severity: 'medium',
        mitigation: 'Complete all research tasks before running analysis',
      },
    ],
  };
}

/**
 * Create fallback result when AI analysis fails or is unavailable
 */
function createFallbackResult(input: AIAnalysisInput, error: string): AIAnalysisResult {
  return {
    analyzedAt: new Date().toISOString(),
    model: 'fallback',
    sessionId: input.sessionId,
    categories: {
      businessContext: createDefaultBusinessContext(input),
      revenueServices: createDefaultRevenueServices(input),
      localSEO: createDefaultLocalSEO(input),
      websiteReadiness: createDefaultWebsiteReadiness(input),
      toneVoice: createDefaultToneVoice(),
      conversionMeasurement: createDefaultConversionMeasurement(),
      aiConsiderations: createDefaultAIConsiderations(),
    },
    insights: createDefaultInsights(),
    overallConfidence: 0.1,
    fieldsAnalyzed: 68,
    fieldsWithHighConfidence: 0,
    fieldsWithLowConfidence: 68,
    dataQualityScore: 10,
    tokenUsage: { input: 0, output: 0, total: 0 },
    processingTimeMs: 0,
    warnings: ['AI analysis unavailable: ' + error],
    errors: [error],
  };
}

/**
 * Parse and validate the AI response
 */
function parseAIResponse(
  responseText: string,
  input: AIAnalysisInput
): AIAnalysisResult | null {
  try {
    // Try to extract JSON from the response
    let jsonText = responseText.trim();

    // Handle potential markdown code blocks
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);

    // Validate required structure
    if (!parsed.categories) {
      console.error('AI response missing categories');
      return null;
    }

    // Merge with defaults to ensure all fields exist
    const result: AIAnalysisResult = {
      analyzedAt: new Date().toISOString(),
      model: DEFAULT_MODEL,
      sessionId: input.sessionId,
      categories: {
        businessContext: {
          ...createDefaultBusinessContext(input),
          ...parsed.categories.businessContext,
        },
        revenueServices: {
          ...createDefaultRevenueServices(input),
          ...parsed.categories.revenueServices,
        },
        localSEO: {
          ...createDefaultLocalSEO(input),
          ...parsed.categories.localSEO,
        },
        websiteReadiness: {
          ...createDefaultWebsiteReadiness(input),
          ...parsed.categories.websiteReadiness,
        },
        toneVoice: {
          ...createDefaultToneVoice(),
          ...parsed.categories.toneVoice,
        },
        conversionMeasurement: {
          ...createDefaultConversionMeasurement(),
          ...parsed.categories.conversionMeasurement,
        },
        aiConsiderations: {
          ...createDefaultAIConsiderations(),
          ...parsed.categories.aiConsiderations,
        },
      },
      insights: {
        ...createDefaultInsights(),
        ...parsed.insights,
      },
      overallConfidence: 0,
      fieldsAnalyzed: 68,
      fieldsWithHighConfidence: 0,
      fieldsWithLowConfidence: 0,
      dataQualityScore: parsed.dataQualityScore || 50,
      tokenUsage: { input: 0, output: 0, total: 0 },
      processingTimeMs: 0,
      warnings: parsed.warnings || [],
      errors: [],
    };

    // Calculate confidence metrics
    const confidenceScores: number[] = [];
    for (const category of Object.values(result.categories)) {
      for (const field of Object.values(category)) {
        if (field && typeof field === 'object' && 'confidence' in field) {
          const conf = (field as InferredField<unknown>).confidence;
          confidenceScores.push(conf);
          if (conf >= ANALYSIS_CONFIG.highConfidenceThreshold) {
            result.fieldsWithHighConfidence++;
          } else if (conf <= ANALYSIS_CONFIG.lowConfidenceThreshold) {
            result.fieldsWithLowConfidence++;
          }
        }
      }
    }

    result.overallConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : 0.1;

    return result;
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('Response text:', responseText.slice(0, 500));
    return null;
  }
}

/**
 * Analyze research data using Claude AI
 */
export async function analyzeIntakeData(input: AIAnalysisInput): Promise<AnalyzeResult> {
  const startTime = Date.now();

  // Check if Claude is configured
  if (!isClaudeReady()) {
    console.log('Claude API not configured, using fallback analysis');
    return {
      success: true,
      data: createFallbackResult(input, 'ANTHROPIC_API_KEY not configured'),
      estimatedCost: 0,
    };
  }

  // Build prompts
  const systemPrompt = buildSystemPrompt();
  const dataContext = buildDataContext(input);

  // Estimate tokens and cost
  const estimatedInputTokens = estimatePromptTokens(systemPrompt, dataContext);
  const estimatedOutputTokens = 4000; // Typical response size
  const estimatedCost = estimateCost(estimatedInputTokens, estimatedOutputTokens);

  console.log(`Starting AI analysis for session ${input.sessionId}`);
  console.log(`Estimated tokens: ${estimatedInputTokens} input, ${estimatedOutputTokens} output`);
  console.log(`Estimated cost: $${estimatedCost.toFixed(4)}`);

  // Call Claude API
  const client = getClaudeClient();
  const result = await client.analyzeResearchData(systemPrompt, dataContext, {
    temperature: ANALYSIS_CONFIG.temperature,
  });

  const processingTimeMs = Date.now() - startTime;

  if (!result.success || !result.data) {
    console.error('Claude API call failed:', result.error);
    return {
      success: true, // Return fallback instead of failing
      data: createFallbackResult(
        input,
        result.error?.message || 'Claude API call failed'
      ),
      estimatedCost: 0,
    };
  }

  // Parse the response
  console.log('Claude raw response length:', result.data.content.length);
  console.log('Claude response preview:', result.data.content.slice(0, 500));
  console.log('Claude response end:', result.data.content.slice(-500));

  const analysisResult = parseAIResponse(result.data.content, input);

  if (!analysisResult) {
    console.error('Failed to parse Claude response');
    console.error('Full response:', result.data.content);
    return {
      success: true,
      data: createFallbackResult(input, 'Failed to parse AI response'),
      estimatedCost,
    };
  }

  // Update with actual token usage and timing
  analysisResult.tokenUsage = {
    input: result.data.usage.input_tokens,
    output: result.data.usage.output_tokens,
    total: result.data.usage.input_tokens + result.data.usage.output_tokens,
  };
  analysisResult.processingTimeMs = processingTimeMs;
  analysisResult.model = result.data.model;

  const actualCost = estimateCost(
    result.data.usage.input_tokens,
    result.data.usage.output_tokens
  );

  console.log(`AI analysis completed in ${processingTimeMs}ms`);
  console.log(`Actual tokens: ${analysisResult.tokenUsage.input} input, ${analysisResult.tokenUsage.output} output`);
  console.log(`Actual cost: $${actualCost.toFixed(4)}`);
  console.log(`Overall confidence: ${(analysisResult.overallConfidence * 100).toFixed(1)}%`);

  return {
    success: true,
    data: analysisResult,
    estimatedCost: actualCost,
  };
}

/**
 * Check if analysis is available for a session
 */
export function canAnalyze(results: Record<string, unknown>): {
  canAnalyze: boolean;
  reason?: string;
} {
  // Check if there's any research data to analyze
  const hasGbp = !!results.gbp;
  const hasWebsite = !!results.websiteCrawl;
  const hasSitemap = !!results.sitemap;

  if (!hasGbp && !hasWebsite && !hasSitemap) {
    return {
      canAnalyze: false,
      reason: 'No research data available. Complete at least one research task first.',
    };
  }

  return { canAnalyze: true };
}
