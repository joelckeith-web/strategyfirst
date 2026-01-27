'use client';

import { RevenueServicesData } from '@/lib/types/intake';
import { Input, Select } from '@/components/ui/Input';

interface RevenueServicesProps {
  data: RevenueServicesData;
  onChange: (data: RevenueServicesData) => void;
  errors?: Record<string, string>;
}

const PRICING_OPTIONS = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'project', label: 'Project-Based' },
  { value: 'mixed', label: 'Mixed/Varies' },
];

export function RevenueServices({ data, onChange, errors = {} }: RevenueServicesProps) {
  const handleChange = (field: keyof RevenueServicesData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (field: keyof RevenueServicesData, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ ...data, [field]: items });
  };

  const handleSeasonalChange = (value: string) => {
    // Parse "Service: Season, Service: Season" format
    const items = value.split(',').map(s => {
      const parts = s.split(':').map(p => p.trim());
      return { service: parts[0] || '', season: parts[1] || '' };
    }).filter(item => item.service);
    onChange({ ...data, seasonalServices: items });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Primary Services Offered
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="Plumbing repair, Water heater installation, Drain cleaning, Pipe replacement"
          value={data.primaryServices.join(', ')}
          onChange={(e) => handleArrayChange('primaryServices', e.target.value)}
        />
        <p className="mt-1 text-sm text-gray-500">Comma-separated list of your main services</p>
        {errors.primaryServices && (
          <p className="mt-1 text-sm text-red-600">{errors.primaryServices}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Highest Margin Services
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Water heater replacement, Whole-house repiping"
            value={data.highestMarginServices.join(', ')}
            onChange={(e) => handleArrayChange('highestMarginServices', e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">Services with best profit margins</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Most Requested Services
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Drain cleaning, Faucet repair, Toilet repair"
            value={data.mostRequestedServices.join(', ')}
            onChange={(e) => handleArrayChange('mostRequestedServices', e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">Services customers ask for most</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seasonal Services
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="AC repair: Summer, Heating: Winter, Sprinklers: Spring"
            value={data.seasonalServices.map(s => `${s.service}: ${s.season}`).join(', ')}
            onChange={(e) => handleSeasonalChange(e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">Format: Service: Season</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emergency Services
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="24/7 emergency plumbing, Burst pipe repair, Gas leak detection"
            value={data.emergencyServices.join(', ')}
            onChange={(e) => handleArrayChange('emergencyServices', e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">Services offered on emergency basis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Service Area Radius"
          placeholder="e.g., 25 miles"
          value={data.serviceAreaRadius}
          onChange={(e) => handleChange('serviceAreaRadius', e.target.value)}
          error={errors.serviceAreaRadius}
          helperText="How far do you travel for jobs?"
        />

        <Select
          label="Pricing Model"
          options={PRICING_OPTIONS}
          value={data.pricingModel}
          onChange={(e) => handleChange('pricingModel', e.target.value)}
        />

        <Input
          label="Average Project Size"
          placeholder="e.g., $800"
          value={data.averageProjectSize}
          onChange={(e) => handleChange('averageProjectSize', e.target.value)}
          error={errors.averageProjectSize}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Competitive Advantages
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="Licensed & insured, Same-day service, Upfront pricing, Family-owned since 1990"
          value={data.competitiveAdvantages.join(', ')}
          onChange={(e) => handleArrayChange('competitiveAdvantages', e.target.value)}
        />
        <p className="mt-1 text-sm text-gray-500">What sets you apart from competitors?</p>
      </div>
    </div>
  );
}
