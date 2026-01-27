'use client';

import { INTAKE_SECTIONS } from '@/lib/types/intake';

interface ProgressIndicatorProps {
  currentStep: number;
  completedSteps: number[];
}

export function ProgressIndicator({ currentStep, completedSteps }: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile: Simple progress bar */}
      <div className="lg:hidden mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {INTAKE_SECTIONS.length}</span>
          <span>{Math.round((completedSteps.length / INTAKE_SECTIONS.length) * 100)}% complete</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(currentStep / INTAKE_SECTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Step indicators */}
      <nav aria-label="Progress" className="hidden lg:block mb-8">
        <ol className="flex items-center">
          {INTAKE_SECTIONS.map((section, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = currentStep === stepNumber;
            const isPast = stepNumber < currentStep;

            return (
              <li
                key={section.id}
                className={`relative ${index !== INTAKE_SECTIONS.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex items-center">
                  <div
                    className={`
                      relative flex h-10 w-10 items-center justify-center rounded-full
                      ${isCompleted || isPast
                        ? 'bg-blue-600'
                        : isCurrent
                        ? 'border-2 border-blue-600 bg-white'
                        : 'border-2 border-gray-300 bg-white'
                      }
                    `}
                  >
                    {isCompleted || isPast ? (
                      <svg
                        className="h-5 w-5 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          isCurrent ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        {stepNumber}
                      </span>
                    )}
                  </div>

                  {index !== INTAKE_SECTIONS.length - 1 && (
                    <div
                      className={`
                        ml-4 h-0.5 flex-1
                        ${isPast || isCompleted ? 'bg-blue-600' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </div>

                <div className="mt-2 min-w-max">
                  <p
                    className={`text-xs font-medium ${
                      isCurrent ? 'text-blue-600' : isPast || isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {section.title}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Current section title (mobile) */}
      <div className="lg:hidden text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {INTAKE_SECTIONS[currentStep - 1]?.title}
        </h2>
        <p className="text-sm text-gray-500">
          {INTAKE_SECTIONS[currentStep - 1]?.description}
        </p>
      </div>
    </div>
  );
}
