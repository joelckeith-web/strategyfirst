'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

interface FormData {
  businessName: string;
  websiteUrl: string;
  gbpUrl: string;
  primaryServiceArea: string;
}

interface FormErrors {
  businessName?: string;
  websiteUrl?: string;
  primaryServiceArea?: string;
}

export function MinimalInputForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    websiteUrl: '',
    gbpUrl: '',
    primaryServiceArea: '',
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.websiteUrl.trim()) {
      newErrors.websiteUrl = 'Website URL is required';
    } else {
      try {
        new URL(formData.websiteUrl);
      } catch {
        newErrors.websiteUrl = 'Please enter a valid URL';
      }
    }

    if (!formData.primaryServiceArea.trim()) {
      newErrors.primaryServiceArea = 'Service area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to start research');
      }

      const { clientId } = await response.json();
      router.push(`/research/${clientId}`);
    } catch (error) {
      console.error('Error starting research:', error);
      alert('Failed to start research. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">Start New Research</h2>
        <p className="text-sm text-gray-600 mt-1">
          Enter just 4 fields and we&apos;ll automatically research your business
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
              Business Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="businessName"
              type="text"
              placeholder="Acme Plumbing Services"
              value={formData.businessName}
              onChange={handleChange('businessName')}
              className={errors.businessName ? 'border-red-500' : ''}
            />
            {errors.businessName && (
              <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
            )}
          </div>

          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL <span className="text-red-500">*</span>
            </label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://www.example.com"
              value={formData.websiteUrl}
              onChange={handleChange('websiteUrl')}
              className={errors.websiteUrl ? 'border-red-500' : ''}
            />
            {errors.websiteUrl && (
              <p className="mt-1 text-sm text-red-600">{errors.websiteUrl}</p>
            )}
          </div>

          <div>
            <label htmlFor="gbpUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Google Business Profile URL
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <Input
              id="gbpUrl"
              type="url"
              placeholder="https://maps.google.com/..."
              value={formData.gbpUrl}
              onChange={handleChange('gbpUrl')}
            />
            <p className="mt-1 text-xs text-gray-500">
              If you don&apos;t have this, we&apos;ll try to find it automatically
            </p>
          </div>

          <div>
            <label htmlFor="primaryServiceArea" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Service Area <span className="text-red-500">*</span>
            </label>
            <Input
              id="primaryServiceArea"
              type="text"
              placeholder="Austin, TX"
              value={formData.primaryServiceArea}
              onChange={handleChange('primaryServiceArea')}
              className={errors.primaryServiceArea ? 'border-red-500' : ''}
            />
            {errors.primaryServiceArea && (
              <p className="mt-1 text-sm text-red-600">{errors.primaryServiceArea}</p>
            )}
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Starting Research...
                </span>
              ) : (
                'Start Auto-Research'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            What we&apos;ll research automatically:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Google Business Profile data (rating, reviews, categories)</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Website structure (pages, blog, service pages)</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Technical details (CMS, SSL, structured data)</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Top 5 local competitors with their metrics</span>
            </li>
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
