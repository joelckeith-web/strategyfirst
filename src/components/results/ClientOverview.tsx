'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { IntakeData } from '@/lib/types/intake';

interface ClientOverviewProps {
  intake: IntakeData;
  metrics?: {
    domainAuthority?: number;
    gbpRating?: number;
    totalReviews?: number;
    totalPages?: number;
  };
}

export function ClientOverview({ intake, metrics }: ClientOverviewProps) {
  const { businessContext, localSEO } = intake;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {businessContext.businessName}
            </h2>
            <p className="text-gray-500 mt-1">
              {businessContext.primaryServiceArea}
              {businessContext.secondaryServiceAreas.length > 0 && (
                <span> + {businessContext.secondaryServiceAreas.length} more areas</span>
              )}
            </p>
          </div>
          {metrics && (
            <div className="flex gap-4">
              {metrics.domainAuthority !== undefined && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-blue-600">
                      {metrics.domainAuthority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">DA</p>
                </div>
              )}
              {metrics.gbpRating !== undefined && (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-yellow-600">
                      {metrics.gbpRating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Rating</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {localSEO.currentGoogleRating?.toFixed(1) || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">Google Rating</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {localSEO.totalReviews || metrics?.totalReviews || 0}
            </p>
            <p className="text-sm text-gray-500">Reviews</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {metrics?.totalPages || '-'}
            </p>
            <p className="text-sm text-gray-500">Website Pages</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">
              {localSEO.mainCompetitors.length}
            </p>
            <p className="text-sm text-gray-500">Competitors</p>
          </div>
        </div>

        {businessContext.uniqueValueProposition && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Value Proposition</p>
            <p className="text-blue-800 mt-1">{businessContext.uniqueValueProposition}</p>
          </div>
        )}

        {businessContext.targetDemographic && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Target Demographic</p>
            <p className="text-gray-600">{businessContext.targetDemographic}</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
