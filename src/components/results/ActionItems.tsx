'use client';

import { Card, CardHeader, CardBody } from '@/components/ui/Card';

export interface ActionItem {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: string;
  effort: 'quick' | 'medium' | 'significant';
}

interface ActionItemsProps {
  items: ActionItem[];
  title?: string;
}

const priorityStyles = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const effortLabels = {
  quick: 'Quick Win',
  medium: 'Medium Effort',
  significant: 'Major Project',
};

const effortStyles = {
  quick: 'bg-green-50 text-green-600',
  medium: 'bg-yellow-50 text-yellow-600',
  significant: 'bg-red-50 text-red-600',
};

export function ActionItems({ items, title = 'Recommended Actions' }: ActionItemsProps) {
  const highPriority = items.filter(i => i.priority === 'high');
  const mediumPriority = items.filter(i => i.priority === 'medium');
  const lowPriority = items.filter(i => i.priority === 'low');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <span className="text-sm text-gray-500">{items.length} recommendations</span>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        {/* High Priority */}
        {highPriority.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              High Priority
            </h4>
            <div className="space-y-3">
              {highPriority.map((item) => (
                <ActionItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Medium Priority */}
        {mediumPriority.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-700 flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Medium Priority
            </h4>
            <div className="space-y-3">
              {mediumPriority.map((item) => (
                <ActionItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Low Priority */}
        {lowPriority.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 flex items-center gap-2 mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Future Improvements
            </h4>
            <div className="space-y-3">
              {lowPriority.map((item) => (
                <ActionItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-2 text-gray-500">No action items to display</p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function ActionItemCard({ item }: { item: ActionItem }) {
  return (
    <div className={`p-4 rounded-lg border ${priorityStyles[item.priority]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 bg-white/50 rounded">
              {item.category}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${effortStyles[item.effort]}`}>
              {effortLabels[item.effort]}
            </span>
          </div>
          <h5 className="font-medium text-gray-900">{item.title}</h5>
          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            <strong>Expected Impact:</strong> {item.impact}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate action items from analysis data
export function generateActionItems(analysisData: {
  gbpMetrics?: { rating: number; totalReviews: number; responseRate: number; photoCount: number };
  seoMetrics?: { domainAuthority: number; mobileScore: number; pageSpeedMobile: number };
  sitemapAnalysis?: { hasServicePages: boolean; hasBlog: boolean; hasLocationPages: boolean };
  intake?: { aiConsiderations: { hasStructuredData: boolean; hasFAQContent: boolean } };
}): ActionItem[] {
  const items: ActionItem[] = [];

  // GBP-related actions
  if (analysisData.gbpMetrics) {
    const { rating, totalReviews, responseRate, photoCount } = analysisData.gbpMetrics;

    if (totalReviews < 50) {
      items.push({
        id: 'gbp-reviews',
        priority: 'high',
        category: 'Google Business Profile',
        title: 'Increase Review Volume',
        description: 'Implement a review request system to grow your Google review count.',
        impact: 'Higher local rankings and increased trust',
        effort: 'medium',
      });
    }

    if (responseRate < 80) {
      items.push({
        id: 'gbp-responses',
        priority: 'medium',
        category: 'Google Business Profile',
        title: 'Respond to All Reviews',
        description: 'Set up a process to respond to all reviews within 24-48 hours.',
        impact: 'Improved customer engagement and SEO signals',
        effort: 'quick',
      });
    }

    if (photoCount < 10) {
      items.push({
        id: 'gbp-photos',
        priority: 'medium',
        category: 'Google Business Profile',
        title: 'Add More GBP Photos',
        description: 'Upload professional photos of your work, team, and office.',
        impact: 'Better visual appeal and engagement',
        effort: 'quick',
      });
    }
  }

  // SEO-related actions
  if (analysisData.seoMetrics) {
    const { mobileScore, pageSpeedMobile } = analysisData.seoMetrics;

    if (mobileScore && mobileScore < 80) {
      items.push({
        id: 'seo-mobile',
        priority: 'high',
        category: 'Technical SEO',
        title: 'Improve Mobile Experience',
        description: 'Optimize your website for mobile users with responsive design improvements.',
        impact: 'Better mobile rankings and user experience',
        effort: 'significant',
      });
    }

    if (pageSpeedMobile && pageSpeedMobile < 70) {
      items.push({
        id: 'seo-speed',
        priority: 'high',
        category: 'Technical SEO',
        title: 'Improve Page Load Speed',
        description: 'Optimize images, enable caching, and minimize code to speed up your site.',
        impact: 'Better user experience and SEO rankings',
        effort: 'medium',
      });
    }
  }

  // Content-related actions
  if (analysisData.sitemapAnalysis) {
    const { hasServicePages, hasBlog, hasLocationPages } = analysisData.sitemapAnalysis;

    if (!hasServicePages) {
      items.push({
        id: 'content-services',
        priority: 'high',
        category: 'Content',
        title: 'Create Service Pages',
        description: 'Build dedicated pages for each service you offer with detailed information.',
        impact: 'Better keyword targeting and conversions',
        effort: 'significant',
      });
    }

    if (!hasBlog) {
      items.push({
        id: 'content-blog',
        priority: 'medium',
        category: 'Content',
        title: 'Start a Blog',
        description: 'Create helpful content that answers common customer questions.',
        impact: 'Improved organic traffic and authority',
        effort: 'significant',
      });
    }

    if (!hasLocationPages) {
      items.push({
        id: 'content-locations',
        priority: 'medium',
        category: 'Content',
        title: 'Create Location Pages',
        description: 'Build pages for each service area to improve local visibility.',
        impact: 'Better local SEO for multiple areas',
        effort: 'medium',
      });
    }
  }

  // AI/AEO actions
  if (analysisData.intake?.aiConsiderations) {
    const { hasStructuredData, hasFAQContent } = analysisData.intake.aiConsiderations;

    if (!hasStructuredData) {
      items.push({
        id: 'aeo-schema',
        priority: 'medium',
        category: 'AI Optimization',
        title: 'Add Structured Data',
        description: 'Implement LocalBusiness and Service schema markup on your website.',
        impact: 'Better AI search visibility and rich results',
        effort: 'medium',
      });
    }

    if (!hasFAQContent) {
      items.push({
        id: 'aeo-faq',
        priority: 'medium',
        category: 'AI Optimization',
        title: 'Create FAQ Content',
        description: 'Add FAQ sections to service pages with common customer questions.',
        impact: 'Featured snippets and AI answer box eligibility',
        effort: 'medium',
      });
    }
  }

  return items;
}
