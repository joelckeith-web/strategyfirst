'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { INDUSTRIES, HOME_SERVICE_CATEGORIES, LAW_FIRM_CATEGORIES, API_ENDPOINTS } from '@/lib/constants';
import { AnalysisRequest } from '@/lib/types';

export function AnalysisForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AnalysisRequest>({
    businessName: '',
    location: '',
    industry: 'home_services',
    specificServices: [],
  });

  const categories = formData.industry === 'home_services'
    ? HOME_SERVICE_CATEGORIES
    : LAW_FIRM_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.analysis, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start analysis');
      }

      const data = await response.json();
      router.push(`/analysis/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      specificServices: prev.specificServices?.includes(service)
        ? prev.specificServices.filter(s => s !== service)
        : [...(prev.specificServices || []), service],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold text-gray-900">New Analysis</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter business details to start competitor analysis
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Business Name"
            placeholder="e.g., ABC Plumbing Services"
            value={formData.businessName}
            onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
            required
          />

          <Input
            label="Location"
            placeholder="e.g., Austin, TX"
            helperText="City and state of the business"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required
          />

          <Select
            label="Industry"
            options={INDUSTRIES.map(i => ({ value: i.value, label: i.label }))}
            value={formData.industry}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              industry: e.target.value as 'home_services' | 'law_firm',
              specificServices: [],
            }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Categories (Optional)
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Select specific services to narrow the analysis
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = formData.specificServices?.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleServiceToggle(category)}
                    className={`
                      px-3 py-1.5 text-sm rounded-full border transition-colors
                      ${isSelected
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </CardBody>

        <CardFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!formData.businessName || !formData.location}
          >
            Start Analysis
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
