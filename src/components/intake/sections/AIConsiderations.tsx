'use client';

import { AIConsiderationsData } from '@/lib/types/intake';
import { Select } from '@/components/ui/Input';

interface AIConsiderationsProps {
  data: AIConsiderationsData;
  onChange: (data: AIConsiderationsData) => void;
  errors?: Record<string, string>;
}

const AI_VISIBILITY_OPTIONS = [
  { value: 'none', label: 'Not visible at all' },
  { value: 'some', label: 'Occasionally appears' },
  { value: 'good', label: 'Frequently appears' },
  { value: 'unknown', label: "Don't know" },
];

const CONTENT_FORMAT_OPTIONS = [
  'FAQ Pages',
  'How-to Guides',
  'Video Content',
  'Infographics',
  'Comparison Tables',
  'Step-by-step Tutorials',
  'Q&A Format',
  'Listicles',
];

const AI_TOOLS = [
  'ChatGPT',
  'Claude',
  'Jasper',
  'Copy.ai',
  'Surfer SEO',
  'Frase',
  'MarketMuse',
  'None',
];

export function AIConsiderations({ data, onChange, errors = {} }: AIConsiderationsProps) {
  const handleChange = (field: keyof AIConsiderationsData, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  const handleCheckbox = (field: keyof AIConsiderationsData) => {
    onChange({ ...data, [field]: !data[field] });
  };

  const toggleArrayItem = (field: keyof AIConsiderationsData, item: string) => {
    const currentArray = data[field] as string[];
    const updated = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    handleChange(field, updated);
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">About AI/AEO (Answer Engine Optimization)</h4>
        <p className="text-sm text-blue-800">
          AI search tools like ChatGPT, Perplexity, and Google&apos;s AI Overviews are changing how people find businesses.
          This section helps us understand your readiness for AI-powered search and optimize your content accordingly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={data.awareOfAISearch}
              onChange={() => handleCheckbox('awareOfAISearch')}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              I&apos;m aware of AI search tools (ChatGPT, Perplexity, etc.)
            </span>
          </label>

          <Select
            label="Current AI Search Visibility"
            options={AI_VISIBILITY_OPTIONS}
            value={data.currentAIVisibility}
            onChange={(e) => handleChange('currentAIVisibility', e.target.value as AIConsiderationsData['currentAIVisibility'])}
          />
          <p className="mt-1 text-sm text-gray-500">
            Do AI tools mention your business when asked about services in your area?
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technical Readiness
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasStructuredData}
                onChange={() => handleCheckbox('hasStructuredData')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Has Schema/Structured Data</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasFAQContent}
                onChange={() => handleCheckbox('hasFAQContent')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Has FAQ Content on Website</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.voiceSearchOptimized}
                onChange={() => handleCheckbox('voiceSearchOptimized')}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Optimized for Voice Search</span>
            </label>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Format Preferences (what types of content interest you?)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CONTENT_FORMAT_OPTIONS.map((format) => (
            <label
              key={format}
              className={`
                flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-colors
                ${data.contentFormatPreferences.includes(format)
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={data.contentFormatPreferences.includes(format)}
                onChange={() => toggleArrayItem('contentFormatPreferences', format)}
                className="sr-only"
              />
              <span className="text-sm">{format}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Tools Currently Using
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {AI_TOOLS.map((tool) => (
            <label
              key={tool}
              className={`
                flex items-center justify-center px-3 py-2 rounded-lg border cursor-pointer transition-colors
                ${data.aiToolsCurrentlyUsing.includes(tool)
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <input
                type="checkbox"
                checked={data.aiToolsCurrentlyUsing.includes(tool)}
                onChange={() => toggleArrayItem('aiToolsCurrentlyUsing', tool)}
                className="sr-only"
              />
              <span className="text-sm">{tool}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.openToAIContent}
            onChange={() => handleCheckbox('openToAIContent')}
            className="h-4 w-4 mt-1 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">
              Open to AI-Assisted Content Creation
            </span>
            <p className="text-sm text-gray-500 mt-1">
              Are you comfortable with AI helping to create, optimize, or enhance your website content
              (with human review and approval)?
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
