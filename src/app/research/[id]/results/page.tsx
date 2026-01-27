'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
}

interface SitemapData {
  totalPages: number;
  pageTypes: Record<string, number>;
  hasServicePages: boolean;
  hasBlog: boolean;
  hasLocationPages: boolean;
  recentlyUpdated: number;
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
  napConsistent?: boolean;
}

interface ResearchResults {
  gbp?: GBPData;
  competitors?: CompetitorData[];
  websiteCrawl?: WebsiteCrawlData;
  sitemap?: SitemapData;
  seoAudit?: SEOAuditData;
  citations?: CitationData[];
}

interface SessionData {
  sessionId: string;
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
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const { gbp, competitors, websiteCrawl, sitemap, seoAudit, citations } = results;

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
        </div>
        <Button onClick={() => router.push('/research')} variant="outline">
          New Research
        </Button>
      </div>

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
      {competitors && competitors.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Competitor Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">Top competitors in your area</p>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-3 pr-4">Rank</th>
                    <th className="pb-3 pr-4">Business</th>
                    <th className="pb-3 pr-4">Rating</th>
                    <th className="pb-3">Reviews</th>
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
                      <td className="py-3">{competitor.reviewCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {gbp && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Your position:</strong> Rating {gbp.rating} with {gbp.reviewCount} reviews
                  {gbp.rating >= (competitors[0]?.rating || 0) ? (
                    <span className="ml-2 text-green-600">Leading the competition!</span>
                  ) : (
                    <span className="ml-2 text-amber-600">
                      {(competitors[0]?.rating - gbp.rating).toFixed(1)} stars behind the leader
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      )}

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
            </CardBody>
          </Card>
        )}

        {/* Sitemap Analysis */}
        {sitemap && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Site Structure</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <StatCard value={sitemap.totalPages || 0} label="Total Pages" icon="📄" />
                <StatCard value={sitemap.pageTypes?.services || 0} label="Service Pages" icon="🔧" />
                <StatCard value={sitemap.pageTypes?.blog || 0} label="Blog Posts" icon="📝" />
                <StatCard value={sitemap.recentlyUpdated || 0} label="Recently Updated" icon="🔄" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Has Service Pages</span>
                  <span className={sitemap.hasServicePages ? 'text-green-500' : 'text-red-500'}>
                    {sitemap.hasServicePages ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Has Blog</span>
                  <span className={sitemap.hasBlog ? 'text-green-500' : 'text-amber-500'}>
                    {sitemap.hasBlog ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Has Location Pages</span>
                  <span className={sitemap.hasLocationPages ? 'text-green-500' : 'text-gray-400'}>
                    {sitemap.hasLocationPages ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Citations */}
      {citations && citations.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Citation Check</h2>
            <p className="text-sm text-gray-500 mt-1">Business directory listings and NAP consistency</p>
          </CardHeader>
          <CardBody>
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
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

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
