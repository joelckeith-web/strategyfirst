'use client';

import { AnalysisResult } from '@/lib/types';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { CompetitorCard } from './CompetitorCard';
import { MetricsCard, MetricItem, ScoreBadge } from './MetricsDisplay';
import { getIndustryLabel, formatNumber } from '@/lib/utils/helpers';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
}

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const { client, competitors, serp, seo, gbp, localSeo } = analysis;

  return (
    <div className="space-y-8">
      {/* Client Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{client.name}</h2>
              <p className="text-gray-500 mt-1">
                {client.address.city}, {client.address.state} | {getIndustryLabel(client.industry)}
              </p>
            </div>
            <div className="flex gap-4">
              <ScoreBadge score={seo.domainAuthority} label="Domain Authority" size="sm" />
              <ScoreBadge score={gbp.profileCompleteness} label="GBP Score" size="sm" />
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{gbp.rating.toFixed(1)}</p>
              <p className="text-sm text-gray-500">Rating</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(gbp.reviewCount)}</p>
              <p className="text-sm text-gray-500">Reviews</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{localSeo.mapPackPosition || 'N/A'}</p>
              <p className="text-sm text-gray-500">Map Pack Position</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{formatNumber(seo.backlinks.totalBacklinks)}</p>
              <p className="text-sm text-gray-500">Backlinks</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Competitors */}
      <section>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Competitors</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {competitors.map((competitor) => (
            <CompetitorCard key={competitor.id} competitor={competitor} />
          ))}
        </div>
      </section>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* SEO Metrics */}
        <MetricsCard title="SEO Performance" description="Technical and content metrics">
          <MetricItem label="Domain Authority" value={seo.domainAuthority} showBar />
          <MetricItem label="Page Authority" value={seo.pageAuthority} showBar />
          <MetricItem label="Content Score" value={seo.contentScore} showBar />
          <MetricItem label="Mobile Score" value={seo.technicalSeo.mobileScore} showBar />
          <MetricItem label="Page Speed (Desktop)" value={seo.technicalSeo.pageSpeedDesktop} showBar />
        </MetricsCard>

        {/* AEO Readiness */}
        <MetricsCard title="AEO Readiness" description="Answer Engine Optimization metrics">
          <MetricItem label="Structured Data Score" value={seo.aeoReadiness.structuredDataScore} showBar />
          <MetricItem label="Voice Search Optimization" value={seo.aeoReadiness.voiceSearchOptimization} showBar />
          <MetricItem label="Answer Box Eligibility" value={seo.aeoReadiness.answerBoxEligibility} showBar />
          <MetricItem
            label="FAQ Presence"
            value={seo.aeoReadiness.faqPresence ? 'Yes' : 'No'}
          />
        </MetricsCard>

        {/* Local SEO */}
        <MetricsCard title="Local SEO" description="Local search presence and citations">
          <MetricItem label="Citation Consistency" value={localSeo.citationConsistency} suffix="%" showBar />
          <MetricItem label="NAP Consistency" value={localSeo.napConsistency} suffix="%" showBar />
          <MetricItem label="Service Area Coverage" value={localSeo.proximityFactors.serviceAreaCoverage} suffix="%" showBar />
          <MetricItem label="Market Saturation" value={localSeo.proximityFactors.marketSaturation} suffix="%" showBar />
        </MetricsCard>

        {/* Google Business Profile */}
        <MetricsCard title="Google Business Profile" description="GBP completeness and engagement">
          <MetricItem label="Profile Completeness" value={gbp.profileCompleteness} suffix="%" showBar />
          <MetricItem label="Photo Quality" value={gbp.photos.quality} showBar />
          <MetricItem label="Photo Count" value={gbp.photos.count} />
          <MetricItem label="Recent Posts" value={gbp.posts.length} />
          <MetricItem label="Q&A Responses" value={gbp.qAndA.length} />
        </MetricsCard>
      </div>

      {/* Keyword Rankings */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Keyword Rankings</h3>
          <p className="text-sm text-gray-500 mt-1">Your position vs competitors for target keywords</p>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Your Rank
                  </th>
                  {competitors.slice(0, 3).map((c, idx) => (
                    <th key={c.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #{idx + 1} Rank
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {serp.keywords.slice(0, 5).map((kw) => (
                  <tr key={kw.keyword}>
                    <td className="px-4 py-3 text-sm text-gray-900">{kw.keyword}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{formatNumber(kw.volume)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        kw.difficulty > 60 ? 'bg-red-100 text-red-700' :
                        kw.difficulty > 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {kw.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center font-medium text-blue-600">
                      {kw.clientRank || '-'}
                    </td>
                    {competitors.slice(0, 3).map((c) => {
                      const rank = kw.competitorRanks.find(r => r.competitorId === c.id);
                      return (
                        <td key={c.id} className="px-4 py-3 text-sm text-center text-gray-600">
                          {rank?.rank || '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Directory Listings */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold text-gray-900">Directory Listings</h3>
          <p className="text-sm text-gray-500 mt-1">Status of your business across major directories</p>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {localSeo.directoryListings.map((listing) => (
              <div
                key={listing.directory}
                className={`p-4 rounded-lg border ${
                  listing.claimed && listing.consistent
                    ? 'border-green-200 bg-green-50'
                    : listing.claimed
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{listing.directory}</span>
                  {listing.claimed && listing.consistent ? (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : listing.claimed ? (
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {listing.claimed ? 'Claimed' : 'Not claimed'}
                  {listing.claimed && !listing.consistent && ' (inconsistent)'}
                </div>
                {listing.rating && (
                  <div className="mt-1 text-sm text-gray-700">
                    {listing.rating.toFixed(1)} ({listing.reviewCount} reviews)
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
