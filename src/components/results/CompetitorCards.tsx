'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';

interface CompetitorData {
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
}

interface CompetitorCardsProps {
  competitors: CompetitorData[];
  clientRating?: number;
  clientReviews?: number;
}

const rankColors = {
  1: 'border-l-yellow-500 bg-yellow-50',
  2: 'border-l-gray-400 bg-gray-50',
  3: 'border-l-orange-400 bg-orange-50',
};

const rankLabels = {
  1: '1st',
  2: '2nd',
  3: '3rd',
};

function CompetitorCard({
  competitor,
  clientRating,
  clientReviews,
}: {
  competitor: CompetitorData;
  clientRating?: number;
  clientReviews?: number;
}) {
  const ratingComparison = clientRating
    ? competitor.rating - clientRating
    : 0;
  const reviewsComparison = clientReviews
    ? competitor.totalReviews - clientReviews
    : 0;

  return (
    <Card className={`border-l-4 ${rankColors[competitor.rank as 1 | 2 | 3] || 'bg-white'}`}>
      <CardBody>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                {rankLabels[competitor.rank as 1 | 2 | 3] || `#${competitor.rank}`}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 mt-1">{competitor.name}</h4>
            {competitor.address && (
              <p className="text-sm text-gray-500 mt-0.5">{competitor.address}</p>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Rating</span>
              <span className="flex items-center text-yellow-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900">{competitor.rating.toFixed(1)}</p>
            {ratingComparison !== 0 && (
              <p className={`text-xs ${ratingComparison > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {ratingComparison > 0 ? '+' : ''}{ratingComparison.toFixed(1)} vs you
              </p>
            )}
          </div>

          <div className="p-2 bg-white rounded border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Reviews</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{competitor.totalReviews}</p>
            {reviewsComparison !== 0 && (
              <p className={`text-xs ${reviewsComparison > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {reviewsComparison > 0 ? '+' : ''}{reviewsComparison} vs you
              </p>
            )}
          </div>
        </div>

        {/* Categories */}
        {competitor.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {competitor.categories.slice(0, 2).map((category) => (
              <span
                key={category}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-3 pt-3 border-t border-gray-200">
          {competitor.url && (
            <a
              href={competitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Google Maps
            </a>
          )}
          {competitor.website && (
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Website
            </a>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export function CompetitorCards({
  competitors,
  clientRating,
  clientReviews,
}: CompetitorCardsProps) {
  if (competitors.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-gray-500">No competitors found</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Competitors</h3>
        <span className="text-sm text-gray-500">{competitors.length} found</span>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {competitors.slice(0, 3).map((competitor) => (
          <CompetitorCard
            key={competitor.rank}
            competitor={competitor}
            clientRating={clientRating}
            clientReviews={clientReviews}
          />
        ))}
      </div>

      {competitors.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            +{competitors.length - 3} more competitors analyzed
          </p>
        </div>
      )}
    </div>
  );
}
