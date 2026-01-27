import { AnalysisForm } from '@/components/analysis';

export default function AnalysisPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Competitor Analysis</h1>
        <p className="text-gray-500 mt-1">
          Enter the business details to analyze their competitive landscape
        </p>
      </div>

      <AnalysisForm />
    </div>
  );
}
