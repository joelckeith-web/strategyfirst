'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

interface ResearchProgress {
  clientId: string;
  gbp: { status: TaskStatus; error?: string };
  sitemap: { status: TaskStatus; error?: string };
  website: { status: TaskStatus; error?: string };
  competitors: { status: TaskStatus; error?: string };
  overallStatus: 'pending' | 'running' | 'completed' | 'partial';
}

interface ResearchProgressProps {
  clientId: string;
}

const TASK_INFO = {
  gbp: {
    label: 'Google Business Profile',
    description: 'Fetching rating, reviews, categories, and contact info',
    icon: '📍',
  },
  sitemap: {
    label: 'Sitemap Analysis',
    description: 'Analyzing page structure, blog, and service pages',
    icon: '🗺️',
  },
  website: {
    label: 'Website Crawl',
    description: 'Detecting CMS, SSL, schema, and technical details',
    icon: '🌐',
  },
  competitors: {
    label: 'Competitor Research',
    description: 'Finding and analyzing top local competitors',
    icon: '🏆',
  },
};

function TaskCard({
  taskKey,
  status,
  error,
}: {
  taskKey: keyof typeof TASK_INFO;
  status: TaskStatus;
  error?: string;
}) {
  const info = TASK_INFO[taskKey];

  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 border-gray-200';
      case 'running':
        return 'bg-blue-50 border-blue-200 animate-pulse';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
        );
      case 'running':
        return (
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getStatusStyles()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{info.icon}</span>
          <div>
            <h3 className="font-medium text-gray-900">{info.label}</h3>
            <p className="text-sm text-gray-600">{info.description}</p>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">{getStatusIcon()}</div>
      </div>
    </div>
  );
}

export function ResearchProgress({ clientId }: ResearchProgressProps) {
  const router = useRouter();
  const [progress, setProgress] = useState<ResearchProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/research/${clientId}`);
      if (!response.ok) throw new Error('Failed to fetch progress');

      const data = await response.json();
      setProgress(data);
      setIsLoading(false);

      return data.overallStatus;
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Failed to load research progress');
      setIsLoading(false);
      return null;
    }
  }, [clientId]);

  useEffect(() => {
    // Initial fetch
    fetchProgress();

    // Poll every 3 seconds while research is running
    const interval = setInterval(async () => {
      const status = await fetchProgress();
      if (status === 'completed' || status === 'partial') {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchProgress]);

  const getCompletedCount = () => {
    if (!progress) return 0;
    return [progress.gbp, progress.sitemap, progress.website, progress.competitors]
      .filter(t => t.status === 'completed').length;
  };

  const canProceed = () => {
    if (!progress) return false;
    // Can proceed if at least one task completed successfully
    return getCompletedCount() > 0 &&
      progress.overallStatus !== 'running' &&
      progress.overallStatus !== 'pending';
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-12">
            <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-gray-600">Loading research status...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => router.push('/research')}
              className="mt-4"
            >
              Start New Research
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Research in Progress</h2>
            <p className="text-sm text-gray-600 mt-1">
              {progress?.overallStatus === 'running'
                ? 'Gathering data from multiple sources...'
                : progress?.overallStatus === 'completed'
                ? 'All research tasks completed!'
                : 'Research completed with partial results'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">{getCompletedCount()}/4</span>
            <p className="text-xs text-gray-500">tasks complete</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <TaskCard
            taskKey="gbp"
            status={progress?.gbp.status || 'pending'}
            error={progress?.gbp.error}
          />
          <TaskCard
            taskKey="sitemap"
            status={progress?.sitemap.status || 'pending'}
            error={progress?.sitemap.error}
          />
          <TaskCard
            taskKey="website"
            status={progress?.website.status || 'pending'}
            error={progress?.website.error}
          />
          <TaskCard
            taskKey="competitors"
            status={progress?.competitors.status || 'pending'}
            error={progress?.competitors.error}
          />
        </div>

        {canProceed() && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={() => router.push(`/research/${clientId}/verify`)}
              className="w-full"
            >
              Continue to Verification
            </Button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Review and confirm the auto-populated data before analysis
            </p>
          </div>
        )}

        {progress?.overallStatus === 'running' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              This may take 1-2 minutes. You can leave this page and come back.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
