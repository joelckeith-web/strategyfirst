import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function IntakeLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-500">Loading intake form...</p>
    </div>
  );
}
