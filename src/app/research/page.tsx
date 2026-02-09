'use client';

import { useSearchParams } from 'next/navigation';
import { MinimalInputForm } from '@/components/research';

export default function ResearchPage() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || undefined;
  const locationId = searchParams.get('locationId') || undefined;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#002366]">New Research</h1>
        <p className="text-gray-600 mt-2">
          Start with just 4 fields - we&apos;ll handle the rest automatically
        </p>
      </div>

      <MinimalInputForm
        initialClientId={clientId}
        initialLocationId={locationId}
      />
    </div>
  );
}
