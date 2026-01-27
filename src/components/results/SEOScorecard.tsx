'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';

interface SEOMetrics {
  domainAuthority?: number;
  pageAuthority?: number;
  totalBacklinks?: number;
  referringDomains?: number;
  mobileScore?: number;
  pageSpeedDesktop?: number;
  pageSpeedMobile?: number;
  contentScore?: number;
  structuredDataScore?: number;
  hasSitemap?: boolean;
  hasRobotsTxt?: boolean;
  hasSSL?: boolean;
}

interface SEOScorecardProps {
  metrics: SEOMetrics;
  title?: string;
}

function getScoreColor(value: number, max: number = 100): string {
  const percentage = (value / max) * 100;
  if (percentage >= 80) return 'text-green-600 bg-green-100';
  if (percentage >= 60) return 'text-blue-600 bg-blue-100';
  if (percentage >= 40) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
}

function getBarColor(value: number, max: number = 100): string {
  const percentage = (value / max) * 100;
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-blue-500';
  if (percentage >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function MetricBar({ label, value, max = 100 }: { label: string; value?: number; max?: number }) {
  if (value === undefined) return null;

  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="py-2">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className={`font-semibold ${getScoreColor(value, max).split(' ')[0]}`}>
          {value}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${getBarColor(value, max)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function MetricCheck({ label, value }: { label: string; value?: boolean }) {
  if (value === undefined) return null;

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      {value ? (
        <span className="flex items-center text-green-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </span>
      ) : (
        <span className="flex items-center text-red-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </span>
      )}
    </div>
  );
}

export function SEOScorecard({ metrics, title = 'SEO Performance' }: SEOScorecardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">Technical and content metrics</p>
      </CardHeader>

      <CardBody className="divide-y divide-gray-100">
        {/* Authority Metrics */}
        <div className="pb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Authority
          </h4>
          <MetricBar label="Domain Authority" value={metrics.domainAuthority} />
          <MetricBar label="Page Authority" value={metrics.pageAuthority} />
        </div>

        {/* Backlink Metrics */}
        {(metrics.totalBacklinks !== undefined || metrics.referringDomains !== undefined) && (
          <div className="py-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Backlinks
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {metrics.totalBacklinks !== undefined && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">
                    {metrics.totalBacklinks.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total Backlinks</p>
                </div>
              )}
              {metrics.referringDomains !== undefined && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">
                    {metrics.referringDomains.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Referring Domains</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        <div className="py-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Performance
          </h4>
          <MetricBar label="Mobile Score" value={metrics.mobileScore} />
          <MetricBar label="Page Speed (Desktop)" value={metrics.pageSpeedDesktop} />
          <MetricBar label="Page Speed (Mobile)" value={metrics.pageSpeedMobile} />
        </div>

        {/* Content & Structure */}
        <div className="py-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Content & Structure
          </h4>
          <MetricBar label="Content Score" value={metrics.contentScore} />
          <MetricBar label="Structured Data" value={metrics.structuredDataScore} />
        </div>

        {/* Technical Checks */}
        <div className="pt-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Technical Checks
          </h4>
          <MetricCheck label="XML Sitemap" value={metrics.hasSitemap} />
          <MetricCheck label="Robots.txt" value={metrics.hasRobotsTxt} />
          <MetricCheck label="SSL Certificate" value={metrics.hasSSL} />
        </div>
      </CardBody>
    </Card>
  );
}
