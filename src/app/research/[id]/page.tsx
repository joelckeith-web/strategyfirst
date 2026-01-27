'use client';

import { use } from 'react';
import { ResearchProgress } from '@/components/research';

export default function ResearchProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Research Progress</h1>
        <p className="text-gray-600 mt-2">
          We&apos;re gathering data about your business from multiple sources
        </p>
      </div>

      <ResearchProgress clientId={id} />
    </div>
  );
}
