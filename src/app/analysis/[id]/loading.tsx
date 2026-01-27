import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AnalysisLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <LoadingSpinner size="lg" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">Loading Analysis</h3>
      <p className="mt-1 text-gray-500">
        Please wait while we retrieve your analysis results...
      </p>
    </div>
  );
}
