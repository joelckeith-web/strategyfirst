'use client';

import { useState } from 'react';
import { ConversionMeasurementData } from '@/lib/types/intake';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ConversionMeasurementProps {
  data: ConversionMeasurementData;
  onChange: (data: ConversionMeasurementData) => void;
  errors?: Record<string, string>;
}

const CONVERSION_GOALS = [
  'Phone Calls',
  'Form Submissions',
  'Quote Requests',
  'Appointment Bookings',
  'Chat Conversations',
  'Email Signups',
];

export function ConversionMeasurement({ data, onChange, errors = {} }: ConversionMeasurementProps) {
  const [newLeadSource, setNewLeadSource] = useState({ source: '', percentage: 0 });

  const handleChange = (field: keyof ConversionMeasurementData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (field: keyof ConversionMeasurementData, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ ...data, [field]: items });
  };

  const handleCheckbox = (field: keyof ConversionMeasurementData) => {
    onChange({ ...data, [field]: !data[field] });
  };

  const addLeadSource = () => {
    if (newLeadSource.source) {
      onChange({
        ...data,
        leadSources: [...data.leadSources, { ...newLeadSource }],
      });
      setNewLeadSource({ source: '', percentage: 0 });
    }
  };

  const removeLeadSource = (index: number) => {
    const updated = data.leadSources.filter((_, i) => i !== index);
    onChange({ ...data, leadSources: updated });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Conversion Goal
          </label>
          <div className="space-y-2">
            {CONVERSION_GOALS.map((goal) => (
              <label key={goal} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="primaryConversionGoal"
                  value={goal}
                  checked={data.primaryConversionGoal === goal}
                  onChange={(e) => handleChange('primaryConversionGoal', e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secondary Conversion Goals
          </label>
          <div className="space-y-2">
            {CONVERSION_GOALS.filter(g => g !== data.primaryConversionGoal).map((goal) => (
              <label key={goal} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.secondaryConversionGoals.includes(goal)}
                  onChange={() => {
                    const updated = data.secondaryConversionGoals.includes(goal)
                      ? data.secondaryConversionGoals.filter(g => g !== goal)
                      : [...data.secondaryConversionGoals, goal];
                    handleChange('secondaryConversionGoals', updated);
                  }}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{goal}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Current Conversion Rate"
          placeholder="e.g., 3% or Unknown"
          value={data.currentConversionRate}
          onChange={(e) => handleChange('currentConversionRate', e.target.value)}
          error={errors.currentConversionRate}
          helperText="Website visitors to leads"
        />

        <Input
          label="Current Monthly Traffic"
          placeholder="e.g., 500 visitors"
          value={data.currentMonthlyTraffic}
          onChange={(e) => handleChange('currentMonthlyTraffic', e.target.value)}
          error={errors.currentMonthlyTraffic}
        />

        <Input
          label="Current Monthly Leads"
          placeholder="e.g., 20 leads"
          value={data.currentMonthlyLeads}
          onChange={(e) => handleChange('currentMonthlyLeads', e.target.value)}
          error={errors.currentMonthlyLeads}
        />
      </div>

      {/* Lead Sources Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Lead Sources (where do your leads come from?)</h4>

        {data.leadSources.length > 0 && (
          <div className="space-y-2 mb-4">
            {data.leadSources.map((source, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="font-medium text-gray-900">{source.source}</span>
                  <span className="text-sm text-gray-500">{source.percentage}%</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeLeadSource(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <p className="text-sm text-gray-500">
              Total: {data.leadSources.reduce((acc, s) => acc + s.percentage, 0)}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Source name (e.g., Google Search)"
            value={newLeadSource.source}
            onChange={(e) => setNewLeadSource({ ...newLeadSource, source: e.target.value })}
          />
          <Input
            type="number"
            min="0"
            max="100"
            placeholder="Percentage"
            value={newLeadSource.percentage || ''}
            onChange={(e) => setNewLeadSource({ ...newLeadSource, percentage: parseInt(e.target.value) || 0 })}
          />
          <Button type="button" variant="outline" onClick={addLeadSource}>
            Add Source
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="CRM System"
          placeholder="e.g., ServiceTitan, Housecall Pro, None"
          value={data.crmSystem}
          onChange={(e) => handleChange('crmSystem', e.target.value)}
          error={errors.crmSystem}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tracking Setup
          </label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.callTrackingSetup}
                onChange={() => handleCheckbox('callTrackingSetup')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Call Tracking</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.formTrackingSetup}
                onChange={() => handleCheckbox('formTrackingSetup')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Form Tracking</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lead Qualification Process
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Describe how you qualify leads. Do you have a sales team? What questions do you ask? How do you prioritize leads?"
          value={data.leadQualificationProcess}
          onChange={(e) => handleChange('leadQualificationProcess', e.target.value)}
        />
      </div>
    </div>
  );
}
