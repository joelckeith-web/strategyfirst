import { Competitor } from '@/lib/types';
import { Card, CardBody } from '@/components/ui/Card';
import { formatPercentage } from '@/lib/utils/helpers';

interface CompetitorCardProps {
  competitor: Competitor;
}

export function CompetitorCard({ competitor }: CompetitorCardProps) {
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

  return (
    <Card className={`border-l-4 ${rankColors[competitor.competitorRank]}`}>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                {rankLabels[competitor.competitorRank]}
              </span>
              <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {competitor.address.city}, {competitor.address.state}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Proximity Score</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPercentage(competitor.proximityScore)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Service Overlap</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatPercentage(competitor.overlapScore)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {competitor.categories.slice(0, 3).map((category) => (
              <span
                key={category}
                className="text-xs px-2 py-1 bg-white border border-gray-200 rounded text-gray-600"
              >
                {category}
              </span>
            ))}
            {competitor.categories.length > 3 && (
              <span className="text-xs px-2 py-1 text-gray-500">
                +{competitor.categories.length - 3} more
              </span>
            )}
          </div>
        </div>

        {competitor.website && (
          <a
            href={competitor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            Visit Website
            <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        )}
      </CardBody>
    </Card>
  );
}
