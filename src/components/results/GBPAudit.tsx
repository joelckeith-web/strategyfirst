'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';

interface GBPMetrics {
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

interface GBPAuditProps {
  metrics: GBPMetrics;
  title?: string;
}

function getCompletionScore(metrics: GBPMetrics): number {
  let score = 0;
  const checks = [
    metrics.rating > 0,
    metrics.totalReviews > 10,
    metrics.hasWebsite,
    metrics.hasPhone,
    metrics.hasAddress,
    metrics.photoCount >= 5,
    metrics.hasOpeningHours,
    metrics.categories.length > 0,
    metrics.responseRate > 50,
    metrics.recentReviews > 0,
  ];

  score = checks.filter(Boolean).length * 10;
  return score;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {hasHalfStar && (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function GBPAudit({ metrics, title = 'Google Business Profile' }: GBPAuditProps) {
  const completionScore = getCompletionScore(metrics);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">Profile completeness and engagement</p>
          </div>
          <div className="text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              completionScore >= 80 ? 'bg-green-100' :
              completionScore >= 60 ? 'bg-blue-100' :
              completionScore >= 40 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className={`text-lg font-bold ${
                completionScore >= 80 ? 'text-green-600' :
                completionScore >= 60 ? 'text-blue-600' :
                completionScore >= 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {completionScore}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Rating Section */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-3xl font-bold text-gray-900">{metrics.rating.toFixed(1)}</p>
            <StarRating rating={metrics.rating} />
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-gray-900">{metrics.totalReviews}</p>
            <p className="text-sm text-gray-500">total reviews</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Recent Reviews (30d)</p>
            <p className="text-xl font-semibold text-gray-900">{metrics.recentReviews}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Response Rate</p>
            <p className="text-xl font-semibold text-gray-900">{metrics.responseRate.toFixed(0)}%</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Photos</p>
            <p className="text-xl font-semibold text-gray-900">{metrics.photoCount}</p>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-xl font-semibold text-gray-900">{metrics.categories.length}</p>
          </div>
        </div>

        {/* Checklist */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Profile Checklist</h4>
          <div className="space-y-2">
            {[
              { label: 'Website URL', value: metrics.hasWebsite },
              { label: 'Phone Number', value: metrics.hasPhone },
              { label: 'Address', value: metrics.hasAddress },
              { label: 'Opening Hours', value: metrics.hasOpeningHours },
              { label: '5+ Photos', value: metrics.photoCount >= 5 },
              { label: '50%+ Review Response', value: metrics.responseRate >= 50 },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                {item.value ? (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        {(metrics.url || metrics.website) && (
          <div className="border-t border-gray-200 pt-4 flex gap-4">
            {metrics.url && (
              <a
                href={metrics.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                View on Google Maps
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {metrics.website && (
              <a
                href={metrics.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                Visit Website
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
