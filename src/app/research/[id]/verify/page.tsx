'use client';

import { use } from 'react';
import { VerificationForm } from '@/components/research';

export default function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Verify Research Results</h1>
        <p className="text-gray-600 mt-2">
          Review the auto-discovered data and add any additional details before analysis
        </p>
      </div>

      <VerificationForm clientId={id} />
    </div>
  );
}
