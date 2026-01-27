'use client';

import { WebsiteReadinessData } from '@/lib/types/intake';
import { Input, Select } from '@/components/ui/Input';

interface WebsiteReadinessProps {
  data: WebsiteReadinessData;
  onChange: (data: WebsiteReadinessData) => void;
  errors?: Record<string, string>;
}

const PAGE_SPEED_OPTIONS = [
  { value: 'fast', label: 'Fast (< 2 seconds)' },
  { value: 'average', label: 'Average (2-4 seconds)' },
  { value: 'slow', label: 'Slow (> 4 seconds)' },
  { value: 'unknown', label: "Don't Know" },
];

const CMS_OPTIONS = [
  { value: '', label: 'Select CMS...' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'wix', label: 'Wix' },
  { value: 'squarespace', label: 'Squarespace' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'webflow', label: 'Webflow' },
  { value: 'custom', label: 'Custom Built' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: "Don't Know" },
];

export function WebsiteReadiness({ data, onChange, errors = {} }: WebsiteReadinessProps) {
  const handleChange = (field: keyof WebsiteReadinessData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (field: keyof WebsiteReadinessData, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ ...data, [field]: items });
  };

  const handleCheckbox = (field: keyof WebsiteReadinessData) => {
    onChange({ ...data, [field]: !data[field] });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Select
          label="Current CMS/Platform"
          options={CMS_OPTIONS}
          value={data.currentCMS}
          onChange={(e) => handleChange('currentCMS', e.target.value)}
        />

        <Input
          label="Website Age"
          placeholder="e.g., 5 years"
          value={data.websiteAge}
          onChange={(e) => handleChange('websiteAge', e.target.value)}
          error={errors.websiteAge}
        />

        <Input
          label="Last Major Update"
          placeholder="e.g., 2023 or 6 months ago"
          value={data.lastMajorUpdate}
          onChange={(e) => handleChange('lastMajorUpdate', e.target.value)}
          error={errors.lastMajorUpdate}
        />
      </div>

      {/* Checkbox section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Website Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasServicePages}
              onChange={() => handleCheckbox('hasServicePages')}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Has Service Pages</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasLocationPages}
              onChange={() => handleCheckbox('hasLocationPages')}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Has Location Pages</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasBlog}
              onChange={() => handleCheckbox('hasBlog')}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Has Blog</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.mobileResponsive}
              onChange={() => handleCheckbox('mobileResponsive')}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Mobile Responsive</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasSSL}
              onChange={() => handleCheckbox('hasSSL')}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Has SSL (HTTPS)</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.hasBlog && (
          <Input
            label="Blog Post Frequency"
            placeholder="e.g., Weekly, Monthly, Rarely"
            value={data.blogPostFrequency}
            onChange={(e) => handleChange('blogPostFrequency', e.target.value)}
            error={errors.blogPostFrequency}
          />
        )}

        <Select
          label="Page Load Speed"
          options={PAGE_SPEED_OPTIONS}
          value={data.pageLoadSpeed}
          onChange={(e) => handleChange('pageLoadSpeed', e.target.value as WebsiteReadinessData['pageLoadSpeed'])}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Existing Content Assets
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Videos, case studies, testimonials, before/after photos, guides"
            value={data.existingContentAssets.join(', ')}
            onChange={(e) => handleArrayChange('existingContentAssets', e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">Content you already have</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Known Technical Issues
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Slow loading, broken links, mobile issues, etc."
            value={data.technicalIssuesKnown.join(', ')}
            onChange={(e) => handleArrayChange('technicalIssuesKnown', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Analytics Setup
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {['Google Analytics', 'Google Search Console', 'Google Tag Manager', 'Facebook Pixel'].map((tool) => (
            <label key={tool} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.analyticsSetup.includes(tool)}
                onChange={() => {
                  const updated = data.analyticsSetup.includes(tool)
                    ? data.analyticsSetup.filter(t => t !== tool)
                    : [...data.analyticsSetup, tool];
                  handleChange('analyticsSetup', updated);
                }}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{tool}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
