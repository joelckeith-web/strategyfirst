'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface InferredField<T> {
  value: T;
  source: string;
  confidence: number;
  reasoning?: string;
}

interface LowConfidenceField {
  category: string;
  fieldName: string;
  displayName: string;
  currentValue: unknown;
  confidence: number;
  reasoning?: string;
  fieldType: 'text' | 'number' | 'select' | 'multiselect' | 'textarea';
  options?: string[];
  placeholder?: string;
  description?: string;
}

// Field metadata for human-readable display
const FIELD_METADATA: Record<string, {
  displayName: string;
  description: string;
  fieldType: 'text' | 'number' | 'select' | 'multiselect' | 'textarea';
  options?: string[];
  placeholder?: string;
}> = {
  // Business Context
  yearsInBusiness: {
    displayName: 'Years in Business',
    description: 'How many years has the business been operating?',
    fieldType: 'number',
    placeholder: 'e.g., 15',
  },
  teamSize: {
    displayName: 'Team Size',
    description: 'Approximate number of employees',
    fieldType: 'select',
    options: ['Solo', '2-5', '6-10', '11-25', '26-50', '50+'],
  },
  uniqueSellingPoints: {
    displayName: 'Unique Selling Points',
    description: 'What makes this business different from competitors?',
    fieldType: 'textarea',
    placeholder: 'Enter each unique selling point on a new line',
  },
  targetAudience: {
    displayName: 'Target Audience',
    description: 'Who is the primary customer for this business?',
    fieldType: 'textarea',
    placeholder: 'Describe the ideal customer profile',
  },
  competitiveAdvantages: {
    displayName: 'Competitive Advantages',
    description: 'What advantages does this business have over competitors?',
    fieldType: 'textarea',
    placeholder: 'Enter each advantage on a new line',
  },
  businessModel: {
    displayName: 'Business Model',
    description: 'Primary business model type',
    fieldType: 'select',
    options: ['B2B', 'B2C', 'B2B2C', 'D2C'],
  },
  seasonality: {
    displayName: 'Seasonality',
    description: 'Does the business have peak seasons?',
    fieldType: 'text',
    placeholder: 'e.g., "Summer peak" or "Year-round"',
  },
  // Revenue & Services
  primaryServices: {
    displayName: 'Primary Services',
    description: 'Main services offered by the business',
    fieldType: 'textarea',
    placeholder: 'Enter each primary service on a new line',
  },
  secondaryServices: {
    displayName: 'Secondary Services',
    description: 'Additional services offered',
    fieldType: 'textarea',
    placeholder: 'Enter each secondary service on a new line',
  },
  averageTransactionValue: {
    displayName: 'Average Transaction Value',
    description: 'Typical price range for services',
    fieldType: 'text',
    placeholder: 'e.g., "$200-500" or "$1,000+"',
  },
  pricingModel: {
    displayName: 'Pricing Model',
    description: 'How services are priced',
    fieldType: 'select',
    options: ['Fixed', 'Hourly', 'Project-based', 'Subscription', 'Mixed'],
  },
  serviceRadius: {
    displayName: 'Service Radius',
    description: 'How far does the business travel to serve customers?',
    fieldType: 'text',
    placeholder: 'e.g., "25 miles" or "Tri-state area"',
  },
  clientRetentionRate: {
    displayName: 'Client Retention Rate',
    description: 'What percentage of clients return?',
    fieldType: 'text',
    placeholder: 'e.g., "80%" or "Unknown"',
  },
  referralPercentage: {
    displayName: 'Referral Percentage',
    description: 'What percentage of new business comes from referrals?',
    fieldType: 'text',
    placeholder: 'e.g., "40%" or "Unknown"',
  },
  // Local SEO
  primaryServiceArea: {
    displayName: 'Primary Service Area',
    description: 'Main geographic area served',
    fieldType: 'text',
    placeholder: 'e.g., "Greater Boston Area"',
  },
  serviceAreas: {
    displayName: 'Service Areas',
    description: 'All cities/areas where services are offered',
    fieldType: 'textarea',
    placeholder: 'Enter each city or area on a new line',
  },
  // Website Readiness
  cms: {
    displayName: 'Content Management System',
    description: 'What platform is the website built on?',
    fieldType: 'select',
    options: ['WordPress', 'Squarespace', 'Wix', 'Shopify', 'Custom', 'Other', 'Unknown'],
  },
  // Tone & Voice
  brandTone: {
    displayName: 'Brand Tone',
    description: 'How should the brand sound in communications?',
    fieldType: 'select',
    options: ['Professional', 'Friendly', 'Authoritative', 'Casual', 'Warm', 'Technical', 'Trustworthy'],
  },
  writingStyle: {
    displayName: 'Writing Style',
    description: 'The style of written content',
    fieldType: 'select',
    options: ['Formal', 'Conversational', 'Technical', 'Educational', 'Persuasive'],
  },
  keyMessaging: {
    displayName: 'Key Messaging',
    description: 'Core messages the brand should communicate',
    fieldType: 'textarea',
    placeholder: 'Enter each key message on a new line',
  },
  // Conversion & Measurement
  primaryConversionGoal: {
    displayName: 'Primary Conversion Goal',
    description: 'What is the main desired action from website visitors?',
    fieldType: 'select',
    options: ['Phone calls', 'Form submissions', 'Purchases', 'Appointments', 'Quote requests', 'Email signups'],
  },
  secondaryConversionGoals: {
    displayName: 'Secondary Conversion Goals',
    description: 'Other important conversion actions',
    fieldType: 'textarea',
    placeholder: 'Enter each secondary goal on a new line',
  },
  currentLeadVolume: {
    displayName: 'Current Monthly Lead Volume',
    description: 'Approximate number of leads received per month',
    fieldType: 'text',
    placeholder: 'e.g., "20-30 leads" or "Unknown"',
  },
  customerJourneyLength: {
    displayName: 'Customer Journey Length',
    description: 'How long does it take for a lead to become a customer?',
    fieldType: 'select',
    options: ['Same day', '1-7 days', '1-4 weeks', '1-3 months', '3+ months'],
  },
};

// Category display names
const CATEGORY_NAMES: Record<string, string> = {
  businessContext: 'Business Context',
  revenueServices: 'Revenue & Services',
  localSEO: 'Local SEO',
  websiteReadiness: 'Website Readiness',
  toneVoice: 'Tone & Voice',
  conversionMeasurement: 'Conversion & Measurement',
  aiConsiderations: 'AI Considerations',
};

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lowConfidenceFields, setLowConfidenceFields] = useState<LowConfidenceField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    async function fetchSessionData() {
      try {
        // Fetch the session to get AI analysis data
        const response = await fetch(`/api/research/status/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        const data = await response.json();

        if (!data.session) {
          throw new Error('Session not found');
        }

        setBusinessName(data.session.input?.businessName || 'Business');

        const aiAnalysis = data.session.results?.aiAnalysis;
        if (!aiAnalysis?.categories) {
          throw new Error('AI analysis not found. Please run analysis first.');
        }

        // Extract low-confidence fields
        const fields: LowConfidenceField[] = [];
        const categories = aiAnalysis.categories;

        for (const [categoryKey, categoryData] of Object.entries(categories)) {
          if (typeof categoryData !== 'object' || categoryData === null) continue;

          for (const [fieldKey, fieldData] of Object.entries(categoryData as Record<string, InferredField<unknown>>)) {
            if (
              typeof fieldData === 'object' &&
              fieldData !== null &&
              'confidence' in fieldData &&
              typeof fieldData.confidence === 'number' &&
              fieldData.confidence < 0.4 // Low confidence threshold
            ) {
              const metadata = FIELD_METADATA[fieldKey];
              if (metadata) {
                fields.push({
                  category: categoryKey,
                  fieldName: fieldKey,
                  displayName: metadata.displayName,
                  currentValue: fieldData.value,
                  confidence: fieldData.confidence,
                  reasoning: fieldData.reasoning,
                  fieldType: metadata.fieldType,
                  options: metadata.options,
                  placeholder: metadata.placeholder,
                  description: metadata.description,
                });
              }
            }
          }
        }

        // Sort by confidence (lowest first)
        fields.sort((a, b) => a.confidence - b.confidence);
        setLowConfidenceFields(fields);

        // Initialize form data with current values
        const initialData: Record<string, string> = {};
        for (const field of fields) {
          if (Array.isArray(field.currentValue)) {
            initialData[`${field.category}.${field.fieldName}`] = (field.currentValue as string[]).join('\n');
          } else if (field.currentValue !== null && field.currentValue !== undefined) {
            initialData[`${field.category}.${field.fieldName}`] = String(field.currentValue);
          } else {
            initialData[`${field.category}.${field.fieldName}`] = '';
          }
        }
        setFormData(initialData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session data');
      } finally {
        setLoading(false);
      }
    }

    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Transform form data into the expected structure
      const manualInput: Record<string, Record<string, unknown>> = {};

      for (const [key, value] of Object.entries(formData)) {
        if (!value.trim()) continue;

        const [category, fieldName] = key.split('.');
        if (!manualInput[category]) {
          manualInput[category] = {};
        }

        // Find the field to check if it is a multiline field
        const field = lowConfidenceFields.find(
          (f) => f.category === category && f.fieldName === fieldName
        );

        if (field?.fieldType === 'textarea' || field?.fieldType === 'multiselect') {
          // Convert newline-separated values to array
          manualInput[category][fieldName] = value
            .split('\n')
            .map((v) => v.trim())
            .filter((v) => v);
        } else if (field?.fieldType === 'number') {
          manualInput[category][fieldName] = Number(value) || null;
        } else {
          manualInput[category][fieldName] = value.trim();
        }
      }

      // Save manual input to session
      const response = await fetch(`/api/research/${sessionId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manualInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save verification data');
      }

      // Redirect to results page with reanalyze flag
      router.push(`/research/${sessionId}/results?reanalyze=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save data');
      setSubmitting(false);
    }
  };

  const filledCount = Object.values(formData).filter((v) => v.trim()).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error && lowConfidenceFields.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800">Error</h2>
          <p className="text-red-600 mt-1">{error}</p>
          <Link href={`/research/${sessionId}/results`}>
            <Button className="mt-4">Back to Results</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (lowConfidenceFields.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-green-800">All Fields Verified!</h2>
          <p className="text-green-600 mt-2">
            No low-confidence fields require verification. The AI analysis has sufficient data.
          </p>
          <Link href={`/research/${sessionId}/results`}>
            <Button className="mt-4">View Results</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Group fields by category
  const fieldsByCategory: Record<string, LowConfidenceField[]> = {};
  for (const field of lowConfidenceFields) {
    if (!fieldsByCategory[field.category]) {
      fieldsByCategory[field.category] = [];
    }
    fieldsByCategory[field.category].push(field);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/research/${sessionId}/results`}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Results
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Verify Missing Data</h1>
        <p className="text-gray-600 mt-2">
          Help improve the analysis for <span className="font-medium">{businessName}</span> by filling in
          the fields below. These fields had low confidence due to insufficient data during research.
        </p>
      </div>

      {/* Progress indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-blue-800">
              {filledCount} of {lowConfidenceFields.length} fields filled
            </span>
            <p className="text-xs text-blue-600 mt-1">
              Fill in as many as you can. You can skip unknown fields.
            </p>
          </div>
          <div className="w-32 bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${(filledCount / lowConfidenceFields.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {Object.entries(fieldsByCategory).map(([category, fields]) => (
          <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              {CATEGORY_NAMES[category] || category}
            </h2>

            <div className="space-y-6">
              {fields.map((field) => {
                const key = `${field.category}.${field.fieldName}`;
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.displayName}
                      <span className="ml-2 text-xs text-amber-600">
                        ({Math.round(field.confidence * 100)}% confidence)
                      </span>
                    </label>
                    {field.description && (
                      <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                    )}
                    {field.reasoning && (
                      <p className="text-xs text-amber-600 mb-2 italic">
                        AI note: {field.reasoning}
                      </p>
                    )}

                    {field.fieldType === 'select' && field.options ? (
                      <select
                        value={formData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select an option...</option>
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.fieldType === 'textarea' ? (
                      <textarea
                        value={formData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : field.fieldType === 'number' ? (
                      <input
                        type="number"
                        value={formData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData[key] || ''}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Submit buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link href={`/research/${sessionId}/results`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitting || filledCount === 0}
              className="min-w-[200px]"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>Save & Re-analyze</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
