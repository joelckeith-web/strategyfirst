'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AnalysisDashboard } from '@/components/results';
import { IntakeAnalysisResult } from '@/services/analysisOrchestrator';

interface PageProps {
  params: Promise<{ id: string; analysisId: string }>;
}

export default function IntakeResultsPage({ params }: PageProps) {
  const { id: intakeId, analysisId } = use(params);
  const [analysis, setAnalysis] = useState<IntakeAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchAnalysis() {
      try {
        const response = await fetch(
          `/api/intake/${intakeId}/analyze?analysisId=${analysisId}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Analysis not found');
          }
          throw new Error('Failed to fetch analysis');
        }
        const data = await response.json();
        setAnalysis(data);

        // Stop polling if completed or failed
        if (data.status === 'completed' || data.status === 'failed') {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalysis();

    // Poll for updates while processing
    intervalId = setInterval(fetchAnalysis, 2000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intakeId, analysisId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500">Loading analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-gray-500">{error}</p>
        <div className="mt-6">
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  // Show loading state for pending/processing
  if (analysis.status === 'pending' || analysis.status === 'processing') {
    return (
      <div className="text-center py-16">
        <LoadingSpinner size="lg" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          {analysis.status === 'pending' ? 'Analysis Queued' : 'Analyzing Your Business...'}
        </h3>
        <p className="mt-1 text-gray-500">
          {analysis.status === 'pending'
            ? 'Your analysis will start shortly.'
            : 'We\'re gathering data about your business and competitors.'}
        </p>
        <div className="mt-8 max-w-md mx-auto">
          <div className="space-y-3 text-left">
            <AnalysisStep label="Fetching Google Business Profile data" active={analysis.status === 'processing'} />
            <AnalysisStep label="Finding top competitors" />
            <AnalysisStep label="Analyzing website structure" />
            <AnalysisStep label="Generating recommendations" />
          </div>
        </div>
        <div className="mt-6">
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show error state for failed
  if (analysis.status === 'failed') {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">Analysis Failed</h3>
        <p className="mt-1 text-gray-500">{analysis.error || 'An unexpected error occurred.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Link href="/intake">
            <Button>Try Again</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show results for completed
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Strategy First Analysis</h1>
          </div>
          <p className="text-gray-500 mt-1">
            {analysis.intake.businessContext.businessName}
          </p>
        </div>
        <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
          Complete
        </span>
      </div>

      <AnalysisDashboard
        intake={analysis.intake}
        analysisResults={{
          gbp: analysis.gbp,
          competitors: analysis.competitors,
          sitemap: analysis.sitemap,
          seo: analysis.seo,
        }}
      />
    </div>
  );
}

function AnalysisStep({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {active ? (
        <LoadingSpinner size="sm" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
      )}
      <span className={active ? 'text-gray-900' : 'text-gray-500'}>{label}</span>
    </div>
  );
}
