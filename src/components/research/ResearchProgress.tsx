'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

interface ResearchProgressData {
  currentStep: string;
  completedSteps: string[];
  failedSteps: string[];
  percentage: number;
  phase?: string;
}

interface ResearchSessionStatus {
  sessionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: ResearchProgressData;
  results: Record<string, unknown>;
  errors: Array<{ step: string; message: string }>;
  input: {
    businessName: string;
    website: string;
    city?: string;
    state?: string;
    industry?: string;
  };
  createdAt: string;
  completedAt: string | null;
}

interface ResearchProgressProps {
  sessionId: string;
  onComplete?: (results: Record<string, unknown>) => void;
}

// Task display order: GBP + Sitemap (parallel), then Competitors, Website, SEO, Citations
const TASK_INFO = {
  gbp: {
    label: 'Google Business Profile',
    description: 'Fetching rating, reviews, categories, and contact info',
    icon: '📍',
    resultKey: 'gbp',
    order: 1,
  },
  sitemap: {
    label: 'Sitemap Analysis',
    description: 'Analyzing page structure, blog, and service pages',
    icon: '🗺️',
    resultKey: 'sitemap',
    order: 2,
  },
  competitors: {
    label: 'Competitor Research',
    description: 'Finding and analyzing top local competitors',
    icon: '🏆',
    resultKey: 'competitors',
    order: 3,
  },
  website: {
    label: 'Website Crawl',
    description: 'Detecting CMS, SSL, schema, and technical details',
    icon: '🌐',
    resultKey: 'websiteCrawl',
    order: 4,
  },
  seo: {
    label: 'SEO Audit',
    description: 'Analyzing performance, mobile friendliness, and technical SEO',
    icon: '📊',
    resultKey: 'seoAudit',
    order: 5,
  },
  citations: {
    label: 'Citation Check',
    description: 'Checking business listings and NAP consistency',
    icon: '📋',
    resultKey: 'citations',
    order: 6,
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

export function ResearchProgress({ sessionId, onComplete }: ResearchProgressProps) {
  const router = useRouter();
  const [sessionStatus, setSessionStatus] = useState<ResearchSessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive task statuses from progress data
  const getTaskStatus = useCallback((taskKey: keyof typeof TASK_INFO): TaskStatus => {
    if (!sessionStatus) return 'pending';

    const { progress, results, status } = sessionStatus;
    const info = TASK_INFO[taskKey];

    // Check if failed
    if (progress.failedSteps.includes(taskKey)) {
      return 'failed';
    }

    // Check if completed (step in completedSteps OR result exists)
    if (progress.completedSteps.includes(taskKey) || results[info.resultKey]) {
      return 'completed';
    }

    // Check if currently running - handle phased execution
    // Phase 1 runs gbp + sitemap in parallel
    // Phase 2 runs competitors
    // Phase 3 runs website
    if (status === 'running') {
      const currentStep = progress.currentStep;

      // Direct match
      if (currentStep === taskKey) {
        return 'running';
      }

      // Phase 1: gbp and sitemap run together
      if (currentStep === 'gbp' && taskKey === 'sitemap') {
        return 'running';
      }
      if (currentStep === 'sitemap' && taskKey === 'gbp') {
        return 'running';
      }
    }

    return 'pending';
  }, [sessionStatus]);

  const getTaskError = useCallback((taskKey: string): string | undefined => {
    if (!sessionStatus?.errors) return undefined;
    const taskError = sessionStatus.errors.find(e => e.step === taskKey);
    return taskError?.message;
  }, [sessionStatus]);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/research/status/${sessionId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Research session not found');
        }
        throw new Error('Failed to fetch status');
      }

      const data: ResearchSessionStatus = await response.json();
      setSessionStatus(data);
      setIsLoading(false);

      // Notify parent when complete
      if (data.status === 'completed' && onComplete) {
        onComplete(data.results);
      }

      return data.status;
    } catch (err) {
      console.error('Error fetching status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load research progress');
      setIsLoading(false);
      return null;
    }
  }, [sessionId, onComplete]);

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Poll every 2 seconds while research is running
    const interval = setInterval(async () => {
      const status = await fetchStatus();
      if (status === 'completed' || status === 'failed') {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  const getCompletedCount = () => {
    const tasks = Object.keys(TASK_INFO) as Array<keyof typeof TASK_INFO>;
    return tasks.filter(key => getTaskStatus(key) === 'completed').length;
  };

  const canProceed = () => {
    if (!sessionStatus) return false;
    return sessionStatus.status === 'completed' ||
      (sessionStatus.status !== 'running' && getCompletedCount() > 0);
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

  // Sort tasks by display order
  const taskKeys = (Object.keys(TASK_INFO) as Array<keyof typeof TASK_INFO>).sort(
    (a, b) => TASK_INFO[a].order - TASK_INFO[b].order
  );
  const totalTasks = taskKeys.length;
  const completedCount = getCompletedCount();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {sessionStatus?.input?.businessName || 'Research in Progress'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {sessionStatus?.status === 'running'
                ? sessionStatus?.progress?.phase || 'Gathering data from multiple sources...'
                : sessionStatus?.status === 'completed'
                ? 'All research tasks completed!'
                : sessionStatus?.status === 'failed'
                ? 'Research encountered errors'
                : 'Research starting...'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">
              {completedCount}/{totalTasks}
            </span>
            <p className="text-xs text-gray-500">tasks complete</p>
            {sessionStatus?.progress?.percentage !== undefined && (
              <div className="w-24 h-2 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${sessionStatus.progress.percentage}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {taskKeys.map(taskKey => (
            <TaskCard
              key={taskKey}
              taskKey={taskKey}
              status={getTaskStatus(taskKey)}
              error={getTaskError(taskKey)}
            />
          ))}
        </div>

        {canProceed() && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={() => router.push(`/research/${sessionId}/results`)}
              className="w-full"
            >
              View Results
            </Button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Review the research findings and recommendations
            </p>
          </div>
        )}

        {sessionStatus?.status === 'running' && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              This usually takes less than a minute.
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
