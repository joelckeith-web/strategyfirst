'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  IntakeData,
  DEFAULT_INTAKE_DATA,
  INTAKE_SECTIONS,
  BusinessContextData,
  RevenueServicesData,
  LocalSEOData,
  WebsiteReadinessData,
  ToneVoiceData,
  ConversionMeasurementData,
  AIConsiderationsData,
} from '@/lib/types/intake';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { ProgressIndicator } from './ProgressIndicator';
import {
  BusinessContext,
  RevenueServices,
  LocalSEO,
  WebsiteReadiness,
  ToneVoice,
  ConversionMeasurement,
  AIConsiderations,
} from './sections';

const STORAGE_KEY = 'intake_draft';

interface IntakeWizardProps {
  initialData?: Partial<IntakeData>;
  onComplete?: (data: IntakeData) => void;
}

export function IntakeWizard({ initialData, onComplete }: IntakeWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [data, setData] = useState<IntakeData>(() => ({
    ...DEFAULT_INTAKE_DATA,
    ...initialData,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && !initialData) {
      try {
        const parsed = JSON.parse(saved);
        setData(prev => ({ ...prev, ...parsed }));
        setCurrentStep(parsed.currentSection || 1);
      } catch {
        // Invalid data, ignore
      }
    }
  }, [initialData]);

  // Auto-save to localStorage
  const saveToLocalStorage = useCallback(() => {
    setIsSaving(true);
    const toSave = { ...data, currentSection: currentStep };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setTimeout(() => setIsSaving(false), 500);
  }, [data, currentStep]);

  useEffect(() => {
    const timeout = setTimeout(saveToLocalStorage, 1000);
    return () => clearTimeout(timeout);
  }, [data, saveToLocalStorage]);

  // Validate current section
  const validateSection = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!data.businessContext.businessName) {
        newErrors.businessName = 'Business name is required';
      }
      if (!data.businessContext.websiteUrl) {
        newErrors.websiteUrl = 'Website URL is required';
      }
      if (!data.businessContext.primaryServiceArea) {
        newErrors.primaryServiceArea = 'Primary service area is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle section data changes
  const handleSectionChange = (section: keyof IntakeData, sectionData: unknown) => {
    setData(prev => ({
      ...prev,
      [section]: sectionData,
    }));
    // Clear errors when user makes changes
    setErrors({});
  };

  // Navigation
  const goToStep = (step: number) => {
    if (step >= 1 && step <= INTAKE_SECTIONS.length) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (validateSection(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      if (currentStep < INTAKE_SECTIONS.length) {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateSection(currentStep)) return;

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    setIsSubmitting(true);

    try {
      const completeData: IntakeData = {
        ...data,
        status: 'completed',
        updatedAt: new Date(),
      };

      // Call API to save intake
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeData),
      });

      if (!response.ok) {
        throw new Error('Failed to save intake');
      }

      const result = await response.json();

      // Trigger analysis
      const analysisResponse = await fetch(`/api/intake/${result.id}/analyze`, {
        method: 'POST',
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to start analysis');
      }

      const analysisResult = await analysisResponse.json();

      // Clear draft
      localStorage.removeItem(STORAGE_KEY);

      // Callback or redirect to analysis results
      if (onComplete) {
        onComplete(completeData);
      } else {
        router.push(`/intake/${result.id}/results/${analysisResult.analysisId}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors({ submit: 'Failed to submit. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear draft
  const clearDraft = () => {
    if (confirm('Are you sure you want to clear all progress?')) {
      localStorage.removeItem(STORAGE_KEY);
      setData(DEFAULT_INTAKE_DATA);
      setCurrentStep(1);
      setCompletedSteps([]);
    }
  };

  // Render current section
  const renderSection = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessContext
            data={data.businessContext}
            onChange={(d: BusinessContextData) => handleSectionChange('businessContext', d)}
            errors={errors}
          />
        );
      case 2:
        return (
          <RevenueServices
            data={data.revenueServices}
            onChange={(d: RevenueServicesData) => handleSectionChange('revenueServices', d)}
            errors={errors}
          />
        );
      case 3:
        return (
          <LocalSEO
            data={data.localSEO}
            onChange={(d: LocalSEOData) => handleSectionChange('localSEO', d)}
            errors={errors}
          />
        );
      case 4:
        return (
          <WebsiteReadiness
            data={data.websiteReadiness}
            onChange={(d: WebsiteReadinessData) => handleSectionChange('websiteReadiness', d)}
            errors={errors}
          />
        );
      case 5:
        return (
          <ToneVoice
            data={data.toneVoice}
            onChange={(d: ToneVoiceData) => handleSectionChange('toneVoice', d)}
            errors={errors}
          />
        );
      case 6:
        return (
          <ConversionMeasurement
            data={data.conversionMeasurement}
            onChange={(d: ConversionMeasurementData) => handleSectionChange('conversionMeasurement', d)}
            errors={errors}
          />
        );
      case 7:
        return (
          <AIConsiderations
            data={data.aiConsiderations}
            onChange={(d: AIConsiderationsData) => handleSectionChange('aiConsiderations', d)}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const currentSectionMeta = INTAKE_SECTIONS[currentStep - 1];
  const isLastStep = currentStep === INTAKE_SECTIONS.length;

  return (
    <div className="max-w-4xl mx-auto">
      <ProgressIndicator currentStep={currentStep} completedSteps={completedSteps} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentSectionMeta.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {currentSectionMeta.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isSaving && (
                <span className="text-xs text-gray-400">Saving...</span>
              )}
              <button
                type="button"
                onClick={clearDraft}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                Clear Progress
              </button>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}
          {renderSection()}
        </CardBody>

        <CardFooter className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Step {currentStep} of {INTAKE_SECTIONS.length}
            </span>

            {isLastStep ? (
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                Complete & Analyze
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next
                <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
