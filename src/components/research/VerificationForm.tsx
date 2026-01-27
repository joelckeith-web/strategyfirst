'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface CompetitorData {
  rank: number;
  name: string;
  rating: number;
  reviewCount: number;
  website?: string;
}

interface ResearchData {
  client: {
    id: string;
    business_name: string;
    website_url: string;
    gbp_url: string | null;
    primary_service_area: string;
  };
  research: {
    gbp_rating: number | null;
    gbp_review_count: number | null;
    gbp_categories: string[] | null;
    gbp_phone: string | null;
    gbp_address: string | null;
    sitemap_total_pages: number | null;
    sitemap_has_service_pages: boolean | null;
    sitemap_has_blog: boolean | null;
    sitemap_has_location_pages: boolean | null;
    website_cms: string | null;
    website_has_ssl: boolean | null;
    website_is_mobile_responsive: boolean | null;
    website_has_structured_data: boolean | null;
    website_description: string | null;
    competitors: CompetitorData[] | null;
  };
}

interface VerificationFormProps {
  clientId: string;
}

interface EditableData {
  businessName: string;
  websiteUrl: string;
  primaryServiceArea: string;
  businessDescription: string;
  yearsInBusiness: string;
  averageJobValue: string;
  monthlyLeadGoal: string;
  targetKeywords: string;
}

export function VerificationForm({ clientId }: VerificationFormProps) {
  const router = useRouter();
  const [data, setData] = useState<ResearchData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editableData, setEditableData] = useState<EditableData>({
    businessName: '',
    websiteUrl: '',
    primaryServiceArea: '',
    businessDescription: '',
    yearsInBusiness: '',
    averageJobValue: '',
    monthlyLeadGoal: '',
    targetKeywords: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/research/${clientId}/verify`);
        if (!response.ok) throw new Error('Failed to fetch data');

        const researchData: ResearchData = await response.json();
        setData(researchData);

        // Initialize editable fields
        setEditableData({
          businessName: researchData.client.business_name,
          websiteUrl: researchData.client.website_url,
          primaryServiceArea: researchData.client.primary_service_area,
          businessDescription: researchData.research.website_description || '',
          yearsInBusiness: '',
          averageJobValue: '',
          monthlyLeadGoal: '',
          targetKeywords: '',
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, [clientId]);

  const handleChange = (field: keyof EditableData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditableData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/research/${clientId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editableData),
      });

      if (!response.ok) throw new Error('Failed to submit');

      const { analysisId } = await response.json();
      router.push(`/intake/${clientId}/results/${analysisId}`);
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Failed to start analysis. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <div className="flex items-center justify-center py-12">
            <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-gray-600">Loading research results...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-red-600">Failed to load research data</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto-Discovered Data - Read Only */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Auto-Discovered Data</h2>
          <p className="text-sm text-gray-600 mt-1">
            This data was automatically gathered from your online presence
          </p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GBP Data */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <span className="mr-2">📍</span> Google Business Profile
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="text-sm font-medium">
                    {data.research.gbp_rating ? `${data.research.gbp_rating} ⭐` : 'Not found'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Reviews</span>
                  <span className="text-sm font-medium">
                    {data.research.gbp_review_count ?? 'Not found'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phone</span>
                  <span className="text-sm font-medium">
                    {data.research.gbp_phone || 'Not found'}
                  </span>
                </div>
                {data.research.gbp_categories && data.research.gbp_categories.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Categories</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.research.gbp_categories.map((cat, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Website Data */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <span className="mr-2">🌐</span> Website Analysis
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CMS</span>
                  <span className="text-sm font-medium">
                    {data.research.website_cms || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">SSL</span>
                  <span className={`text-sm font-medium ${data.research.website_has_ssl ? 'text-green-600' : 'text-red-600'}`}>
                    {data.research.website_has_ssl ? 'Yes ✓' : 'No ✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mobile Responsive</span>
                  <span className={`text-sm font-medium ${data.research.website_is_mobile_responsive ? 'text-green-600' : 'text-red-600'}`}>
                    {data.research.website_is_mobile_responsive ? 'Yes ✓' : 'No ✗'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Structured Data</span>
                  <span className={`text-sm font-medium ${data.research.website_has_structured_data ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.research.website_has_structured_data ? 'Yes ✓' : 'Missing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sitemap Data */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <span className="mr-2">🗺️</span> Site Structure
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Pages</span>
                  <span className="text-sm font-medium">
                    {data.research.sitemap_total_pages ?? 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service Pages</span>
                  <span className={`text-sm font-medium ${data.research.sitemap_has_service_pages ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.research.sitemap_has_service_pages ? 'Yes ✓' : 'Not detected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Blog</span>
                  <span className={`text-sm font-medium ${data.research.sitemap_has_blog ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.research.sitemap_has_blog ? 'Yes ✓' : 'Not detected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Location Pages</span>
                  <span className={`text-sm font-medium ${data.research.sitemap_has_location_pages ? 'text-green-600' : 'text-yellow-600'}`}>
                    {data.research.sitemap_has_location_pages ? 'Yes ✓' : 'Not detected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Competitors */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 flex items-center">
                <span className="mr-2">🏆</span> Top Competitors
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {data.research.competitors && data.research.competitors.length > 0 ? (
                  <div className="space-y-2">
                    {data.research.competitors.slice(0, 5).map((comp: CompetitorData, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm text-gray-700 truncate max-w-[150px]">
                          {i + 1}. {comp.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {comp.rating}⭐ ({comp.reviewCount})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No competitors found</p>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Editable Fields */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900">Confirm & Add Details</h2>
          <p className="text-sm text-gray-600 mt-1">
            Verify the auto-filled data and add any additional information
          </p>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <Input
                  value={editableData.businessName}
                  onChange={handleChange('businessName')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Service Area
                </label>
                <Input
                  value={editableData.primaryServiceArea}
                  onChange={handleChange('primaryServiceArea')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                value={editableData.businessDescription}
                onChange={handleChange('businessDescription')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your business..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years in Business
                </label>
                <Input
                  type="number"
                  value={editableData.yearsInBusiness}
                  onChange={handleChange('yearsInBusiness')}
                  placeholder="e.g., 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avg. Job Value ($)
                </label>
                <Input
                  type="number"
                  value={editableData.averageJobValue}
                  onChange={handleChange('averageJobValue')}
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Lead Goal
                </label>
                <Input
                  type="number"
                  value={editableData.monthlyLeadGoal}
                  onChange={handleChange('monthlyLeadGoal')}
                  placeholder="e.g., 50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Keywords
                <span className="text-gray-400 font-normal ml-1">(comma separated)</span>
              </label>
              <Input
                value={editableData.targetKeywords}
                onChange={handleChange('targetKeywords')}
                placeholder="e.g., plumber near me, emergency plumbing, drain cleaning"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="secondary"
          onClick={() => router.push(`/research/${clientId}`)}
        >
          Back to Progress
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Starting Analysis...' : 'Start Full Analysis'}
        </Button>
      </div>
    </div>
  );
}
