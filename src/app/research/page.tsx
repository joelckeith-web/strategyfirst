'use client';

import { MinimalInputForm } from '@/components/research';

export default function ResearchPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Research</h1>
        <p className="text-gray-600 mt-2">
          Start with just 4 fields - we&apos;ll handle the rest automatically
        </p>
      </div>

      <MinimalInputForm />
    </div>
  );
}
