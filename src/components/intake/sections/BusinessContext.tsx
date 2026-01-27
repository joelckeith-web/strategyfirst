'use client';

import { BusinessContextData } from '@/lib/types/intake';
import { Input } from '@/components/ui/Input';

interface BusinessContextProps {
  data: BusinessContextData;
  onChange: (data: BusinessContextData) => void;
  errors?: Record<string, string>;
}

export function BusinessContext({ data, onChange, errors = {} }: BusinessContextProps) {
  const handleChange = (field: keyof BusinessContextData, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (field: keyof BusinessContextData, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ ...data, [field]: items });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Business Name"
          placeholder="e.g., ABC Plumbing Services"
          value={data.businessName}
          onChange={(e) => handleChange('businessName', e.target.value)}
          error={errors.businessName}
          required
        />

        <Input
          label="Website URL"
          placeholder="https://www.example.com"
          type="url"
          value={data.websiteUrl}
          onChange={(e) => handleChange('websiteUrl', e.target.value)}
          error={errors.websiteUrl}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Primary Service Area"
          placeholder="e.g., Austin, TX"
          value={data.primaryServiceArea}
          onChange={(e) => handleChange('primaryServiceArea', e.target.value)}
          error={errors.primaryServiceArea}
          helperText="Your main geographic market"
          required
        />

        <Input
          label="Secondary Service Areas"
          placeholder="Round Rock, Cedar Park, Georgetown"
          value={data.secondaryServiceAreas.join(', ')}
          onChange={(e) => handleArrayChange('secondaryServiceAreas', e.target.value)}
          error={errors.secondaryServiceAreas}
          helperText="Comma-separated list of additional areas"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Years in Business"
          placeholder="e.g., 15 years"
          value={data.yearsInBusiness}
          onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
          error={errors.yearsInBusiness}
        />

        <Input
          label="Target Demographic"
          placeholder="e.g., Homeowners 35-65, middle to upper income"
          value={data.targetDemographic}
          onChange={(e) => handleChange('targetDemographic', e.target.value)}
          error={errors.targetDemographic}
          helperText="Who is your ideal customer?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Description
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Briefly describe your business, what you do, and what makes you different..."
          value={data.businessDescription}
          onChange={(e) => handleChange('businessDescription', e.target.value)}
        />
        {errors.businessDescription && (
          <p className="mt-1 text-sm text-red-600">{errors.businessDescription}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unique Value Proposition
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="What makes customers choose you over competitors?"
          value={data.uniqueValueProposition}
          onChange={(e) => handleChange('uniqueValueProposition', e.target.value)}
        />
        <p className="mt-1 text-sm text-gray-500">
          Your key differentiator in 1-2 sentences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Average Job Value"
          placeholder="e.g., $500 - $2,000"
          value={data.averageJobValue}
          onChange={(e) => handleChange('averageJobValue', e.target.value)}
          error={errors.averageJobValue}
          helperText="Typical revenue per job/project"
        />

        <Input
          label="Monthly Lead Goal"
          placeholder="e.g., 50 qualified leads"
          value={data.monthlyLeadGoal}
          onChange={(e) => handleChange('monthlyLeadGoal', e.target.value)}
          error={errors.monthlyLeadGoal}
          helperText="How many leads do you want per month?"
        />
      </div>
    </div>
  );
}
