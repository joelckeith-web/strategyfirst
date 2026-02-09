'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface GBPData {
  name: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  phone?: string;
  address?: string;
  website?: string;
}

interface CompetitorData {
  rank: number;
  name: string;
  rating: number;
  reviewCount: number;
  prominenceScore?: number;
}

interface MapPackData {
  rank: number;
  name: string;
  rating: number;
  reviewCount: number;
  isMapPackResult?: boolean;
  mapPackPosition?: number;
}

interface WebsiteCrawlData {
  cms: string;
  technologies: string[];
  ssl: boolean;
  mobileResponsive: boolean;
  structuredData: boolean;
  schemaTypes: string[];
  description: string;
  title: string;
  totalPages?: number;
  pageLimitReached?: boolean;
}

interface SitemapData {
  totalPages: number;
  pageTypes?: Record<string, number>;
  hasServicePages?: boolean;
  hasBlog?: boolean;
  hasLocationPages?: boolean;
  recentlyUpdated?: number;
  // Raw URL data (when AI hasn't categorized yet)
  urls?: Array<{ url: string; lastmod?: string | null }>;
  derivedFromCrawler?: boolean;
}

interface SEOAuditData {
  score: number;
  mobile: {
    score: number;
    usability: boolean;
    viewport: boolean;
    textSize: boolean;
  };
  performance: {
    score: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  technical: {
    ssl: boolean;
    canonicalTag: boolean;
    robotsTxt: boolean;
    sitemap: boolean;
    structuredData: string[];
    metaDescription: boolean;
    h1Tags: number;
  };
  content: {
    wordCount: number;
    headings: number;
    images: number;
    imagesWithAlt: number;
    internalLinks: number;
    externalLinks: number;
  };
}

interface CitationData {
  source: string;
  found: boolean;
  napConsistent?: boolean | null;
  url?: string;
  issues?: string[];
}

interface CitationSummary {
  totalChecked: number;
  found: number;
  withIssues: number;
  napConsistencyScore: number;
  commonIssues?: string[];
  recommendations?: string[];
  checkedAt?: string;
  error?: string;
}

interface AIAnalysisData {
  analyzedAt: string;
  model: string;
  overallConfidence: number;
  fieldsAnalyzed: number;
  fieldsWithHighConfidence: number;
  fieldsWithLowConfidence: number;
  dataQualityScore: number;
  processingTimeMs: number;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  // Categories from AI analysis (includes page categorization)
  categories?: {
    websiteReadiness?: {
      hasServicePages?: { value: boolean };
      servicePageCount?: { value: number | null };
      hasBlogSection?: { value: boolean };
      blogPostCount?: { value: number | null };
      hasLocationPages?: { value: boolean };
      locationPageCount?: { value: number | null };
      pageCount?: { value: number | null };
    };
  };
  insights: {
    contentGaps: Array<{ gap: string; priority: string; action: string; category?: string; targetKeyword?: string; wordCountTarget?: number }>;
    competitiveInsights: Array<{ insight: string; opportunity: string; competitors?: string[]; actionableStep?: string }>;
    suggestedKeywords: Array<{ keyword: string; intent: string; pageTarget?: string; priority?: string }>;
    quickWins: Array<{ action: string; impact: string; effort: string; category?: string; timeframe?: string; implementation?: string }>;
    priorityRecommendations: Array<{ priority: number; action: string; category: string; rationale: string; expectedImpact: string }>;
    competitorComparison?: {
      clientProfile?: Record<string, unknown>;
      competitors?: Array<Record<string, unknown>>;
      gbpComparison?: { clientRank: number; averageCompetitorRating: number; reviewCountComparison: string; recommendations: string[] };
      contentComparison?: { clientContentScore: number; averageCompetitorScore: number; contentGapsVsCompetitors: string[]; contentAdvantages: string[] };
      serviceComparison?: { sharedServices: string[]; uniqueToClient: string[]; missingFromClient: string[]; pricingPosition: string };
      overallPosition?: string;
      competitiveAdvantages?: string[];
      competitiveDisadvantages?: string[];
    };
    icpAnalysis?: {
      primaryICP?: {
        demographics?: Record<string, string>;
        psychographics?: Record<string, string | string[]>;
        painPoints?: string[];
        needs?: string[];
        objections?: string[];
      };
      avatars?: Array<{
        name: string;
        tagline: string;
        age?: number;
        occupation?: string;
        backgroundStory?: string;
        goals?: string[];
        frustrations?: string[];
        triggerEvent?: string;
        decisionCriteria?: string[];
        representativeQuote?: string;
      }>;
      targetingRecommendations?: string[];
      messagingRecommendations?: string[];
    };
    serpGapAnalysis?: {
      overallOpportunityScore?: number;
      serpOpportunities?: Array<{
        keyword: string;
        opportunityScore: number;
        difficulty: string;
        rationale: string;
        recommendedContentType: string;
        recommendedWordCount: number;
        titleTagRecommendation?: string;
      }>;
      quickWinActions?: Array<{
        action: string;
        targetKeyword: string;
        competitorToOutrank?: string;
        estimatedEffort: string;
        rationale: string;
      }>;
      topicCoverageGaps?: Array<{
        topic: string;
        competitorsCovering: string[];
        priority: string;
        suggestedTitle: string;
        estimatedWordCount: number;
      }>;
    };
    hubSpokeAnalysis?: {
      overallScore?: number;
      hasHubPages?: boolean;
      hubPages?: Array<{
        topic: string;
        currentUrl?: string;
        status: string;
        currentWordCount: number;
        targetWordCount: number;
        spokeCount: number;
        targetSpokeCount: number;
        recommendations: string[];
      }>;
      missingHubTopics?: Array<{
        topic: string;
        rationale: string;
        suggestedSpokes: string[];
        primaryKeyword: string;
      }>;
      internalLinkingScore?: number;
    };
    servicePageStrategy?: Array<{
      service: string;
      currentStatus: string;
      currentWordCount: number;
      recommendedUrl: string;
      titleTag: string;
      h1: string;
      targetKeywords: string[];
      wordCountTarget: number;
      contentSections: string[];
    }>;
    locationPageStrategy?: Array<{
      location: string;
      currentStatus: string;
      recommendedUrl: string;
      titleTag: string;
      localKeywords: string[];
      wordCountTarget: number;
    }>;
    aeoStrategy?: {
      currentReadiness?: string;
      entityFirstScore?: number;
      aeoComplianceChecklist?: {
        brandInFirstParagraph: boolean;
        twoSameAsReferences: boolean;
        schemaCompatibleFormatting: boolean;
        authorAttribution: boolean;
        overallScore: number;
        recommendations: string[];
      };
      faqOpportunities?: Array<{
        question: string;
        answer: string;
        targetPage: string;
      }>;
    };
    seoTechnical?: {
      metaTitleTemplate?: string;
      metaDescriptionTemplate?: string;
      robotsTxtStatus?: string;
      llmsTxtStatus?: string;
      llmsTxtRecommendations?: string;
      missingSchemaTypes?: string[];
    };
  };
}

// Info tooltip component
function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-block ml-1">
      <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="invisible group-hover:visible absolute z-50 w-64 p-2 mt-1 text-xs text-white bg-gray-900 rounded-lg shadow-lg -left-28 top-5">
        {text}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
      </div>
    </div>
  );
}

interface ResearchResults {
  gbp?: GBPData;
  competitors?: CompetitorData[];
  mapPack?: MapPackData[];
  websiteCrawl?: WebsiteCrawlData;
  sitemap?: SitemapData;
  seoAudit?: SEOAuditData;
  citations?: CitationData[];
  citationSummary?: CitationSummary;
  aiAnalysis?: AIAnalysisData;
}

interface SessionData {
  sessionId: string;
  clientId?: string | null;
  locationId?: string | null;
  status: string;
  input: {
    businessName: string;
    website: string;
    city?: string;
    state?: string;
  };
  results: ResearchResults;
  completedAt: string | null;
}

function ScoreCircle({ score, label, size = 'md' }: { score: number; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const sizes = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-24 h-24 text-3xl',
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`${sizes[size]} rounded-full border-4 border-current flex items-center justify-center ${getColor(score)}`}>
        <span className="font-bold">{score}</span>
      </div>
      <span className="text-sm text-gray-600 mt-2">{label}</span>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string | number; label: string; icon: string }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
      <span className="text-2xl mb-2 block">{icon}</span>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function ResearchResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: sessionId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasTriggeredReanalysis, setHasTriggeredReanalysis] = useState(false);
  const [isCitationLoading, setIsCitationLoading] = useState(false);
  const [citationError, setCitationError] = useState<string | null>(null);
  const [isFullScrapeLoading, setIsFullScrapeLoading] = useState(false);
  const [fullScrapeError, setFullScrapeError] = useState<string | null>(null);

  const runAIAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch(`/api/research/${sessionId}/analyze`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      // Refetch the session data to get the updated results with aiAnalysis
      const statusResponse = await fetch(`/api/research/status/${sessionId}`);
      if (statusResponse.ok) {
        const updatedData = await statusResponse.json();
        setSessionData(updatedData);
      }

      // Clear the reanalyze param from URL after successful analysis
      if (searchParams.get('reanalyze') === 'true') {
        router.replace(`/research/${sessionId}/results`);
      }
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Failed to run analysis');
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, searchParams, router]);

  const runCitationCheck = useCallback(async () => {
    setIsCitationLoading(true);
    setCitationError(null);

    try {
      const response = await fetch(`/api/research/${sessionId}/citations`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run citation check');
      }

      // Update session data with new citations
      if (data.success && sessionData) {
        const updatedData = {
          ...sessionData,
          results: {
            ...sessionData.results,
            citations: data.data.citations,
            citationSummary: data.data.summary,
          },
        };
        setSessionData(updatedData);
      }
    } catch (err) {
      setCitationError(err instanceof Error ? err.message : 'Failed to run citation check');
    } finally {
      setIsCitationLoading(false);
    }
  }, [sessionId, sessionData]);

  const runFullScrape = useCallback(async () => {
    setIsFullScrapeLoading(true);
    setFullScrapeError(null);

    try {
      const response = await fetch(`/api/research/${sessionId}/full-scrape`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run full scrape');
      }

      // Refetch the session data to get updated results
      const statusResponse = await fetch(`/api/research/status/${sessionId}`);
      if (statusResponse.ok) {
        const updatedData = await statusResponse.json();
        setSessionData(updatedData);
      }
    } catch (err) {
      setFullScrapeError(err instanceof Error ? err.message : 'Failed to run full scrape');
    } finally {
      setIsFullScrapeLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    async function fetchResults() {
      try {
        const response = await fetch(`/api/research/status/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        const data = await response.json();
        setSessionData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [sessionId]);

  // Auto-trigger re-analysis when coming from verification page
  useEffect(() => {
    const shouldReanalyze = searchParams.get('reanalyze') === 'true';
    if (shouldReanalyze && !isLoading && sessionData && !isAnalyzing && !hasTriggeredReanalysis) {
      setHasTriggeredReanalysis(true);
      runAIAnalysis();
    }
  }, [searchParams, isLoading, sessionData, isAnalyzing, hasTriggeredReanalysis, runAIAnalysis]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-3 text-gray-600">Loading results...</span>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardBody>
            <div className="text-center py-8">
              <p className="text-red-600">{error || 'Results not found'}</p>
              <Button onClick={() => router.push('/research')} className="mt-4">
                Start New Research
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  const { results, input } = sessionData;
  const { gbp, competitors, mapPack, websiteCrawl, sitemap, seoAudit, citations, citationSummary, aiAnalysis: rawAiAnalysis } = results;

  // Normalize aiAnalysis - treat empty objects as undefined
  const aiAnalysis = rawAiAnalysis && typeof rawAiAnalysis === 'object' && Object.keys(rawAiAnalysis).length > 0
    ? rawAiAnalysis
    : undefined;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{input.businessName}</h1>
          <p className="text-gray-600 mt-1">{input.website}</p>
          {input.city && input.state && (
            <p className="text-sm text-gray-500">{input.city}, {input.state}</p>
          )}
          {sessionData.clientId && (
            <Link
              href={`/clients/${sessionData.clientId}`}
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              View Client Profile &rarr;
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          {sessionData.clientId && sessionData.locationId && (
            <Button
              onClick={() => router.push(`/research?clientId=${sessionData.clientId}&locationId=${sessionData.locationId}`)}
              variant="outline"
            >
              Run Again
            </Button>
          )}
          <Button onClick={() => router.push('/research')} variant="outline">
            New Research
          </Button>
        </div>
      </div>

      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center">
                <span className="mr-2">AI Analysis</span>
                {aiAnalysis && (
                  <span className="text-sm font-normal text-green-600 bg-green-100 px-2 py-1 rounded">
                    Complete
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {aiAnalysis
                  ? 'AI has analyzed your research data'
                  : 'Use AI to analyze research data and pre-fill intake forms'}
              </p>
            </div>
            {!aiAnalysis && !isAnalyzing && (
              <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
                Run AI Analysis
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-8 h-8 text-blue-500 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {hasTriggeredReanalysis ? (
                <>
                  <span className="text-gray-800 font-medium">Re-analyzing with your verified data...</span>
                  <span className="text-gray-500 text-sm mt-1">This will produce higher confidence recommendations.</span>
                </>
              ) : (
                <span className="text-gray-600">Analyzing with AI... This may take 30-60 seconds.</span>
              )}
            </div>
          )}

          {analysisError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{analysisError}</p>
              <Button onClick={runAIAnalysis} variant="outline" className="mt-3">
                Try Again
              </Button>
            </div>
          )}

          {!aiAnalysis && !isAnalyzing && !analysisError && (
            <div className="text-center py-6 text-gray-500">
              <p>Click "Run AI Analysis" to analyze your research data and get:</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>68 pre-filled intake form fields with confidence scores</li>
                <li>Content gaps and quick win recommendations</li>
                <li>Competitive insights and keyword suggestions</li>
              </ul>
            </div>
          )}

          {aiAnalysis && (
            <div className="space-y-8">
              {/* Summary Stats with Tooltips */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {Math.round(aiAnalysis.overallConfidence * 100)}%
                  </p>
                  <p className="text-sm text-gray-500">
                    Overall Confidence
                    <InfoTooltip text="Average confidence across all 68 inferred intake fields. Higher means more data was available to make accurate inferences." />
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {aiAnalysis.fieldsWithHighConfidence}
                  </p>
                  <p className="text-sm text-gray-500">
                    High Confidence
                    <InfoTooltip text="Fields with 70%+ confidence that can be used directly. These had strong supporting data from GBP, website, or competitors." />
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg relative">
                  <p className="text-3xl font-bold text-amber-600">
                    {aiAnalysis.fieldsWithLowConfidence}
                  </p>
                  <p className="text-sm text-gray-500">
                    Need Verification
                    <InfoTooltip text="Fields with under 40% confidence that should be verified with the client. These were educated guesses due to limited data." />
                  </p>
                  {aiAnalysis.fieldsWithLowConfidence > 0 && (
                    <Button
                      onClick={() => router.push(`/research/${sessionId}/verify`)}
                      variant="outline"
                      className="mt-2 text-xs px-2 py-1"
                    >
                      Fill Missing Data →
                    </Button>
                  )}
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-gray-600">
                    {aiAnalysis.dataQualityScore}
                  </p>
                  <p className="text-sm text-gray-500">
                    Data Quality
                    <InfoTooltip text="0-100 score based on completeness of input data (GBP, sitemap, website crawl, competitors). Higher = more data sources available." />
                  </p>
                </div>
              </div>

              {/* Verification CTA Banner */}
              {aiAnalysis.fieldsWithLowConfidence > 5 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-amber-800">
                      {aiAnalysis.fieldsWithLowConfidence} fields need verification
                    </p>
                    <p className="text-sm text-amber-600">
                      Answer a few questions to improve analysis accuracy and get more specific recommendations.
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push(`/research/${sessionId}/verify`)}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Verify Now
                  </Button>
                </div>
              )}

              {/* SERP Gap Analysis - Quick Wins */}
              {aiAnalysis.insights?.serpGapAnalysis?.quickWinActions && aiAnalysis.insights.serpGapAnalysis.quickWinActions.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                    SERP Quick Wins
                    <InfoTooltip text="Specific ranking opportunities where competitors have weaknesses. These are low-effort actions that can yield results in 1-3 months." />
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">Ranking opportunities based on competitor weaknesses</p>
                  <div className="space-y-3">
                    {aiAnalysis.insights.serpGapAnalysis.quickWinActions.map((win, idx) => (
                      <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{win.action}</p>
                            <p className="text-sm text-gray-600 mt-1">{win.rationale}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Target: {win.targetKeyword}
                              </span>
                              {win.competitorToOutrank && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                  Beat: {win.competitorToOutrank}
                                </span>
                              )}
                              <span className={`text-xs px-2 py-1 rounded ${
                                win.estimatedEffort === 'easy' ? 'bg-green-100 text-green-700' :
                                win.estimatedEffort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                Effort: {win.estimatedEffort}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hub-Spoke Content Strategy */}
              {aiAnalysis.insights?.hubSpokeAnalysis && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                    Hub-Spoke Content Strategy
                    <InfoTooltip text="Hub pages are pillar content (3,000-5,000 words) that link to 8-12 spoke pages (1,500-2,200 words each). This structure signals topical authority to search engines." />
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">Content architecture assessment against Hub+Spoke methodology</p>

                  {/* Hub-Spoke Score */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-blue-600">{aiAnalysis.insights.hubSpokeAnalysis.overallScore || 0}</span>
                      <span className="text-gray-500 ml-1">/100</span>
                    </div>
                    <span className="text-sm text-gray-600">Content Architecture Score</span>
                    {aiAnalysis.insights.hubSpokeAnalysis.internalLinkingScore !== undefined && (
                      <span className="text-sm text-gray-500">| Internal Linking: {aiAnalysis.insights.hubSpokeAnalysis.internalLinkingScore}/100</span>
                    )}
                  </div>

                  {/* Missing Hub Topics */}
                  {aiAnalysis.insights.hubSpokeAnalysis.missingHubTopics && aiAnalysis.insights.hubSpokeAnalysis.missingHubTopics.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Hub Pages (Pillar Content)</h4>
                      <div className="space-y-3">
                        {aiAnalysis.insights.hubSpokeAnalysis.missingHubTopics.map((hub, idx) => (
                          <div key={idx} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="font-medium text-purple-900">{hub.topic}</p>
                            <p className="text-sm text-gray-600 mt-1">{hub.rationale}</p>
                            <p className="text-xs text-purple-700 mt-2">Target keyword: {hub.primaryKeyword}</p>
                            {hub.suggestedSpokes && hub.suggestedSpokes.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-gray-600">Supporting spoke pages ({hub.suggestedSpokes.length}):</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {hub.suggestedSpokes.slice(0, 8).map((spoke, i) => (
                                    <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{spoke}</span>
                                  ))}
                                  {hub.suggestedSpokes.length > 8 && (
                                    <span className="text-xs text-gray-500">+{hub.suggestedSpokes.length - 8} more</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Hub Pages Status */}
                  {aiAnalysis.insights.hubSpokeAnalysis.hubPages && aiAnalysis.insights.hubSpokeAnalysis.hubPages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Hub Pages</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">Topic</th>
                              <th className="px-3 py-2 text-left">Status</th>
                              <th className="px-3 py-2 text-left">Words</th>
                              <th className="px-3 py-2 text-left">Spokes</th>
                              <th className="px-3 py-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aiAnalysis.insights.hubSpokeAnalysis.hubPages.map((hub, idx) => (
                              <tr key={idx} className="border-t">
                                <td className="px-3 py-2">{hub.topic}</td>
                                <td className="px-3 py-2">
                                  <span className={`text-xs px-2 py-0.5 rounded ${
                                    hub.status === 'strong' ? 'bg-green-100 text-green-700' :
                                    hub.status === 'adequate' ? 'bg-yellow-100 text-yellow-700' :
                                    hub.status === 'thin' ? 'bg-orange-100 text-orange-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>{hub.status}</span>
                                </td>
                                <td className="px-3 py-2">{hub.currentWordCount}/{hub.targetWordCount}</td>
                                <td className="px-3 py-2">{hub.spokeCount}/{hub.targetSpokeCount}</td>
                                <td className="px-3 py-2 text-xs text-gray-600">{hub.recommendations?.[0]}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Service Page Strategy */}
              {aiAnalysis.insights?.servicePageStrategy && aiAnalysis.insights.servicePageStrategy.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                    Service Page Recommendations
                    <InfoTooltip text="Specific page specs for each service. Each service page should be 1,500-2,200 words with FAQ section, proper schema, and internal linking." />
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">Detailed specs for service-specific spoke pages</p>
                  <div className="space-y-4">
                    {aiAnalysis.insights.servicePageStrategy.map((page, idx) => (
                      <div key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{page.service}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            page.currentStatus === 'strong' ? 'bg-green-100 text-green-700' :
                            page.currentStatus === 'adequate' ? 'bg-yellow-100 text-yellow-700' :
                            page.currentStatus === 'thin' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>{page.currentStatus}</span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Recommended URL</p>
                            <p className="font-mono text-xs text-blue-700">{page.recommendedUrl}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Word Count</p>
                            <p>{page.currentWordCount} → <span className="font-medium">{page.wordCountTarget}</span> target</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500">Title Tag</p>
                            <p className="text-xs">{page.titleTag}</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-xs text-gray-500">H1</p>
                            <p className="text-xs font-medium">{page.h1}</p>
                          </div>
                          {page.targetKeywords && page.targetKeywords.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-gray-500">Target Keywords</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {page.targetKeywords.map((kw, i) => (
                                  <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{kw}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {page.contentSections && page.contentSections.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-xs text-gray-500">Content Sections</p>
                              <ol className="text-xs text-gray-600 mt-1 list-decimal list-inside">
                                {page.contentSections.map((section, i) => (
                                  <li key={i}>{section}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AEO Strategy */}
              {aiAnalysis.insights?.aeoStrategy && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                    AEO (Answer Engine Optimization)
                    <InfoTooltip text="Entity-First optimization for AI search engines like ChatGPT, Perplexity, and Google SGE. Focuses on making content citable and authoritative." />
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">Entity-first content optimization for AI search visibility</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">AEO Readiness</p>
                      <p className={`text-lg font-bold ${
                        aiAnalysis.insights.aeoStrategy.currentReadiness === 'high' ? 'text-green-600' :
                        aiAnalysis.insights.aeoStrategy.currentReadiness === 'medium' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>{aiAnalysis.insights.aeoStrategy.currentReadiness || 'Unknown'}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Entity-First Score</p>
                      <p className="text-lg font-bold text-blue-600">{aiAnalysis.insights.aeoStrategy.entityFirstScore || 0}/100</p>
                    </div>
                  </div>

                  {/* AEO Compliance Checklist */}
                  {aiAnalysis.insights.aeoStrategy.aeoComplianceChecklist && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Compliance Checklist</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {[
                          { key: 'brandInFirstParagraph', label: 'Brand in first paragraph' },
                          { key: 'twoSameAsReferences', label: '2+ sameAs references' },
                          { key: 'schemaCompatibleFormatting', label: 'Schema-compatible format' },
                          { key: 'authorAttribution', label: 'Author attribution' },
                        ].map(({ key, label }) => (
                          <div key={key} className={`p-2 rounded text-xs ${
                            aiAnalysis.insights.aeoStrategy?.aeoComplianceChecklist?.[key as keyof typeof aiAnalysis.insights.aeoStrategy.aeoComplianceChecklist]
                              ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {aiAnalysis.insights.aeoStrategy?.aeoComplianceChecklist?.[key as keyof typeof aiAnalysis.insights.aeoStrategy.aeoComplianceChecklist] ? '✓' : '✗'} {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQ Opportunities */}
                  {aiAnalysis.insights.aeoStrategy.faqOpportunities && aiAnalysis.insights.aeoStrategy.faqOpportunities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">FAQ Schema Opportunities</h4>
                      <div className="space-y-2">
                        {aiAnalysis.insights.aeoStrategy.faqOpportunities.slice(0, 5).map((faq, idx) => (
                          <div key={idx} className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <p className="font-medium text-sm text-gray-900">Q: {faq.question}</p>
                            <p className="text-xs text-gray-600 mt-1">A: {faq.answer}</p>
                            <p className="text-xs text-indigo-600 mt-1">Target page: {faq.targetPage}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ICP Analysis */}
              {aiAnalysis.insights?.icpAnalysis?.primaryICP && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                    Ideal Client Profile (ICP)
                    <InfoTooltip text="Who the ideal customer is based on service offerings, pricing, location, and competitor analysis. Use this for ad targeting and content messaging." />
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">Target audience analysis based on research data</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Demographics */}
                    {aiAnalysis.insights.icpAnalysis.primaryICP.demographics && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Demographics</h4>
                        <dl className="space-y-1 text-sm">
                          {Object.entries(aiAnalysis.insights.icpAnalysis.primaryICP.demographics).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <dt className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                              <dd className="text-gray-900">{String(val)}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}

                    {/* Pain Points */}
                    {aiAnalysis.insights.icpAnalysis.primaryICP.painPoints && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Pain Points</h4>
                        <ul className="space-y-1 text-sm">
                          {aiAnalysis.insights.icpAnalysis.primaryICP.painPoints.map((point, i) => (
                            <li key={i} className="text-gray-700">• {point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Customer Avatars */}
                  {aiAnalysis.insights.icpAnalysis.avatars && aiAnalysis.insights.icpAnalysis.avatars.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Customer Avatars</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {aiAnalysis.insights.icpAnalysis.avatars.map((avatar, idx) => (
                          <div key={idx} className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                            <h5 className="font-bold text-teal-900">{avatar.name}</h5>
                            <p className="text-sm text-teal-700 italic">{avatar.tagline}</p>
                            {avatar.backgroundStory && (
                              <p className="text-sm text-gray-600 mt-2">{avatar.backgroundStory}</p>
                            )}
                            {avatar.triggerEvent && (
                              <p className="text-xs text-gray-500 mt-2"><strong>Trigger:</strong> {avatar.triggerEvent}</p>
                            )}
                            {avatar.representativeQuote && (
                              <p className="text-sm text-gray-700 mt-2 italic">&quot;{avatar.representativeQuote}&quot;</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Technical SEO */}
              {aiAnalysis.insights?.seoTechnical && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-1 flex items-center">
                    Technical SEO Recommendations
                    <InfoTooltip text="Specific technical SEO improvements including meta templates, robots.txt, llms.txt, and schema markup." />
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    {aiAnalysis.insights.seoTechnical.metaTitleTemplate && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Meta Title Template</p>
                        <p className="text-sm font-mono">{aiAnalysis.insights.seoTechnical.metaTitleTemplate}</p>
                      </div>
                    )}
                    {aiAnalysis.insights.seoTechnical.metaDescriptionTemplate && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Meta Description Template</p>
                        <p className="text-sm font-mono">{aiAnalysis.insights.seoTechnical.metaDescriptionTemplate}</p>
                      </div>
                    )}
                    {aiAnalysis.insights.seoTechnical.llmsTxtRecommendations && (
                      <div className="p-3 bg-gray-50 rounded-lg md:col-span-2">
                        <p className="text-xs text-gray-500">llms.txt Recommendations (for AI crawlers)</p>
                        <p className="text-sm whitespace-pre-wrap">{aiAnalysis.insights.seoTechnical.llmsTxtRecommendations}</p>
                      </div>
                    )}
                    {aiAnalysis.insights.seoTechnical.missingSchemaTypes && aiAnalysis.insights.seoTechnical.missingSchemaTypes.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg md:col-span-2">
                        <p className="text-xs text-gray-500">Missing Schema Types</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {aiAnalysis.insights.seoTechnical.missingSchemaTypes.map((schema, i) => (
                            <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">{schema}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Priority Recommendations */}
              {aiAnalysis.insights?.priorityRecommendations && aiAnalysis.insights.priorityRecommendations.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Priority Action Items</h3>
                  <ul className="space-y-3">
                    {aiAnalysis.insights.priorityRecommendations.map((rec, idx) => (
                      <li key={idx} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <span className="w-7 h-7 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm font-bold mr-3 flex-shrink-0">
                            {rec.priority || idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{rec.action}</p>
                            {rec.rationale && (
                              <p className="text-sm text-gray-600 mt-1">{rec.rationale}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              {rec.category && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{rec.category}</span>
                              )}
                              {rec.expectedImpact && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{rec.expectedImpact}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {/* GBP Overview */}
      {gbp && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold flex items-center">
              <span className="mr-2">Google Business Profile</span>
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{gbp.rating}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <p className="font-medium">{gbp.reviewCount} reviews</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="font-medium">{gbp.categories?.join(', ') || 'N/A'}</p>
              </div>
              {gbp.phone && (
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{gbp.phone}</p>
                </div>
              )}
              {gbp.address && (
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{gbp.address}</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Competitors */}
      {(competitors && competitors.length > 0) || (mapPack && mapPack.length > 0) ? (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Competitor Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">Top competitors in your area (20-mile radius)</p>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Map Pack - Top 3 in Google Search */}
            {mapPack && mapPack.length > 0 && (
              <div>
                <div className="flex items-center mb-3">
                  <span className="text-lg mr-2">📍</span>
                  <h3 className="font-medium text-gray-900">Google Map Pack (Local 3-Pack)</h3>
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Top Rankings</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">These businesses appear in Google&apos;s local search results</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {mapPack.map((mp, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex w-7 h-7 items-center justify-center bg-green-500 text-white rounded-full text-sm font-bold">
                          #{mp.rank}
                        </span>
                        {mp.rating > 0 && (
                          <span className="inline-flex items-center text-sm">
                            <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {mp.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{mp.name}</p>
                      {mp.reviewCount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">{mp.reviewCount} reviews</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Competitors by Prominence */}
            {competitors && competitors.length > 0 && (
              <div>
                <div className="flex items-center mb-3">
                  <span className="text-lg mr-2">🏆</span>
                  <h3 className="font-medium text-gray-900">Top Competitors by Prominence</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">Ranked by overall market presence (rating + review volume)</p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3 pr-4">Rank</th>
                        <th className="pb-3 pr-4">Business</th>
                        <th className="pb-3 pr-4">Rating</th>
                        <th className="pb-3 pr-4">Reviews</th>
                        <th className="pb-3">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {competitors.map((competitor, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-3 pr-4">
                            <span className="inline-flex w-6 h-6 items-center justify-center bg-gray-100 rounded-full text-sm font-medium">
                              {competitor.rank}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-medium">{competitor.name}</td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex items-center">
                              <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {competitor.rating.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 pr-4">{competitor.reviewCount}</td>
                          <td className="py-3">
                            {competitor.prominenceScore ? (
                              <span className="text-sm text-gray-600">{competitor.prominenceScore.toFixed(1)}</span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Your Position */}
            {gbp && competitors && competitors.length > 0 && (() => {
              // Calculate prominence score: rating × sqrt(reviews)
              const yourScore = gbp.rating * Math.sqrt(gbp.reviewCount);
              const topScore = competitors[0]?.prominenceScore || (competitors[0]?.rating * Math.sqrt(competitors[0]?.reviewCount));
              const yourRank = competitors.filter(c => (c.prominenceScore || 0) > yourScore).length + 1;
              const totalCompetitors = competitors.length;

              return (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800">
                        <strong>Your position:</strong> Rating {gbp.rating} with {gbp.reviewCount} reviews
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Prominence score: {yourScore.toFixed(1)} (rating × √reviews)
                      </p>
                    </div>
                    <div className="text-right">
                      {yourScore >= topScore ? (
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          #1 Market Leader
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                            #{yourRank} of {totalCompetitors + 1}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {((topScore - yourScore) / topScore * 100).toFixed(0)}% behind leader
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardBody>
        </Card>
      ) : null}

      {/* SEO Scores */}
      {seoAudit && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">SEO Performance</h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <ScoreCircle score={seoAudit.score} label="Overall" size="lg" />
              <ScoreCircle score={seoAudit.mobile.score} label="Mobile" />
              <ScoreCircle score={seoAudit.performance.score} label="Performance" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Technical SEO */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Technical SEO</h3>
                <div className="space-y-2">
                  {[
                    { label: 'SSL Certificate', value: seoAudit.technical.ssl },
                    { label: 'Canonical Tags', value: seoAudit.technical.canonicalTag },
                    { label: 'Robots.txt', value: seoAudit.technical.robotsTxt },
                    { label: 'XML Sitemap', value: seoAudit.technical.sitemap },
                    { label: 'Meta Description', value: seoAudit.technical.metaDescription },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className={item.value ? 'text-green-500' : 'text-red-500'}>
                        {item.value ? 'Pass' : 'Fail'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Core Web Vitals</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">LCP (Largest Contentful Paint)</span>
                    <span className={seoAudit.performance.lcp < 2500 ? 'text-green-500' : 'text-amber-500'}>
                      {(seoAudit.performance.lcp / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">FID (First Input Delay)</span>
                    <span className={seoAudit.performance.fid < 100 ? 'text-green-500' : 'text-amber-500'}>
                      {seoAudit.performance.fid}ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">CLS (Cumulative Layout Shift)</span>
                    <span className={seoAudit.performance.cls < 0.1 ? 'text-green-500' : 'text-amber-500'}>
                      {seoAudit.performance.cls.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">TTFB (Time to First Byte)</span>
                    <span className={seoAudit.performance.ttfb < 800 ? 'text-green-500' : 'text-amber-500'}>
                      {seoAudit.performance.ttfb}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Website & Sitemap */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Website Info */}
        {websiteCrawl && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Website Technical</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">CMS</p>
                  <p className="font-medium">{websiteCrawl.cms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">SSL</p>
                  <p className={`font-medium ${websiteCrawl.ssl ? 'text-green-600' : 'text-red-600'}`}>
                    {websiteCrawl.ssl ? 'Secure' : 'Not Secure'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Mobile Responsive</p>
                  <p className={`font-medium ${websiteCrawl.mobileResponsive ? 'text-green-600' : 'text-red-600'}`}>
                    {websiteCrawl.mobileResponsive ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Structured Data</p>
                  <p className={`font-medium ${websiteCrawl.structuredData ? 'text-green-600' : 'text-red-600'}`}>
                    {websiteCrawl.structuredData ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              {websiteCrawl.technologies && websiteCrawl.technologies.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Technologies</p>
                  <div className="flex flex-wrap gap-2">
                    {websiteCrawl.technologies.map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {websiteCrawl.schemaTypes && websiteCrawl.schemaTypes.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Schema Types</p>
                  <div className="flex flex-wrap gap-2">
                    {websiteCrawl.schemaTypes.map((schema) => (
                      <span key={schema} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {schema}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Page limit reached banner + Full Scrape button */}
              {websiteCrawl.pageLimitReached && !isFullScrapeLoading && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Showing first 300 of {websiteCrawl.totalPages || 300}+ pages. Run Full Scrape to analyze all pages.
                  </p>
                  <Button
                    onClick={runFullScrape}
                    disabled={isFullScrapeLoading}
                    className="mt-3"
                  >
                    Full Scrape
                  </Button>
                  {fullScrapeError && (
                    <p className="text-red-500 text-sm mt-2">{fullScrapeError}</p>
                  )}
                </div>
              )}
              {isFullScrapeLoading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                  <p className="text-sm text-blue-800">Crawling all pages... This may take 5-15 minutes.</p>
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Sitemap Analysis */}
        {sitemap && (() => {
          // Use AI analysis data for page categorization when available
          const aiWebsite = aiAnalysis?.categories?.websiteReadiness;
          const hasServicePages = aiWebsite?.hasServicePages?.value ?? sitemap.hasServicePages ?? false;
          const servicePageCount = aiWebsite?.servicePageCount?.value ?? sitemap.pageTypes?.services ?? 0;
          const hasBlog = aiWebsite?.hasBlogSection?.value ?? sitemap.hasBlog ?? false;
          const blogPostCount = aiWebsite?.blogPostCount?.value ?? sitemap.pageTypes?.blog ?? 0;
          const hasLocationPages = aiWebsite?.hasLocationPages?.value ?? sitemap.hasLocationPages ?? false;
          const locationPageCount = aiWebsite?.locationPageCount?.value ?? sitemap.pageTypes?.locations ?? 0;
          const totalPages = aiWebsite?.pageCount?.value ?? sitemap.totalPages ?? 0;
          const isAiCategorized = !!aiWebsite;
          const crawlLimitReached = websiteCrawl?.pageLimitReached ?? false;

          return (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Site Structure</h2>
                  {!isAiCategorized && sitemap.urls && sitemap.urls.length > 0 && (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      Run AI Analysis for detailed categorization
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard value={crawlLimitReached ? `${totalPages}+` : totalPages} label={crawlLimitReached ? 'Pages (limited)' : 'Total Pages'} icon="📄" />
                  <StatCard value={servicePageCount || 0} label="Service Pages" icon="🔧" />
                  <StatCard value={blogPostCount || 0} label="Blog Posts" icon="📝" />
                  <StatCard value={locationPageCount || 0} label="Location Pages" icon="📍" />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Has Service Pages</span>
                    <span className={hasServicePages ? 'text-green-500' : 'text-red-500'}>
                      {hasServicePages ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Has Blog</span>
                    <span className={hasBlog ? 'text-green-500' : 'text-amber-500'}>
                      {hasBlog ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Has Location Pages</span>
                    <span className={hasLocationPages ? 'text-green-500' : 'text-gray-400'}>
                      {hasLocationPages ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                {crawlLimitReached && (
                  <p className="text-xs text-amber-600 mt-3 text-center">
                    Page count limited to first 300 crawled pages. Use Full Scrape in Website Technical for complete data.
                  </p>
                )}
                {isAiCategorized && (
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    Page types categorized by AI analysis
                  </p>
                )}
              </CardBody>
            </Card>
          );
        })()}
      </div>

      {/* Citations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Citation Check</h2>
              <p className="text-sm text-gray-500 mt-1">Business directory listings and NAP consistency</p>
            </div>
            {citations && citations.length > 0 && citationSummary && (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{citationSummary.napConsistencyScore}%</div>
                <div className="text-xs text-gray-500">NAP Consistency</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody>
          {/* No citations yet - show run button */}
          {(!citations || citations.length === 0) && !isCitationLoading && (
            <div className="text-center py-8">
              {gbp ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Check your business listings across 36+ directories for NAP (Name, Address, Phone) consistency.
                  </p>
                  <Button onClick={runCitationCheck} disabled={isCitationLoading}>
                    Run Citation Check
                  </Button>
                  {citationError && (
                    <p className="text-red-500 text-sm mt-3">{citationError}</p>
                  )}
                </>
              ) : (
                <p className="text-amber-600">
                  Google Business Profile data is required to run citation check.
                </p>
              )}
            </div>
          )}

          {/* Loading state */}
          {isCitationLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Checking 36+ business directories...</p>
              <p className="text-sm text-gray-400 mt-2">This may take 1-2 minutes</p>
            </div>
          )}

          {/* Results */}
          {citations && citations.length > 0 && !isCitationLoading && (
            <>
              {/* Summary stats */}
              {citationSummary && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-semibold">{citationSummary.totalChecked}</div>
                    <div className="text-xs text-gray-500">Directories Checked</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-semibold text-green-600">{citationSummary.found}</div>
                    <div className="text-xs text-gray-500">Listings Found</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-xl font-semibold text-amber-600">{citationSummary.withIssues}</div>
                    <div className="text-xs text-gray-500">With Issues</div>
                  </div>
                </div>
              )}

              {/* Citation grid */}
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {citations.map((citation, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      citation.found
                        ? citation.napConsistent
                          ? 'bg-green-50 border-green-200'
                          : 'bg-amber-50 border-amber-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{citation.source}</span>
                      {citation.found ? (
                        citation.napConsistent ? (
                          <span className="text-green-600 text-sm">Consistent</span>
                        ) : (
                          <span className="text-amber-600 text-sm">Inconsistent</span>
                        )
                      ) : (
                        <span className="text-gray-400 text-sm">Not Found</span>
                      )}
                    </div>
                    {citation.url && (
                      <a
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline mt-1 block truncate"
                      >
                        View listing
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Recommendations */}
              {citationSummary?.recommendations && citationSummary.recommendations.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {citationSummary.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4 pt-4">
        <Button onClick={() => router.push('/research')} variant="outline">
          Start New Research
        </Button>
        <Button onClick={() => window.print()}>
          Export Report
        </Button>
      </div>
    </div>
  );
}
