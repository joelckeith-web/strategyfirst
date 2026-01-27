'use client';

import { IntakeData } from '@/lib/types/intake';
import { ClientOverview } from './ClientOverview';
import { SEOScorecard } from './SEOScorecard';
import { GBPAudit } from './GBPAudit';
import { CompetitorCards } from './CompetitorCards';
import { ActionItems, generateActionItems, ActionItem } from './ActionItems';

// GBP metrics type for the dashboard
interface GbpMetrics {
  name: string;
  rating: number;
  totalReviews: number;
  recentReviews: number;
  responseRate: number;
  hasWebsite: boolean;
  hasPhone: boolean;
  hasAddress: boolean;
  photoCount: number;
  hasOpeningHours: boolean;
  categories: string[];
  url?: string;
  website?: string;
  phone?: string;
  address?: string;
}

interface AnalysisDashboardProps {
  intake: IntakeData;
  analysisResults?: {
    gbp?: {
      place?: unknown; // Original place data, optional
      metrics: GbpMetrics;
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
  };
}

export function AnalysisDashboard({ intake, analysisResults }: AnalysisDashboardProps) {
  const gbpMetrics = analysisResults?.gbp?.metrics;
  const competitors = analysisResults?.competitors || [];
  const seoMetrics = analysisResults?.seo;
  const sitemapAnalysis = analysisResults?.sitemap;

  // Generate action items based on analysis
  const actionItems: ActionItem[] = generateActionItems({
    gbpMetrics: gbpMetrics ? {
      rating: gbpMetrics.rating,
      totalReviews: gbpMetrics.totalReviews,
      responseRate: gbpMetrics.responseRate,
      photoCount: gbpMetrics.photoCount,
    } : undefined,
    seoMetrics,
    sitemapAnalysis,
    intake: { aiConsiderations: intake.aiConsiderations },
  });

  return (
    <div className="space-y-8">
      {/* Client Overview */}
      <ClientOverview
        intake={intake}
        metrics={{
          domainAuthority: seoMetrics?.domainAuthority,
          gbpRating: gbpMetrics?.rating || intake.localSEO.currentGoogleRating,
          totalReviews: gbpMetrics?.totalReviews || intake.localSEO.totalReviews,
          totalPages: sitemapAnalysis?.totalPages,
        }}
      />

      {/* Competitors Section */}
      {competitors.length > 0 && (
        <CompetitorCards
          competitors={competitors}
          clientRating={gbpMetrics?.rating || intake.localSEO.currentGoogleRating}
          clientReviews={gbpMetrics?.totalReviews || intake.localSEO.totalReviews}
        />
      )}

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* GBP Audit */}
        {gbpMetrics && (
          <GBPAudit metrics={gbpMetrics} />
        )}

        {/* SEO Scorecard */}
        {seoMetrics && (
          <SEOScorecard
            metrics={{
              domainAuthority: seoMetrics.domainAuthority,
              pageAuthority: seoMetrics.pageAuthority,
              mobileScore: seoMetrics.mobileScore,
              pageSpeedDesktop: seoMetrics.pageSpeedDesktop,
              pageSpeedMobile: seoMetrics.pageSpeedMobile,
              contentScore: seoMetrics.contentScore,
              structuredDataScore: seoMetrics.structuredDataScore,
            }}
          />
        )}
      </div>

      {/* Website Structure Summary */}
      {sitemapAnalysis && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">{sitemapAnalysis.totalPages}</p>
            <p className="text-sm text-gray-500">Total Pages</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {sitemapAnalysis.pageTypes.services || 0}
            </p>
            <p className="text-sm text-gray-500">Service Pages</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {sitemapAnalysis.pageTypes.blog || 0}
            </p>
            <p className="text-sm text-gray-500">Blog Posts</p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {sitemapAnalysis.pageTypes.locations || 0}
            </p>
            <p className="text-sm text-gray-500">Location Pages</p>
          </div>
        </div>
      )}

      {/* Action Items */}
      <ActionItems items={actionItems} />
    </div>
  );
}
