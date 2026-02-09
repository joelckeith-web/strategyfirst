'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MinimalInputForm } from '@/components/research';

function ResearchContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('clientId') || undefined;
  const locationId = searchParams.get('locationId') || undefined;

  return (
    <MinimalInputForm
      initialClientId={clientId}
      initialLocationId={locationId}
    />
  );
}

export default function ResearchPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#002366]">New Research</h1>
        <p className="text-gray-600 mt-2">
          Start with just 4 fields - we&apos;ll handle the rest automatically
        </p>
      </div>

      <Suspense>
        <ResearchContent />
      </Suspense>
    </div>
  );
}
