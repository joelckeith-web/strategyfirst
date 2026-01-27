'use client';

import { useState } from 'react';
import { LocalSEOData } from '@/lib/types/intake';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LocalSEOProps {
  data: LocalSEOData;
  onChange: (data: LocalSEOData) => void;
  errors?: Record<string, string>;
}

export function LocalSEO({ data, onChange, errors = {} }: LocalSEOProps) {
  const [newCompetitor, setNewCompetitor] = useState({ name: '', website: '', location: '' });

  const handleChange = (field: keyof LocalSEOData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (field: keyof LocalSEOData, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ ...data, [field]: items });
  };

  const addCompetitor = () => {
    if (newCompetitor.name) {
      onChange({
        ...data,
        mainCompetitors: [...data.mainCompetitors, { ...newCompetitor }],
      });
      setNewCompetitor({ name: '', website: '', location: '' });
    }
  };

  const removeCompetitor = (index: number) => {
    const updated = data.mainCompetitors.filter((_, i) => i !== index);
    onChange({ ...data, mainCompetitors: updated });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Google Business Profile URL"
          placeholder="https://www.google.com/maps/place/..."
          type="url"
          value={data.googleBusinessProfileUrl}
          onChange={(e) => handleChange('googleBusinessProfileUrl', e.target.value)}
          error={errors.googleBusinessProfileUrl}
          helperText="Your GBP listing URL"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GBP Categories
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Plumber, Water Heater Repair Service, Drain Cleaning Service"
            value={data.gbpCategories.join(', ')}
            onChange={(e) => handleArrayChange('gbpCategories', e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">Primary and secondary GBP categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Current Google Rating"
          type="number"
          step="0.1"
          min="0"
          max="5"
          placeholder="4.8"
          value={data.currentGoogleRating || ''}
          onChange={(e) => handleChange('currentGoogleRating', parseFloat(e.target.value) || 0)}
          error={errors.currentGoogleRating}
        />

        <Input
          label="Total Reviews"
          type="number"
          min="0"
          placeholder="127"
          value={data.totalReviews || ''}
          onChange={(e) => handleChange('totalReviews', parseInt(e.target.value) || 0)}
          error={errors.totalReviews}
        />
      </div>

      {/* Competitors Section */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Main Competitors (up to 3)</h4>

        {data.mainCompetitors.length > 0 && (
          <div className="space-y-2 mb-4">
            {data.mainCompetitors.map((competitor, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{competitor.name}</p>
                  {competitor.website && (
                    <p className="text-sm text-gray-500">{competitor.website}</p>
                  )}
                  {competitor.location && (
                    <p className="text-sm text-gray-500">{competitor.location}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeCompetitor(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {data.mainCompetitors.length < 3 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Competitor name"
              value={newCompetitor.name}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
            />
            <Input
              placeholder="Website (optional)"
              value={newCompetitor.website}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, website: e.target.value })}
            />
            <Input
              placeholder="Location (optional)"
              value={newCompetitor.location}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, location: e.target.value })}
            />
            <Button type="button" variant="outline" onClick={addCompetitor}>
              Add
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Keywords
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="plumber austin, emergency plumbing, water heater repair"
            value={data.targetKeywords.join(', ')}
            onChange={(e) => handleArrayChange('targetKeywords', e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">Keywords you want to rank for</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Ranking Keywords
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Keywords you already rank well for (if known)"
            value={data.currentRankingKeywords.join(', ')}
            onChange={(e) => handleArrayChange('currentRankingKeywords', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local Directories Listed
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Yelp, Angi, HomeAdvisor, BBB, Yellow Pages"
            value={data.localDirectoriesListed.join(', ')}
            onChange={(e) => handleArrayChange('localDirectoriesListed', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Citation Sources
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Other sites where your business is listed"
            value={data.citationSources.join(', ')}
            onChange={(e) => handleArrayChange('citationSources', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Known NAP Consistency Issues
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="Any known issues with your Name, Address, Phone being inconsistent across directories..."
          value={data.napConsistencyIssues}
          onChange={(e) => handleChange('napConsistencyIssues', e.target.value)}
        />
        <p className="mt-1 text-sm text-gray-500">
          NAP = Name, Address, Phone number consistency
        </p>
      </div>
    </div>
  );
}
