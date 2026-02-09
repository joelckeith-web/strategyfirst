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
 * Create a default field for truly unknowable data (retention rate, lead volume, etc.)
 */
function createUnknownField<T>(value: T, reason: string): InferredField<T> {
  return {
    value,
    source: 'ai',
    confidence: 0.1,
    reasoning: reason,
  };
}

/**
 * Create a default field for data that can be reasonably inferred from industry/context
 */
function createInferrableField<T>(value: T, reason: string): InferredField<T> {
  return {
    value,
    source: 'ai',
    confidence: 0.4,
    reasoning: reason,
  };
}

/**
 * Create default business context fields
 */
function createDefaultBusinessContext(input: AIAnalysisInput): BusinessContextFields {
  return {
    companyName: createUnknownField(input.businessName, 'From user input'),
    yearsInBusiness: createUnknownField(null, 'Unable to determine'),
    teamSize: createUnknownField(null, 'Unable to determine'),
    primaryIndustry: createInferrableField(input.industry || 'Service Provider', 'From user input or default'),
    businessDescription: createInferrableField(`${input.businessName} - Local business`, 'Generated default'),
    uniqueSellingPoints: createUnknownField([], 'Unable to determine'),
    targetAudience: createInferrableField('Local customers', 'Default assumption for local business'),
    competitiveAdvantages: createUnknownField([], 'Unable to determine'),
    businessModel: createInferrableField('B2C', 'Default assumption for local business'),
    seasonality: createInferrableField(null, 'Can be inferred from industry and location'),
  };
}

/**
 * Create default revenue services fields
 */
function createDefaultRevenueServices(input: AIAnalysisInput): RevenueServicesFields {
  return {
    primaryServices: createUnknownField([], 'Unable to determine'),
    secondaryServices: createUnknownField([], 'Unable to determine'),
    serviceDeliveryMethod: createInferrableField(['On-site'], 'Default assumption for local business'),
    averageTransactionValue: createUnknownField(null, 'Unable to determine - requires business input'),
    pricingModel: createInferrableField('Project-based', 'Default assumption'),
    topRevenueServices: createUnknownField([], 'Unable to determine'),
    serviceAreaType: createInferrableField('Local', 'Default assumption for local business'),
    serviceRadius: createUnknownField(null, 'Unable to determine'),
    clientRetentionRate: createUnknownField(null, 'Unable to determine - requires business input'),
    referralPercentage: createUnknownField(null, 'Unable to determine - requires business input'),
    upsellOpportunities: createUnknownField([], 'Unable to determine'),
    recurringRevenueServices: createUnknownField([], 'Unable to determine'),
  };
}

/**
 * Create default local SEO fields
 */
function createDefaultLocalSEO(input: AIAnalysisInput): LocalSEOFields {
  const gbpData = input.gbp as Record<string, unknown> | undefined;
  return {
    gbpStatus: createInferrableField(gbpData ? 'claimed' : 'unknown', gbpData ? 'GBP data found' : 'No GBP data'),
    gbpCompleteness: createUnknownField(0, 'Unable to determine'),
    gbpRating: createUnknownField(null, 'Unable to determine'),
    gbpReviewCount: createUnknownField(null, 'Unable to determine'),
    gbpCategories: createUnknownField([], 'Unable to determine'),
    gbpPhotosCount: createUnknownField(null, 'Unable to determine'),
    primaryServiceArea: createInferrableField(
      [input.city, input.state].filter(Boolean).join(', ') || 'Local area',
      'From user input'
    ),
    serviceAreas: createUnknownField([], 'Unable to determine'),
    napConsistency: createUnknownField(0, 'Unable to determine'),
    citationScore: createUnknownField(null, 'Unable to determine'),
  };
}

/**
 * Create default website readiness fields
 */
function createDefaultWebsiteReadiness(input: AIAnalysisInput): WebsiteReadinessFields {
  return {
    websiteUrl: createUnknownField(input.website, 'From user input'),
    cms: createUnknownField(null, 'Unable to determine'),
    hasSsl: createInferrableField(input.website.startsWith('https'), 'From URL protocol'),
    isMobileResponsive: createInferrableField(true, 'Default assumption - most modern sites are responsive'),
    hasStructuredData: createUnknownField(false, 'Unable to determine'),
    schemaTypes: createUnknownField([], 'Unable to determine'),
    pageCount: createUnknownField(null, 'Unable to determine'),
    hasServicePages: createUnknownField(false, 'Unable to determine'),
    servicePageCount: createUnknownField(null, 'Unable to determine'),
    hasBlogSection: createUnknownField(false, 'Unable to determine'),
    blogPostCount: createUnknownField(null, 'Unable to determine'),
    hasLocationPages: createUnknownField(false, 'Unable to determine'),
    locationPageCount: createUnknownField(null, 'Unable to determine'),
    hasHubPages: createUnknownField(false, 'Unable to determine'),
    hubPageCount: createUnknownField(null, 'Unable to determine'),
    averagePageWordCount: createInferrableField('Thin (<1000)', 'Default assumption'),
    hasRobotsTxt: createUnknownField(false, 'Unable to determine'),
    hasLlmsTxt: createUnknownField(false, 'Unable to determine'),
    loadSpeed: createUnknownField(null, 'Unable to determine'),
    seoScore: createUnknownField(null, 'Unable to determine'),
    contentDepthScore: createUnknownField(null, 'Unable to determine'),
  };
}

/**
 * Create default tone voice fields
 */
function createDefaultToneVoice(): ToneVoiceFields {
  return {
    brandTone: createInferrableField('Professional', 'Default assumption - can be inferred from content'),
    writingStyle: createInferrableField('Conversational', 'Default assumption - can be inferred from content'),
    keyMessaging: createUnknownField([], 'Unable to determine'),
    brandPersonality: createUnknownField([], 'Unable to determine'),
    targetEmotions: createUnknownField([], 'Unable to determine'),
    communicationStyle: createInferrableField('Direct', 'Default assumption'),
    industryJargonLevel: createInferrableField('Moderate', 'Default assumption'),
    callToActionStyle: createInferrableField('Value-focused', 'Default assumption'),
  };
}

/**
 * Create default conversion measurement fields
 */
function createDefaultConversionMeasurement(): ConversionMeasurementFields {
  return {
    primaryConversionGoal: createInferrableField('Phone calls', 'Default for local business'),
    secondaryConversionGoals: createInferrableField(['Form submissions'], 'Default assumption'),
    currentTrackingSetup: createUnknownField(['None detected'], 'Unable to determine'),
    phoneTrackingStatus: createUnknownField(null, 'Unable to determine'),
    formTrackingStatus: createUnknownField(null, 'Unable to determine'),
    currentLeadVolume: createUnknownField(null, 'Unable to determine - requires business input'),
    conversionRate: createUnknownField(null, 'Unable to determine - requires business input'),
    customerJourneyLength: createInferrableField('1-7 days', 'Default assumption - can be inferred from industry'),
  };
}

/**
 * Create default AI considerations fields
 */
function createDefaultAIConsiderations(): AIConsiderationsFields {
  return {
    aiSearchVisibility: createUnknownField('Unknown', 'Unable to determine'),
    contentDepth: createInferrableField('Basic', 'Default assumption'),
    expertiseSignals: createUnknownField([], 'Unable to determine'),
    trustSignals: createUnknownField([], 'Unable to determine'),
    authorshipClarity: createUnknownField(false, 'Unable to determine'),
    contentFreshness: createUnknownField('Unknown', 'Unable to determine'),
    citationWorthiness: createInferrableField('Low', 'Default assumption'),
    llmReadinessScore: createInferrableField(30, 'Default low score'),
    entityFirstScore: createInferrableField(20, 'Default low score - needs entity-first formatting'),
    hasSameAsReferences: createUnknownField(false, 'Unable to determine'),
    sameAsPlatforms: createUnknownField([], 'Unable to determine'),
    hasAuthorBio: createUnknownField(false, 'Unable to determine'),
    hasCredentials: createUnknownField(false, 'Unable to determine'),
    aeoComplianceScore: createInferrableField(20, 'Default low score - needs AEO optimization'),
    hubSpokeScore: createInferrableField(20, 'Default low score - needs Hub+Spoke content architecture'),
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
    overallConfidence: 0.2,
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
 * Strip markdown code fences from response text
 */
function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Build an AIAnalysisResult from parsed categories and optional insights
 */
function buildResultFromParsed(
  categories: Record<string, Record<string, unknown>>,
  insights: Record<string, unknown> | null,
  input: AIAnalysisInput,
  dataQualityScore: number,
  warnings: string[]
): AIAnalysisResult {
  const result: AIAnalysisResult = {
    analyzedAt: new Date().toISOString(),
    model: DEFAULT_MODEL,
    sessionId: input.sessionId,
    categories: {
      businessContext: {
        ...createDefaultBusinessContext(input),
        ...categories.businessContext,
      },
      revenueServices: {
        ...createDefaultRevenueServices(input),
        ...categories.revenueServices,
      },
      localSEO: {
        ...createDefaultLocalSEO(input),
        ...categories.localSEO,
      },
      websiteReadiness: {
        ...createDefaultWebsiteReadiness(input),
        ...categories.websiteReadiness,
      },
      toneVoice: {
        ...createDefaultToneVoice(),
        ...categories.toneVoice,
      },
      conversionMeasurement: {
        ...createDefaultConversionMeasurement(),
        ...categories.conversionMeasurement,
      },
      aiConsiderations: {
        ...createDefaultAIConsiderations(),
        ...categories.aiConsiderations,
      },
    },
    insights: {
      ...createDefaultInsights(),
      ...(insights || {}),
    },
    overallConfidence: 0,
    fieldsAnalyzed: 68,
    fieldsWithHighConfidence: 0,
    fieldsWithLowConfidence: 0,
    dataQualityScore,
    tokenUsage: { input: 0, output: 0, total: 0 },
    processingTimeMs: 0,
    warnings,
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
}

/**
 * Parse and validate the AI response.
 * Uses a multi-stage approach:
 *   1. Try full JSON parse
 *   2. Try repair + full parse (for truncated responses)
 *   3. Try partial extraction of categories + insights (for badly truncated responses)
 */
function parseAIResponse(
  responseText: string,
  input: AIAnalysisInput
): AIAnalysisResult | null {
  const jsonText = stripMarkdownFences(responseText);

  // Stage 1: Try full JSON parse
  try {
    const parsed = JSON.parse(jsonText);
    if (parsed.categories) {
      console.log('✅ Full JSON parse successful');
      return buildResultFromParsed(
        parsed.categories,
        parsed.insights || null,
        input,
        parsed.dataQualityScore || 50,
        parsed.warnings || []
      );
    }
  } catch {
    console.warn('Full JSON parse failed, trying repair...');
  }

  // Stage 2: Try repair + full parse
  try {
    const repaired = repairTruncatedJson(jsonText);
    const parsed = JSON.parse(repaired);
    if (parsed.categories) {
      console.log('✅ Repaired JSON parse successful');
      return buildResultFromParsed(
        parsed.categories,
        parsed.insights || null,
        input,
        parsed.dataQualityScore || 50,
        [...(parsed.warnings || []), 'Response was truncated and repaired — some insights may be incomplete']
      );
    }
  } catch {
    console.warn('Repaired JSON parse failed, trying partial extraction...');
  }

  // Stage 3: Extract categories and insights separately from raw text
  const categories = extractCategoriesFromPartialJson(jsonText);
  if (categories) {
    const insights = extractInsightsFromPartialJson(jsonText);
    console.log(`✅ Partial extraction successful: categories=${!!categories}, insights=${!!insights}`);
    return buildResultFromParsed(
      categories as Record<string, Record<string, unknown>>,
      insights,
      input,
      40, // Lower data quality score for partial extraction
      ['Response was truncated — categories extracted but some insights may use defaults']
    );
  }

  console.error('❌ All parse attempts failed');
  console.error('Response text (first 500):', jsonText.slice(0, 500));
  console.error('Response text (last 500):', jsonText.slice(-500));
  return null;
}

/**
 * Attempt to repair truncated JSON by closing unclosed braces/brackets
 */
function repairTruncatedJson(text: string): string {
  let repaired = text;

  // Strip trailing incomplete string (unclosed quote)
  // Check if we're inside an unclosed string
  let quoteCount = 0;
  let esc = false;
  for (const ch of repaired) {
    if (esc) { esc = false; continue; }
    if (ch === '\\') { esc = true; continue; }
    if (ch === '"') quoteCount++;
  }
  if (quoteCount % 2 !== 0) {
    // We're inside an unclosed string — truncate back to last complete string
    const lastQuote = repaired.lastIndexOf('"');
    if (lastQuote > 0) {
      repaired = repaired.slice(0, lastQuote + 1);
    }
  }

  // Strip trailing incomplete key-value patterns
  repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*$/, ''); // trailing "key":
  repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*"[^"]*$/, ''); // trailing "key": "incomplete
  repaired = repaired.replace(/,\s*"[^"]*"\s*:\s*[^,}\]"]*$/, ''); // trailing "key": value
  repaired = repaired.replace(/,\s*$/, ''); // trailing comma

  // Count unclosed braces and brackets
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;

  for (const char of repaired) {
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === '{') openBraces++;
    else if (char === '}') openBraces--;
    else if (char === '[') openBrackets++;
    else if (char === ']') openBrackets--;
  }

  // Close any unclosed brackets then braces
  for (let i = 0; i < openBrackets; i++) repaired += ']';
  for (let i = 0; i < openBraces; i++) repaired += '}';

  return repaired;
}

/**
 * Extract just the categories object from a (possibly truncated) JSON response.
 * The categories section comes first in the output and is usually complete
 * even when the response is truncated in the insights section.
 */
function extractCategoriesFromPartialJson(responseText: string): Record<string, unknown> | null {
  try {
    // Find the start of the categories object
    const categoriesKeyIdx = responseText.indexOf('"categories"');
    if (categoriesKeyIdx === -1) return null;

    // Find the opening brace of the categories value
    const colonIdx = responseText.indexOf(':', categoriesKeyIdx + 12);
    if (colonIdx === -1) return null;
    const braceStart = responseText.indexOf('{', colonIdx);
    if (braceStart === -1) return null;

    // Walk through to find the matching closing brace
    let depth = 0;
    let inStr = false;
    let esc = false;
    let end = -1;

    for (let i = braceStart; i < responseText.length; i++) {
      const c = responseText[i];
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (c === '{') depth++;
      else if (c === '}') {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }

    let categoriesJson: string;
    if (end === -1) {
      // Categories section itself is truncated — attempt repair
      categoriesJson = repairTruncatedJson(responseText.slice(braceStart));
    } else {
      categoriesJson = responseText.slice(braceStart, end + 1);
    }

    const parsed = JSON.parse(categoriesJson);

    // Validate it has at least some expected category keys
    const expectedKeys = ['businessContext', 'revenueServices', 'localSEO', 'websiteReadiness'];
    const hasCategories = expectedKeys.some(key => key in parsed);
    if (!hasCategories) return null;

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Extract partial insights from a (possibly truncated) JSON response.
 * Tries to get whatever insights are complete before truncation.
 */
function extractInsightsFromPartialJson(responseText: string): Record<string, unknown> | null {
  try {
    const insightsKeyIdx = responseText.indexOf('"insights"');
    if (insightsKeyIdx === -1) return null;

    const colonIdx = responseText.indexOf(':', insightsKeyIdx + 10);
    if (colonIdx === -1) return null;
    const braceStart = responseText.indexOf('{', colonIdx);
    if (braceStart === -1) return null;

    // Try to extract and repair the insights section
    const insightsRaw = responseText.slice(braceStart);
    const repaired = repairTruncatedJson(insightsRaw);
    return JSON.parse(repaired);
  } catch {
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

  // Check for truncated response
  let responseContent = result.data.content;
  if (result.data.stopReason === 'max_tokens') {
    console.warn('⚠️ Claude response was truncated (stop_reason: max_tokens). Attempting to repair JSON...');
    responseContent = repairTruncatedJson(responseContent);
  }

  // Parse the response
  console.log(`Claude response: ${responseContent.length} chars, stop_reason: ${result.data.stopReason}`);

  const analysisResult = parseAIResponse(responseContent, input);

  if (!analysisResult) {
    console.error('Failed to parse Claude response after all attempts');
    console.error('Response preview:', responseContent.slice(0, 300));
    console.error('Response end:', responseContent.slice(-300));
    return {
      success: true,
      data: createFallbackResult(input, 'Failed to parse AI response'),
      estimatedCost,
    };
  }

  // Add warning if response was truncated
  if (result.data.stopReason === 'max_tokens') {
    analysisResult.warnings = analysisResult.warnings || [];
    analysisResult.warnings.push('AI response was truncated (max_tokens reached). Some insights may be incomplete.');
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
