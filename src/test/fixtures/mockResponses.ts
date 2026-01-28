/**
 * Mock API Responses for Testing
 *
 * Contains realistic mock data for Claude API responses and research data
 */

import type { AIAnalysisInput } from '@/types/ai-analysis';

/**
 * Mock successful Claude API response
 */
export const mockClaudeSuccessResponse = {
  id: 'msg_01XFDUDYJgAACzvnptvVoYEL',
  type: 'message' as const,
  role: 'assistant' as const,
  content: [
    {
      type: 'text' as const,
      text: JSON.stringify({
        categories: {
          businessContext: {
            companyName: {
              value: 'Test Business',
              source: 'userInput',
              confidence: 1.0,
              reasoning: 'Direct from user input',
            },
            yearsInBusiness: {
              value: 10,
              source: 'gbp',
              confidence: 0.8,
              reasoning: 'Inferred from GBP data',
            },
            teamSize: {
              value: '6-10',
              source: 'ai',
              confidence: 0.5,
              reasoning: 'Estimated from website content',
            },
            primaryIndustry: {
              value: 'Home Services',
              source: 'gbp',
              confidence: 0.9,
              reasoning: 'From GBP category',
            },
            businessDescription: {
              value: 'Professional home inspection services',
              source: 'websiteCrawl',
              confidence: 0.85,
              reasoning: 'From homepage content',
            },
            uniqueSellingPoints: {
              value: ['Same-day reports', 'Licensed inspectors'],
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Identified from website',
            },
            targetAudience: {
              value: 'Homebuyers and sellers',
              source: 'ai',
              confidence: 0.8,
              reasoning: 'Standard for industry',
            },
            competitiveAdvantages: {
              value: ['Fast turnaround', 'Comprehensive reports'],
              source: 'ai',
              confidence: 0.6,
              reasoning: 'From competitor comparison',
            },
            businessModel: {
              value: 'B2C',
              source: 'ai',
              confidence: 0.95,
              reasoning: 'Direct to consumer service',
            },
            seasonality: {
              value: 'Spring and summer peak',
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Typical for real estate related services',
            },
          },
          revenueServices: {
            primaryServices: {
              value: ['Home Inspection', 'Radon Testing'],
              source: 'websiteCrawl',
              confidence: 0.9,
              reasoning: 'Listed on services page',
            },
            secondaryServices: {
              value: ['Mold Testing', 'Termite Inspection'],
              source: 'websiteCrawl',
              confidence: 0.8,
              reasoning: 'Found in service list',
            },
            serviceDeliveryMethod: {
              value: ['On-site'],
              source: 'ai',
              confidence: 0.95,
              reasoning: 'Inspection services are on-site',
            },
            averageTransactionValue: {
              value: '$350-500',
              source: 'ai',
              confidence: 0.6,
              reasoning: 'Industry average estimate',
            },
            pricingModel: {
              value: 'Fixed',
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Typical for inspection services',
            },
            topRevenueServices: {
              value: ['Home Inspection'],
              source: 'ai',
              confidence: 0.8,
              reasoning: 'Primary service offering',
            },
            serviceAreaType: {
              value: 'Local',
              source: 'gbp',
              confidence: 0.9,
              reasoning: 'From GBP service area',
            },
            serviceRadius: {
              value: '25 miles',
              source: 'ai',
              confidence: 0.5,
              reasoning: 'Estimated from service area',
            },
            clientRetentionRate: {
              value: null,
              source: 'ai',
              confidence: 0.1,
              reasoning: 'Unable to determine',
            },
            referralPercentage: {
              value: null,
              source: 'ai',
              confidence: 0.1,
              reasoning: 'Unable to determine',
            },
            upsellOpportunities: {
              value: ['Radon mitigation referral'],
              source: 'ai',
              confidence: 0.6,
              reasoning: 'Common upsell in industry',
            },
            recurringRevenueServices: {
              value: [],
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Inspection is typically one-time',
            },
          },
          localSEO: {
            gbpStatus: {
              value: 'claimed',
              source: 'gbp',
              confidence: 1.0,
              reasoning: 'GBP data found',
            },
            gbpCompleteness: {
              value: 75,
              source: 'gbp',
              confidence: 0.9,
              reasoning: 'Calculated from GBP fields',
            },
            gbpRating: {
              value: 4.8,
              source: 'gbp',
              confidence: 1.0,
              reasoning: 'Direct from GBP',
            },
            gbpReviewCount: {
              value: 47,
              source: 'gbp',
              confidence: 1.0,
              reasoning: 'Direct from GBP',
            },
            gbpCategories: {
              value: ['Home Inspector'],
              source: 'gbp',
              confidence: 1.0,
              reasoning: 'Direct from GBP',
            },
            gbpPhotosCount: {
              value: 15,
              source: 'gbp',
              confidence: 1.0,
              reasoning: 'Direct from GBP',
            },
            primaryServiceArea: {
              value: 'Denver, CO',
              source: 'userInput',
              confidence: 1.0,
              reasoning: 'From user input',
            },
            serviceAreas: {
              value: ['Denver', 'Aurora', 'Lakewood'],
              source: 'gbp',
              confidence: 0.8,
              reasoning: 'From GBP service area',
            },
            napConsistency: {
              value: 80,
              source: 'ai',
              confidence: 0.5,
              reasoning: 'Estimated from available data',
            },
            citationScore: {
              value: null,
              source: 'ai',
              confidence: 0.1,
              reasoning: 'No citation data available',
            },
          },
          websiteReadiness: {
            websiteUrl: {
              value: 'https://testbusiness.com',
              source: 'userInput',
              confidence: 1.0,
              reasoning: 'From user input',
            },
            cms: {
              value: 'WordPress',
              source: 'websiteCrawl',
              confidence: 0.8,
              reasoning: 'Detected from meta tags',
            },
            hasSsl: {
              value: true,
              source: 'websiteCrawl',
              confidence: 1.0,
              reasoning: 'HTTPS protocol',
            },
            isMobileResponsive: {
              value: true,
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Modern template detected',
            },
            hasStructuredData: {
              value: true,
              source: 'websiteCrawl',
              confidence: 0.9,
              reasoning: 'Schema found on pages',
            },
            schemaTypes: {
              value: ['LocalBusiness'],
              source: 'websiteCrawl',
              confidence: 0.9,
              reasoning: 'Detected in HTML',
            },
            pageCount: {
              value: 12,
              source: 'sitemap',
              confidence: 0.95,
              reasoning: 'From sitemap count',
            },
            hasServicePages: {
              value: true,
              source: 'sitemap',
              confidence: 0.9,
              reasoning: 'Service URLs in sitemap',
            },
            servicePageCount: {
              value: 4,
              source: 'sitemap',
              confidence: 0.8,
              reasoning: 'Counted service URLs',
            },
            hasBlogSection: {
              value: false,
              source: 'sitemap',
              confidence: 0.9,
              reasoning: 'No blog URLs found',
            },
            hasLocationPages: {
              value: false,
              source: 'sitemap',
              confidence: 0.9,
              reasoning: 'No location-specific URLs',
            },
            locationPageCount: {
              value: 0,
              source: 'sitemap',
              confidence: 0.9,
              reasoning: 'None found',
            },
            hasHubPages: {
              value: false,
              source: 'ai',
              confidence: 0.7,
              reasoning: 'No comprehensive pillar content detected',
            },
            hubPageCount: {
              value: 0,
              source: 'ai',
              confidence: 0.7,
              reasoning: 'None detected',
            },
            averagePageWordCount: {
              value: 'Thin (<1000)',
              source: 'websiteCrawl',
              confidence: 0.8,
              reasoning: 'Content analysis shows short pages',
            },
            hasRobotsTxt: {
              value: true,
              source: 'websiteCrawl',
              confidence: 1.0,
              reasoning: 'robots.txt found',
            },
            hasLlmsTxt: {
              value: false,
              source: 'websiteCrawl',
              confidence: 1.0,
              reasoning: 'No llms.txt found',
            },
            loadSpeed: {
              value: 'Average',
              source: 'ai',
              confidence: 0.5,
              reasoning: 'Estimated from content size',
            },
            seoScore: {
              value: 65,
              source: 'ai',
              confidence: 0.6,
              reasoning: 'Based on technical factors',
            },
            contentDepthScore: {
              value: 35,
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Thin content detected',
            },
          },
          toneVoice: {
            brandTone: {
              value: 'Professional',
              source: 'websiteCrawl',
              confidence: 0.8,
              reasoning: 'Content analysis',
            },
            writingStyle: {
              value: 'Conversational',
              source: 'websiteCrawl',
              confidence: 0.7,
              reasoning: 'Website copy style',
            },
            keyMessaging: {
              value: ['Quality inspections', 'Peace of mind'],
              source: 'websiteCrawl',
              confidence: 0.7,
              reasoning: 'From homepage content',
            },
            brandPersonality: {
              value: ['Trustworthy', 'Thorough'],
              source: 'ai',
              confidence: 0.6,
              reasoning: 'Inferred from content',
            },
            targetEmotions: {
              value: ['Confidence', 'Security'],
              source: 'ai',
              confidence: 0.6,
              reasoning: 'Typical for industry',
            },
            communicationStyle: {
              value: 'Educational',
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Content explains processes',
            },
            industryJargonLevel: {
              value: 'Moderate',
              source: 'websiteCrawl',
              confidence: 0.7,
              reasoning: 'Some technical terms used',
            },
            callToActionStyle: {
              value: 'Value-focused',
              source: 'websiteCrawl',
              confidence: 0.7,
              reasoning: 'CTAs emphasize benefits',
            },
          },
          conversionMeasurement: {
            primaryConversionGoal: {
              value: 'Phone calls',
              source: 'ai',
              confidence: 0.8,
              reasoning: 'Common for local services',
            },
            secondaryConversionGoals: {
              value: ['Form submissions'],
              source: 'websiteCrawl',
              confidence: 0.7,
              reasoning: 'Contact form found',
            },
            currentTrackingSetup: {
              value: ['Google Analytics'],
              source: 'websiteCrawl',
              confidence: 0.8,
              reasoning: 'GA script detected',
            },
            phoneTrackingStatus: {
              value: false,
              source: 'ai',
              confidence: 0.5,
              reasoning: 'No tracking numbers detected',
            },
            formTrackingStatus: {
              value: null,
              source: 'ai',
              confidence: 0.3,
              reasoning: 'Unable to determine',
            },
            currentLeadVolume: {
              value: null,
              source: 'ai',
              confidence: 0.1,
              reasoning: 'Unable to determine',
            },
            conversionRate: {
              value: null,
              source: 'ai',
              confidence: 0.1,
              reasoning: 'Unable to determine',
            },
            customerJourneyLength: {
              value: '1-7 days',
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Typical for home buying process',
            },
          },
          aiConsiderations: {
            aiSearchVisibility: {
              value: 'Low',
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Thin content limits AI visibility',
            },
            contentDepth: {
              value: 'Basic',
              source: 'websiteCrawl',
              confidence: 0.8,
              reasoning: 'Short pages with minimal detail',
            },
            expertiseSignals: {
              value: ['Licensed inspectors'],
              source: 'websiteCrawl',
              confidence: 0.7,
              reasoning: 'Found on about page',
            },
            trustSignals: {
              value: ['Reviews mentioned'],
              source: 'websiteCrawl',
              confidence: 0.6,
              reasoning: 'Review badges found',
            },
            authorshipClarity: {
              value: false,
              source: 'websiteCrawl',
              confidence: 0.9,
              reasoning: 'No author attribution',
            },
            contentFreshness: {
              value: 'Unknown',
              source: 'ai',
              confidence: 0.4,
              reasoning: 'No dates visible',
            },
            citationWorthiness: {
              value: 'Low',
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Lacking unique data/insights',
            },
            llmReadinessScore: {
              value: 35,
              source: 'ai',
              confidence: 0.6,
              reasoning: 'Multiple factors lacking',
            },
            entityFirstScore: {
              value: 25,
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Missing entity-first formatting',
            },
            hasSameAsReferences: {
              value: false,
              source: 'websiteCrawl',
              confidence: 0.9,
              reasoning: 'No sameAs links found',
            },
            sameAsPlatforms: {
              value: [],
              source: 'websiteCrawl',
              confidence: 0.9,
              reasoning: 'None detected',
            },
            hasAuthorBio: {
              value: false,
              source: 'websiteCrawl',
              confidence: 0.9,
              reasoning: 'No author bios found',
            },
            hasCredentials: {
              value: true,
              source: 'websiteCrawl',
              confidence: 0.7,
              reasoning: 'License mentioned',
            },
            aeoComplianceScore: {
              value: 20,
              source: 'ai',
              confidence: 0.7,
              reasoning: 'Missing most AEO requirements',
            },
            hubSpokeScore: {
              value: 15,
              source: 'ai',
              confidence: 0.7,
              reasoning: 'No hub-spoke architecture',
            },
          },
        },
        insights: {
          contentGaps: [
            {
              gap: 'No comprehensive hub page for home inspection services',
              priority: 'high',
              action: 'Create 3,000-5,000 word pillar page covering all inspection types',
              category: 'Hub Page',
              targetKeyword: 'home inspection denver',
              estimatedImpact: 'Improved topical authority',
              wordCountTarget: 4000,
            },
          ],
          competitiveInsights: [],
          competitorComparison: {
            clientProfile: {
              name: 'Test Business',
              website: 'https://testbusiness.com',
              gbpRating: 4.8,
              gbpReviewCount: 47,
              gbpPhotosCount: 15,
              gbpCategories: ['Home Inspector'],
              gbpResponseRate: 'Unknown',
              estimatedPageCount: 12,
              hasServicePages: true,
              servicePageCount: 4,
              hasBlogSection: false,
              blogPostCount: 0,
              hasLocationPages: false,
              contentDepthAssessment: 'thin',
              hasSsl: true,
              hasSchema: true,
              schemaTypes: ['LocalBusiness'],
              primaryServices: ['Home Inspection'],
              uniqueValueProps: ['Same-day reports'],
              pricingIndicators: '$$',
              targetAudience: 'Homebuyers',
              strengths: ['Good reviews', 'Licensed'],
              weaknesses: ['Thin content', 'No blog'],
            },
            competitors: [],
            gbpComparison: {
              clientRank: 1,
              averageCompetitorRating: 0,
              reviewCountComparison: 'above',
              photoCountComparison: 'above',
              recommendations: ['Add more photos', 'Respond to all reviews'],
            },
            contentComparison: {
              clientContentScore: 35,
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
              clientSchemaGaps: ['FAQPage', 'Service'],
            },
            overallPosition: 'challenger',
            competitiveAdvantages: ['Strong GBP rating'],
            competitiveDisadvantages: ['Thin content'],
            marketOpportunities: ['Create comprehensive content'],
          },
          icpAnalysis: {
            primaryICP: {
              demographics: {
                ageRange: '30-50',
                gender: 'All',
                incomeLevel: 'Middle to Upper-Middle',
                homeownership: 'Prospective homeowners',
                familyStatus: 'Families',
                location: 'Denver metro area',
              },
              psychographics: {
                values: ['Quality', 'Thoroughness'],
                lifestyle: 'Busy professional',
                buyingMotivation: 'Peace of mind',
                decisionStyle: 'Research-heavy',
              },
              painPoints: ['Fear of hidden issues', 'Need fast turnaround'],
              needs: ['Detailed report', 'Expert guidance'],
              objections: ['Cost concerns'],
              buyingBehavior: {
                researchSources: ['Google', 'Reviews'],
                decisionTimeframe: '1-7 days',
                decisionInfluencers: ['Real estate agent'],
                priceWeight: 'secondary',
                qualityExpectations: 'Thorough inspection',
              },
              marketingChannels: {
                primary: ['Google Search'],
                secondary: ['Facebook'],
                messagingThemes: ['Expert', 'Thorough'],
              },
              confidence: 0.7,
              reasoning: 'Based on industry standards',
            },
            secondaryICPs: [],
            avatars: [],
            marketInsights: {
              estimatedMarketSize: 'Medium local market',
              competitionLevel: 'medium',
              growthTrend: 'stable',
              seasonalPatterns: ['Spring peak'],
            },
            targetingRecommendations: ['Target home buyers'],
            messagingRecommendations: ['Emphasize expertise'],
            channelRecommendations: ['Focus on Google'],
          },
          serpGapAnalysis: {
            overallOpportunityScore: 60,
            marketSaturation: 'medium',
            quickWinCount: 3,
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
              action: 'Add FAQPage schema to service pages',
              impact: 'medium',
              effort: 'easy',
              category: 'Schema',
              timeframe: 'This week',
              implementation: 'Add FAQ section and schema markup',
            },
          ],
          seoTechnical: {
            metaTitleTemplate: '[Service] in Denver, CO | Test Business',
            metaDescriptionTemplate: 'Professional [service] in Denver. [Value prop]. Call for a free quote.',
            robotsTxtStatus: 'found',
            robotsTxtRecommendations: [],
            llmsTxtStatus: 'missing',
            llmsTxtRecommendations: 'Create llms.txt with business info',
            missingSchemaTypes: ['FAQPage', 'Service'],
            canonicalIssues: [],
          },
          aeoStrategy: {
            currentReadiness: 'low',
            entityFirstScore: 25,
            entityAssessment: {
              brandNameInFirstParagraph: false,
              authorAttribution: false,
              sameAsReferences: [],
              missingSameAs: ['LinkedIn', 'Facebook'],
              redundantEntityMentions: false,
              expertiseSignalsFound: ['Licensed'],
              authoritySignalsMissing: ['Credentials display'],
            },
            schemaReadiness: {
              faqSchemaPresent: false,
              howToSchemaPresent: false,
              localBusinessSchemaComplete: true,
              articleSchemaPresent: false,
              missingSchemaOpportunities: ['FAQPage', 'HowTo'],
            },
            faqOpportunities: [],
            speakableContent: [],
            citableStatements: [],
            contentStructureRecommendations: ['Add FAQ sections'],
            aeoComplianceChecklist: {
              brandInFirstParagraph: false,
              twoSameAsReferences: false,
              schemaCompatibleFormatting: false,
              authorAttribution: false,
              redundantEntityMentions: false,
              internalTopicClusterLinks: false,
              backedClaimsWithCitations: false,
              h1WithPrimaryTopic: true,
              dateModifiedVisible: false,
              overallScore: 20,
              recommendations: ['Add entity-first formatting'],
            },
          },
          hubSpokeAnalysis: {
            overallScore: 15,
            hasHubPages: false,
            hubPages: [],
            spokePages: [],
            missingHubTopics: [],
            internalLinkingScore: 30,
            internalLinkingIssues: ['No hub-spoke structure'],
            contentJourneyCoverage: {
              awareness: 'weak',
              consideration: 'weak',
              decision: 'adequate',
              gaps: ['Educational content needed'],
            },
          },
          servicePageStrategy: [],
          locationPageStrategy: [],
          priorityRecommendations: [
            {
              priority: 1,
              action: 'Create comprehensive hub content',
              category: 'Hub Content',
              rationale: 'Foundation for content strategy',
              expectedImpact: 'Improved rankings',
            },
          ],
          riskFactors: [
            {
              risk: 'Thin content limits rankings',
              severity: 'high',
              mitigation: 'Create comprehensive content',
            },
          ],
        },
        dataQualityScore: 65,
        warnings: [],
      }),
    },
  ],
  model: 'claude-sonnet-4-20250514',
  stop_reason: 'end_turn' as const,
  stop_sequence: null,
  usage: {
    input_tokens: 15000,
    output_tokens: 4500,
  },
};

/**
 * Mock rate limited response
 */
export const mockRateLimitedResponse = {
  type: 'error',
  error: {
    type: 'rate_limit_error',
    message: 'Rate limit exceeded. Please retry after 60 seconds.',
  },
};

/**
 * Mock server error response
 */
export const mockServerErrorResponse = {
  type: 'error',
  error: {
    type: 'server_error',
    message: 'Internal server error',
  },
};

/**
 * Mock invalid request response
 */
export const mockInvalidRequestResponse = {
  type: 'error',
  error: {
    type: 'invalid_request_error',
    message: 'Invalid API key',
  },
};

/**
 * Mock AI analysis input data
 */
export const mockAnalysisInput: AIAnalysisInput = {
  sessionId: 'test-session-123',
  businessName: 'Test Business',
  website: 'https://testbusiness.com',
  city: 'Denver',
  state: 'CO',
  industry: 'Home Services',
  gbp: {
    name: 'Test Business',
    rating: 4.8,
    reviewCount: 47,
    address: '123 Main St, Denver, CO 80202',
    phone: '(303) 555-1234',
    categories: ['Home Inspector'],
    photos: 15,
    businessStatus: 'OPERATIONAL',
  },
  sitemap: {
    urls: [
      'https://testbusiness.com/',
      'https://testbusiness.com/services/',
      'https://testbusiness.com/about/',
      'https://testbusiness.com/contact/',
    ],
    totalUrls: 4,
  },
  websiteCrawl: {
    pages: [
      {
        url: 'https://testbusiness.com/',
        title: 'Test Business - Home Inspections Denver',
        description: 'Professional home inspection services in Denver',
        wordCount: 450,
      },
    ],
    totalPages: 4,
    hasSchema: true,
    schemaTypes: ['LocalBusiness'],
  },
  competitors: [
    {
      name: 'Competitor A',
      rating: 4.5,
      reviewCount: 32,
    },
  ],
};

/**
 * Mock research results for canAnalyze tests
 */
export const mockCompleteResearchResults = {
  gbp: { name: 'Test Business', rating: 4.8 },
  websiteCrawl: { pages: [], totalPages: 5 },
  sitemap: { urls: [], totalUrls: 10 },
  competitors: [],
};

export const mockPartialResearchResults = {
  gbp: { name: 'Test Business' },
};

export const mockEmptyResearchResults = {};
