/**
 * AI Analysis Types
 *
 * Types for Claude API integration that analyzes scraped research data
 * and produces AI-inferred answers for the 68-field intake framework.
 */

/**
 * Source of where an inferred field value came from
 */
export type InferenceSource =
  | 'gbp' // Google Business Profile data
  | 'sitemap' // Sitemap analysis
  | 'websiteCrawl' // Website crawler data
  | 'competitors' // Competitor analysis
  | 'seoAudit' // SEO audit data
  | 'citations' // Citation check data
  | 'ai' // AI inference (synthesized from multiple sources)
  | 'userInput'; // Direct user input

/**
 * A field value with confidence scoring and source tracking
 */
export interface InferredField<T> {
  value: T;
  source: InferenceSource;
  confidence: number; // 0-1 scale
  reasoning?: string; // Brief explanation of how value was determined
  alternativeValues?: T[]; // Other possible values considered
}

/**
 * Business Context category (Category 1)
 * 10 fields covering company details and market positioning
 */
export interface BusinessContextFields {
  companyName: InferredField<string>;
  yearsInBusiness: InferredField<number | null>;
  teamSize: InferredField<string | null>; // "Solo", "2-5", "6-10", "11-25", "26-50", "50+"
  primaryIndustry: InferredField<string>;
  businessDescription: InferredField<string>;
  uniqueSellingPoints: InferredField<string[]>;
  targetAudience: InferredField<string>;
  competitiveAdvantages: InferredField<string[]>;
  businessModel: InferredField<string>; // "B2B", "B2C", "B2B2C", "D2C"
  seasonality: InferredField<string | null>; // Peak seasons or "year-round"
}

/**
 * Revenue & Services category (Category 2)
 * 12 fields covering services, pricing, and revenue
 */
export interface RevenueServicesFields {
  primaryServices: InferredField<string[]>;
  secondaryServices: InferredField<string[]>;
  serviceDeliveryMethod: InferredField<string[]>; // "On-site", "In-store", "Online", "Hybrid"
  averageTransactionValue: InferredField<string | null>; // Price range
  pricingModel: InferredField<string>; // "Fixed", "Hourly", "Project-based", "Subscription"
  topRevenueServices: InferredField<string[]>; // Top 3 revenue generators
  serviceAreaType: InferredField<string>; // "Local", "Regional", "National", "International"
  serviceRadius: InferredField<string | null>; // "5 miles", "25 miles", etc.
  clientRetentionRate: InferredField<string | null>;
  referralPercentage: InferredField<string | null>;
  upsellOpportunities: InferredField<string[]>;
  recurringRevenueServices: InferredField<string[]>;
}

/**
 * Local SEO category (Category 3)
 * 10 fields covering local search presence
 */
export interface LocalSEOFields {
  gbpStatus: InferredField<'claimed' | 'unclaimed' | 'not_found' | 'unknown'>;
  gbpCompleteness: InferredField<number>; // 0-100 percentage
  gbpRating: InferredField<number | null>;
  gbpReviewCount: InferredField<number | null>;
  gbpCategories: InferredField<string[]>;
  gbpPhotosCount: InferredField<number | null>;
  primaryServiceArea: InferredField<string>;
  serviceAreas: InferredField<string[]>;
  napConsistency: InferredField<number>; // 0-100 percentage
  citationScore: InferredField<number | null>; // 0-100
}

/**
 * Website Readiness category (Category 4)
 * 20 fields covering website technical status and content depth
 */
export interface WebsiteReadinessFields {
  websiteUrl: InferredField<string>;
  cms: InferredField<string | null>;
  hasSsl: InferredField<boolean>;
  isMobileResponsive: InferredField<boolean>;
  hasStructuredData: InferredField<boolean>;
  schemaTypes: InferredField<string[]>;
  pageCount: InferredField<number | null>;
  hasServicePages: InferredField<boolean>;
  servicePageCount: InferredField<number | null>;
  hasBlogSection: InferredField<boolean>;
  hasLocationPages: InferredField<boolean>;
  locationPageCount: InferredField<number | null>;
  hasHubPages: InferredField<boolean>;
  hubPageCount: InferredField<number | null>;
  averagePageWordCount: InferredField<string>; // "Thin (<1000)", "Adequate (1000-1500)", "Strong (1500-2200)", "Comprehensive (2200+)"
  hasRobotsTxt: InferredField<boolean>;
  hasLlmsTxt: InferredField<boolean>;
  loadSpeed: InferredField<string | null>; // "Fast", "Average", "Slow"
  seoScore: InferredField<number | null>; // 0-100
  contentDepthScore: InferredField<number | null>; // 0-100 based on Hub+Spoke standards
}

/**
 * Tone & Voice category (Category 5)
 * 8 fields covering brand voice and messaging
 */
export interface ToneVoiceFields {
  brandTone: InferredField<string>; // "Professional", "Friendly", "Authoritative", etc.
  writingStyle: InferredField<string>; // "Formal", "Conversational", "Technical"
  keyMessaging: InferredField<string[]>;
  brandPersonality: InferredField<string[]>; // Key personality traits
  targetEmotions: InferredField<string[]>; // Emotions to evoke
  communicationStyle: InferredField<string>; // "Direct", "Nurturing", "Educational"
  industryJargonLevel: InferredField<string>; // "None", "Moderate", "Heavy"
  callToActionStyle: InferredField<string>; // "Urgent", "Soft", "Value-focused"
}

/**
 * Conversion & Measurement category (Category 6)
 * 8 fields covering conversion tracking and goals
 */
export interface ConversionMeasurementFields {
  primaryConversionGoal: InferredField<string>; // "Phone calls", "Form submissions", "Purchases"
  secondaryConversionGoals: InferredField<string[]>;
  currentTrackingSetup: InferredField<string[]>; // "Google Analytics", "GTM", etc.
  phoneTrackingStatus: InferredField<boolean | null>;
  formTrackingStatus: InferredField<boolean | null>;
  currentLeadVolume: InferredField<string | null>; // Estimated monthly leads
  conversionRate: InferredField<string | null>;
  customerJourneyLength: InferredField<string>; // "Same day", "1-7 days", "1-4 weeks", "1-3 months"
}

/**
 * AI Considerations category (Category 7)
 * 15 fields covering AI/LLM optimization and AEO compliance
 */
export interface AIConsiderationsFields {
  aiSearchVisibility: InferredField<string>; // "High", "Medium", "Low", "Unknown"
  contentDepth: InferredField<string>; // "Comprehensive", "Moderate", "Basic"
  expertiseSignals: InferredField<string[]>; // Expertise indicators found
  trustSignals: InferredField<string[]>; // Trust indicators found
  authorshipClarity: InferredField<boolean>;
  contentFreshness: InferredField<string>; // "Current", "Dated", "Mixed"
  citationWorthiness: InferredField<string>; // "High", "Medium", "Low"
  llmReadinessScore: InferredField<number>; // 0-100
  entityFirstScore: InferredField<number>; // 0-100 based on entity-first formatting
  hasSameAsReferences: InferredField<boolean>; // Links to LinkedIn, YouTube, etc.
  sameAsPlatforms: InferredField<string[]>; // Which platforms are referenced
  hasAuthorBio: InferredField<boolean>;
  hasCredentials: InferredField<boolean>; // Certifications, licenses visible
  aeoComplianceScore: InferredField<number>; // 0-100 based on AEO checklist
  hubSpokeScore: InferredField<number>; // 0-100 based on content architecture
}

/**
 * Content gap identified during analysis
 */
export interface ContentGap {
  gap: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  category: string; // "Hub Page", "Spoke Page", "Location Page", "Blog", "Technical SEO", "Schema", "AEO"
  targetKeyword?: string;
  estimatedImpact?: string;
  wordCountTarget?: number;
}

/**
 * Competitive insight discovered
 */
export interface CompetitiveInsight {
  insight: string;
  opportunity: string;
  competitors: string[];
  actionableStep?: string;
}

/**
 * Individual competitor profile for comparison
 */
export interface CompetitorProfile {
  name: string;
  website: string;
  // GBP metrics
  gbpRating: number | null;
  gbpReviewCount: number | null;
  gbpPhotosCount: number | null;
  gbpCategories: string[];
  gbpResponseRate: string | null; // "High", "Medium", "Low", "Unknown"
  // Website metrics
  estimatedPageCount: number | null;
  hasServicePages: boolean;
  servicePageCount: number | null;
  hasBlogSection: boolean;
  blogPostCount: number | null;
  hasLocationPages: boolean;
  contentDepthAssessment: 'comprehensive' | 'adequate' | 'thin' | 'minimal';
  // Technical SEO
  hasSsl: boolean;
  hasSchema: boolean;
  schemaTypes: string[];
  // Services & positioning
  primaryServices: string[];
  uniqueValueProps: string[];
  pricingIndicators: string | null; // "$", "$$", "$$$", "$$$$" or descriptive
  targetAudience: string;
  // Strengths & weaknesses
  strengths: string[];
  weaknesses: string[];
}

/**
 * Detailed competitor comparison matrix
 */
export interface CompetitorComparison {
  // Client vs competitors overview
  clientProfile: CompetitorProfile;
  competitors: CompetitorProfile[];

  // Head-to-head comparisons
  gbpComparison: {
    clientRank: number; // 1 = best rating among competitors
    averageCompetitorRating: number;
    reviewCountComparison: 'above' | 'at' | 'below'; // vs competitor average
    photoCountComparison: 'above' | 'at' | 'below';
    recommendations: string[];
  };

  contentComparison: {
    clientContentScore: number; // 0-100
    averageCompetitorScore: number;
    contentGapsVsCompetitors: string[]; // Topics competitors cover that client doesn't
    contentAdvantages: string[]; // Topics client covers better
    wordCountComparison: 'above' | 'at' | 'below';
  };

  serviceComparison: {
    sharedServices: string[]; // Services all/most offer
    uniqueToClient: string[]; // Services only client offers
    missingFromClient: string[]; // Services competitors offer that client doesn't
    pricingPosition: 'premium' | 'mid-market' | 'budget' | 'unknown';
  };

  technicalComparison: {
    schemaAdoption: { competitor: string; schemaTypes: string[] }[];
    clientSchemaGaps: string[]; // Schema types competitors have that client doesn't
  };

  // Overall competitive position
  overallPosition: 'leader' | 'competitive' | 'challenger' | 'laggard';
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
  marketOpportunities: string[];
}

/**
 * Ideal Client Profile (ICP) based on research analysis
 */
export interface IdealClientProfile {
  // Demographics
  demographics: {
    ageRange: string; // "25-34", "35-44", etc.
    gender: string; // "All", "Predominantly Male", "Predominantly Female"
    incomeLevel: string; // "Middle", "Upper-Middle", "High", etc.
    homeownership: string; // "Homeowners", "Renters", "Both"
    familyStatus: string; // "Families with children", "Empty nesters", "Young professionals"
    location: string; // Geographic description
  };

  // Psychographics
  psychographics: {
    values: string[]; // What they value (quality, price, convenience, expertise)
    lifestyle: string; // Description of lifestyle
    buyingMotivation: string; // Why they buy
    decisionStyle: string; // "Research-heavy", "Impulse", "Referral-driven", "Price-sensitive"
  };

  // Pain points & needs
  painPoints: string[]; // Problems they're trying to solve
  needs: string[]; // What they need from the service
  objections: string[]; // Common hesitations before buying

  // Buying behavior
  buyingBehavior: {
    researchSources: string[]; // Where they research (Google, reviews, referrals)
    decisionTimeframe: string; // "Same day", "1-7 days", "1-4 weeks", "1-3 months"
    decisionInfluencers: string[]; // Who influences their decision
    priceWeight: 'primary' | 'secondary' | 'minimal'; // How much price matters
    qualityExpectations: string; // What quality means to them
  };

  // Best channels to reach them
  marketingChannels: {
    primary: string[]; // Most effective channels
    secondary: string[]; // Supporting channels
    messagingThemes: string[]; // What messages resonate
  };

  confidence: number; // 0-1 confidence in this ICP
  reasoning: string; // Why this ICP was identified
}

/**
 * Customer avatar/persona
 */
export interface CustomerAvatar {
  name: string; // Persona name (e.g., "Busy Brian the Homeowner")
  tagline: string; // One-line description

  // Demographics
  age: number;
  gender: string;
  occupation: string;
  income: string;
  location: string;
  familyStatus: string;

  // Story
  backgroundStory: string; // 2-3 sentence background
  dayInLife: string; // Typical day description

  // Motivations & frustrations
  goals: string[]; // What they want to achieve
  frustrations: string[]; // What frustrates them
  fears: string[]; // What they're afraid of (related to service)

  // Buying journey
  triggerEvent: string; // What triggers them to seek service
  researchProcess: string; // How they research options
  decisionCriteria: string[]; // What matters in their decision
  objections: string[]; // What might stop them from buying

  // How to reach them
  preferredChannels: string[]; // Where to find them
  contentPreferences: string[]; // What content they engage with
  messagingThatResonates: string[]; // Messages that work

  // Revenue potential
  lifetimeValueEstimate: string; // "$X - $Y" range
  serviceFrequency: string; // How often they need service
  upsellPotential: string[]; // Additional services they might need

  // Quote
  representativeQuote: string; // Something this avatar would say
}

/**
 * Complete ICP and avatar analysis
 */
export interface ICPAnalysis {
  primaryICP: IdealClientProfile;
  secondaryICPs: IdealClientProfile[]; // Additional viable segments

  // Customer avatars (2-3 detailed personas)
  avatars: CustomerAvatar[];

  // Market insights
  marketInsights: {
    estimatedMarketSize: string; // Qualitative estimate
    competitionLevel: 'high' | 'medium' | 'low';
    growthTrend: 'growing' | 'stable' | 'declining';
    seasonalPatterns: string[];
  };

  // Recommendations
  targetingRecommendations: string[];
  messagingRecommendations: string[];
  channelRecommendations: string[];
}

/**
 * SERP Gap Analysis - Identifies opportunities where client can outrank competitors
 */

/**
 * Individual competitor weakness for SERP gap opportunity
 */
export interface CompetitorWeakness {
  competitorName: string;
  competitorUrl: string;
  weaknessType: 'missing_title_keywords' | 'thin_content' | 'outdated' | 'slow_load' | 'poor_readability' | 'missing_schema' | 'no_ssl' | 'no_faq' | 'poor_mobile';
  description: string;
  severity: 'high' | 'medium' | 'low';
  exploitableBy: string; // What client should do to exploit this weakness
}

/**
 * SERP opportunity - a keyword/topic where client can rank
 */
export interface SERPOpportunity {
  keyword: string;
  searchIntent: 'informational' | 'navigational' | 'commercial' | 'transactional';

  // Opportunity assessment
  difficulty: 'easy' | 'medium' | 'hard';
  opportunityScore: number; // 0-100, higher = better opportunity

  // Why it's an opportunity
  rationale: string;

  // Competitor analysis for this keyword
  competitorWeaknesses: CompetitorWeakness[];

  // Content recommendations
  recommendedContentType: 'hub_page' | 'spoke_page' | 'location_page' | 'blog_post' | 'faq_page';
  recommendedWordCount: number;
  contentAngle: string; // Unique angle to differentiate from competitors

  // Technical recommendations
  targetUrl: string;
  titleTagRecommendation: string;
  metaDescriptionRecommendation: string;
  schemaRecommendations: string[];

  // Estimated impact
  estimatedMonthlySearches: string; // "100-500", "500-1K", etc.
  estimatedTimeToRank: string; // "1-3 months", "3-6 months", etc.
}

/**
 * Content freshness gap - outdated competitor content client can beat
 */
export interface ContentFreshnessGap {
  topic: string;
  competitorWithOutdatedContent: string;
  lastUpdatedEstimate: string; // "6+ months ago", "1+ year ago"
  currentCompetitorPosition: string; // "Top 3", "Top 10", etc.
  opportunityDescription: string;
  recommendedAction: string;
}

/**
 * Topic coverage gap - topics competitors cover that client doesn't
 */
export interface TopicCoverageGap {
  topic: string;
  competitorsCovering: string[];
  searchIntent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  priority: 'high' | 'medium' | 'low';
  recommendedContentFormat: string;
  suggestedTitle: string;
  estimatedWordCount: number;
  relatedKeywords: string[];
}

/**
 * Technical SEO gap vs competitors
 */
export interface TechnicalSEOGap {
  gapType: 'schema' | 'speed' | 'mobile' | 'ssl' | 'structured_data' | 'robots' | 'sitemap' | 'meta_tags';
  description: string;
  competitorsWithAdvantage: string[];
  clientCurrentStatus: string;
  recommendedFix: string;
  implementationPriority: 'high' | 'medium' | 'low';
  estimatedImpact: string;
}

/**
 * Complete SERP Gap Analysis
 */
export interface SERPGapAnalysis {
  // Overall assessment
  overallOpportunityScore: number; // 0-100
  marketSaturation: 'high' | 'medium' | 'low';
  quickWinCount: number;

  // SERP opportunities (ranked by opportunity score)
  serpOpportunities: SERPOpportunity[];

  // Content gaps
  topicCoverageGaps: TopicCoverageGap[];
  contentFreshnessGaps: ContentFreshnessGap[];

  // Technical gaps
  technicalGaps: TechnicalSEOGap[];

  // Competitor weaknesses summary
  competitorWeaknessSummary: {
    competitor: string;
    weaknessCount: number;
    primaryWeaknesses: string[];
    exploitationStrategy: string;
  }[];

  // Priority actions (top 5 quick wins)
  quickWinActions: {
    action: string;
    targetKeyword: string;
    competitorToOutrank: string;
    estimatedEffort: 'easy' | 'medium' | 'hard';
    estimatedTimeToRank: string;
    rationale: string;
  }[];

  // Long-term opportunities
  longTermOpportunities: {
    opportunity: string;
    timeframe: string;
    investmentLevel: 'low' | 'medium' | 'high';
    expectedReturn: string;
  }[];
}

/**
 * Suggested keyword with search intent
 */
export interface SuggestedKeyword {
  keyword: string;
  intent: 'informational' | 'navigational' | 'commercial' | 'transactional';
  estimatedDifficulty: 'easy' | 'medium' | 'hard';
  relevance: number; // 0-1
}

/**
 * Quick win action item
 */
export interface QuickWin {
  action: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  category: string;
  timeframe: string;
  implementation?: string;
}

/**
 * Hub page assessment in Hub+Spoke content model
 */
export interface HubPageAnalysis {
  topic: string;
  currentUrl: string | null;
  status: 'missing' | 'thin' | 'adequate' | 'strong';
  currentWordCount: number;
  targetWordCount: number; // 3000-5000
  spokeCount: number;
  targetSpokeCount: number; // 8-12
  recommendations: string[];
}

/**
 * Spoke page assessment in Hub+Spoke content model
 */
export interface SpokePageAnalysis {
  topic: string;
  parentHub: string;
  currentUrl: string | null;
  status: 'missing' | 'thin' | 'adequate' | 'strong';
  currentWordCount: number;
  targetWordCount: number; // 1500-2200
  hasHubLink: boolean;
  hasCrossLinks: boolean;
  recommendations: string[];
}

/**
 * Missing hub topic recommendation
 */
export interface MissingHubTopic {
  topic: string;
  rationale: string;
  suggestedSpokes: string[];
  primaryKeyword: string;
  searchIntent: string;
}

/**
 * Content journey stage coverage assessment
 */
export interface ContentJourneyCoverage {
  awareness: 'strong' | 'adequate' | 'weak' | 'missing';
  consideration: 'strong' | 'adequate' | 'weak' | 'missing';
  decision: 'strong' | 'adequate' | 'weak' | 'missing';
  gaps: string[];
}

/**
 * Hub+Spoke content architecture analysis
 */
export interface HubSpokeAnalysis {
  overallScore: number; // 0-100
  hasHubPages: boolean;
  hubPages: HubPageAnalysis[];
  spokePages: SpokePageAnalysis[];
  missingHubTopics: MissingHubTopic[];
  internalLinkingScore: number; // 0-100
  internalLinkingIssues: string[];
  contentJourneyCoverage: ContentJourneyCoverage;
}

/**
 * Entity assessment for AEO compliance
 */
export interface EntityAssessment {
  brandNameInFirstParagraph: boolean;
  authorAttribution: boolean;
  sameAsReferences: string[];
  missingSameAs: string[];
  redundantEntityMentions: boolean;
  expertiseSignalsFound: string[];
  authoritySignalsMissing: string[];
}

/**
 * Schema readiness assessment
 */
export interface SchemaReadiness {
  faqSchemaPresent: boolean;
  howToSchemaPresent: boolean;
  localBusinessSchemaComplete: boolean;
  articleSchemaPresent: boolean;
  missingSchemaOpportunities: string[];
}

/**
 * FAQ opportunity for AEO
 */
export interface FAQOpportunity {
  question: string;
  answer: string;
  targetPage: string;
  schemaReady: boolean;
}

/**
 * AEO compliance checklist results
 */
export interface AEOComplianceChecklist {
  brandInFirstParagraph: boolean;
  twoSameAsReferences: boolean;
  schemaCompatibleFormatting: boolean;
  authorAttribution: boolean;
  redundantEntityMentions: boolean;
  internalTopicClusterLinks: boolean;
  backedClaimsWithCitations: boolean;
  h1WithPrimaryTopic: boolean;
  dateModifiedVisible: boolean;
  overallScore: number;
  recommendations: string[];
}

/**
 * AEO (Answer Engine Optimization) strategy analysis
 */
export interface AEOStrategy {
  currentReadiness: 'high' | 'medium' | 'low';
  entityFirstScore: number; // 0-100
  entityAssessment: EntityAssessment;
  schemaReadiness: SchemaReadiness;
  faqOpportunities: FAQOpportunity[];
  speakableContent: string[];
  citableStatements: string[];
  contentStructureRecommendations: string[];
  aeoComplianceChecklist: AEOComplianceChecklist;
}

/**
 * Service page strategy recommendation
 */
export interface ServicePageStrategy {
  service: string;
  currentStatus: 'missing' | 'thin' | 'adequate' | 'strong';
  currentWordCount: number;
  recommendedUrl: string;
  titleTag: string;
  metaDescription: string;
  h1: string;
  targetKeywords: string[];
  contentSections: string[];
  wordCountTarget: number;
  schemaTypes: string[];
  internalLinks: {
    toHub: string;
    toSpokes: string[];
    fromPages: string[];
  };
  externalLinkSuggestions: string[];
}

/**
 * Location page strategy recommendation
 */
export interface LocationPageStrategy {
  location: string;
  currentStatus: 'missing' | 'thin' | 'adequate';
  currentWordCount: number;
  recommendedUrl: string;
  titleTag: string;
  metaDescription: string;
  h1: string;
  localKeywords: string[];
  contentAngle: string;
  wordCountTarget: number;
  contentSections: string[];
  nearbyAreas: string[];
  localProofPoints: string[];
  schemaTypes: string[];
}

/**
 * SEO technical analysis
 */
export interface SEOTechnicalAnalysis {
  metaTitleTemplate: string;
  metaDescriptionTemplate: string;
  robotsTxtStatus: 'found' | 'missing' | 'incomplete';
  robotsTxtRecommendations: string[];
  llmsTxtStatus: 'found' | 'missing';
  llmsTxtRecommendations: string;
  missingSchemaTypes: string[];
  canonicalIssues: string[];
}

/**
 * Priority recommendation with rationale
 */
export interface PriorityRecommendation {
  priority: number;
  action: string;
  category: string;
  rationale: string;
  expectedImpact: string;
}

/**
 * Risk factor with severity
 */
export interface RiskFactor {
  risk: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
}

/**
 * Strategic insights generated by AI analysis
 */
export interface StrategicInsights {
  contentGaps: ContentGap[];
  competitiveInsights: CompetitiveInsight[];
  competitorComparison: CompetitorComparison;
  icpAnalysis: ICPAnalysis;
  serpGapAnalysis: SERPGapAnalysis;
  suggestedKeywords: SuggestedKeyword[];
  quickWins: QuickWin[];
  seoTechnical: SEOTechnicalAnalysis;
  aeoStrategy: AEOStrategy;
  hubSpokeAnalysis: HubSpokeAnalysis;
  servicePageStrategy: ServicePageStrategy[];
  locationPageStrategy: LocationPageStrategy[];
  priorityRecommendations: PriorityRecommendation[];
  riskFactors: RiskFactor[];
}

/**
 * Complete AI analysis result
 */
export interface AIAnalysisResult {
  analyzedAt: string; // ISO timestamp
  model: string; // e.g., "claude-sonnet-4-20250514"
  sessionId: string;

  // All 7 category analyses
  categories: {
    businessContext: BusinessContextFields;
    revenueServices: RevenueServicesFields;
    localSEO: LocalSEOFields;
    websiteReadiness: WebsiteReadinessFields;
    toneVoice: ToneVoiceFields;
    conversionMeasurement: ConversionMeasurementFields;
    aiConsiderations: AIConsiderationsFields;
  };

  // Strategic insights derived from analysis
  insights: StrategicInsights;

  // Overall metrics
  overallConfidence: number; // 0-1 average confidence
  fieldsAnalyzed: number;
  fieldsWithHighConfidence: number; // confidence > 0.7
  fieldsWithLowConfidence: number; // confidence < 0.4
  dataQualityScore: number; // 0-100 based on input data completeness

  // API usage tracking
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };

  // Processing metadata
  processingTimeMs: number;
  warnings: string[];
  errors: string[];
}

/**
 * Input data structure for AI analysis
 * Maps to the research session results
 */
export interface AIAnalysisInput {
  sessionId: string;
  businessName: string;
  website: string;
  city?: string;
  state?: string;
  industry?: string;

  // Research results
  gbp?: Record<string, unknown>;
  sitemap?: Record<string, unknown>;
  websiteCrawl?: Record<string, unknown>;
  competitors?: Record<string, unknown>[];
  seoAudit?: Record<string, unknown>;
  citations?: Record<string, unknown>[];

  // Manual input from verification (user-provided data)
  manualInput?: Record<string, Record<string, unknown>>;
}

/**
 * Response type for the analyze API endpoint
 */
export interface AnalyzeAPIResponse {
  success: boolean;
  data?: AIAnalysisResult;
  error?: string;
  sessionId: string;
}
