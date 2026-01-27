'use client';

import { IntakeWizard } from '@/components/intake';

export default function IntakePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Strategy First Intake</h1>
        <p className="text-gray-500 mt-1">
          Complete this questionnaire to help us understand your business and competitive landscape.
        </p>
      </div>

      <IntakeWizard />
    </div>
  );
}
