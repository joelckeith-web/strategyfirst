'use client';

import { ToneVoiceData } from '@/lib/types/intake';
import { Select } from '@/components/ui/Input';

interface ToneVoiceProps {
  data: ToneVoiceData;
  onChange: (data: ToneVoiceData) => void;
  errors?: Record<string, string>;
}

const COMMUNICATION_STYLES = [
  { value: 'formal', label: 'Formal & Professional' },
  { value: 'casual', label: 'Casual & Relaxed' },
  { value: 'professional', label: 'Professional but Approachable' },
  { value: 'friendly', label: 'Warm & Friendly' },
  { value: 'authoritative', label: 'Expert & Authoritative' },
];

const PERSONALITY_OPTIONS = [
  'Trustworthy',
  'Expert',
  'Friendly',
  'Professional',
  'Innovative',
  'Family-oriented',
  'Community-focused',
  'Reliable',
  'Fast/Responsive',
  'Affordable',
  'Premium/High-end',
  'Eco-friendly',
];

const EMOTION_OPTIONS = [
  'Trust & Security',
  'Relief from Problems',
  'Confidence',
  'Peace of Mind',
  'Urgency',
  'Value/Savings',
  'Quality Assurance',
  'Family Safety',
];

export function ToneVoice({ data, onChange, errors = {} }: ToneVoiceProps) {
  const handleChange = (field: keyof ToneVoiceData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  const handleArrayChange = (field: keyof ToneVoiceData, value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ ...data, [field]: items });
  };

  const toggleArrayItem = (field: keyof ToneVoiceData, item: string) => {
    const currentArray = data[field] as string[];
    const updated = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    handleChange(field, updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand Personality (select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PERSONALITY_OPTIONS.map((option) => (
            <label
              key={option}
              className={`
                flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-colors
                ${data.brandPersonality.includes(option)
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={data.brandPersonality.includes(option)}
                onChange={() => toggleArrayItem('brandPersonality', option)}
                className="sr-only"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <Select
        label="Communication Style"
        options={COMMUNICATION_STYLES}
        value={data.communicationStyle}
        onChange={(e) => handleChange('communicationStyle', e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Emotions (what should customers feel?)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {EMOTION_OPTIONS.map((option) => (
            <label
              key={option}
              className={`
                flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-colors
                ${data.targetEmotions.includes(option)
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={data.targetEmotions.includes(option)}
                onChange={() => toggleArrayItem('targetEmotions', option)}
                className="sr-only"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Common Customer Objections
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Too expensive, Not sure if you service my area, Want to compare quotes, Need to think about it"
            value={data.commonObjections.join(', ')}
            onChange={(e) => handleArrayChange('commonObjections', e.target.value)}
          />
          <p className="mt-1 text-sm text-gray-500">What reasons do prospects give for not buying?</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Trust Signals You Have
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Licensed, Bonded, Insured, BBB Accredited, Manufacturer certified, Awards"
            value={data.trustSignals.join(', ')}
            onChange={(e) => handleArrayChange('trustSignals', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Social Proof Available
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Customer testimonials, Before/after photos, Video reviews, Case studies, Press mentions"
            value={data.socialProofAvailable.join(', ')}
            onChange={(e) => handleArrayChange('socialProofAvailable', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What Differentiates You From Competitors?
          </label>
          <textarea
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="What do you do better or differently than your competitors?"
            value={data.competitorDifferentiators.join(', ')}
            onChange={(e) => handleArrayChange('competitorDifferentiators', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Words/Phrases to Avoid in Messaging
        </label>
        <textarea
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={2}
          placeholder="Cheap, Budget, Discount, etc. - words that don't fit your brand"
          value={data.messagingDontUse.join(', ')}
          onChange={(e) => handleArrayChange('messagingDontUse', e.target.value)}
        />
        <p className="mt-1 text-sm text-gray-500">Terms that don&apos;t align with your brand</p>
      </div>
    </div>
  );
}
