import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type {
  ResearchInput,
  ResearchSession,
  TriggerResearchRequest,
  TriggerResearchResponse,
} from '@/types/research';

// In-memory storage for research sessions
// In production, replace with database (Supabase, etc.)
const researchSessions = new Map<string, ResearchSession>();

// Export for use by other routes
export { researchSessions };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, websiteUrl, location, gbpUrl, industry } = body as ResearchInput;

    // Validate required fields
    if (!businessName || !websiteUrl) {
      return NextResponse.json(
        { error: 'Business name and website URL are required' },
        { status: 400 }
      );
    }

    // Generate session ID
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    // Create research session
    const session: ResearchSession = {
      id: sessionId,
      input: { businessName, websiteUrl, location, gbpUrl, industry },
      status: 'pending',
      progress: {
        currentStep: 'initializing',
        completedSteps: [],
        failedSteps: [],
        percentage: 0,
      },
      results: {},
      errors: [],
      createdAt: now,
      updatedAt: now,
    };

    // Store session
    researchSessions.set(sessionId, session);

    // Check if n8n webhook URL is configured
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (n8nWebhookUrl) {
      // Trigger n8n workflow
      const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/research/callback`;

      const triggerPayload: TriggerResearchRequest = {
        sessionId,
        input: session.input,
        callbackUrl,
      };

      try {
        const n8nResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(process.env.N8N_WEBHOOK_SECRET && {
              'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET,
            }),
          },
          body: JSON.stringify(triggerPayload),
        });

        if (!n8nResponse.ok) {
          console.error('n8n webhook failed:', await n8nResponse.text());
          // Update session status but don't fail - allow fallback
          session.status = 'running';
          session.progress.currentStep = 'n8n_triggered';
        } else {
          const n8nResult = (await n8nResponse.json()) as TriggerResearchResponse;
          session.status = 'running';
          session.progress.currentStep = 'n8n_triggered';
          console.log('n8n workflow triggered:', n8nResult);
        }
      } catch (n8nError) {
        console.error('Failed to trigger n8n webhook:', n8nError);
        // Fall back to direct Apify execution
        session.progress.currentStep = 'fallback_mode';
        triggerFallbackResearch(sessionId, session.input);
      }
    } else {
      // No n8n configured - use fallback (direct Apify or mock)
      console.log('No N8N_WEBHOOK_URL configured, using fallback research');
      session.progress.currentStep = 'fallback_mode';
      triggerFallbackResearch(sessionId, session.input);
    }

    // Update session
    session.updatedAt = new Date().toISOString();
    researchSessions.set(sessionId, session);

    return NextResponse.json({
      sessionId,
      status: session.status,
      message: 'Research triggered successfully',
    });
  } catch (error) {
    console.error('Error triggering research:', error);
    return NextResponse.json(
      { error: 'Failed to trigger research' },
      { status: 500 }
    );
  }
}

// Fallback function when n8n is not available
async function triggerFallbackResearch(sessionId: string, input: ResearchInput) {
  const session = researchSessions.get(sessionId);
  if (!session) return;

  // Update to running
  session.status = 'running';
  session.updatedAt = new Date().toISOString();
  researchSessions.set(sessionId, session);

  // Simulate research steps (in production, call Apify directly)
  const steps = ['gbp', 'competitors', 'website', 'sitemap', 'seo'];

  for (const step of steps) {
    await simulateResearchStep(sessionId, step, input);
  }

  // Mark complete
  const finalSession = researchSessions.get(sessionId);
  if (finalSession) {
    finalSession.status = 'completed';
    finalSession.completedAt = new Date().toISOString();
    finalSession.progress.percentage = 100;
    finalSession.progress.currentStep = 'complete';
    researchSessions.set(sessionId, finalSession);
  }
}

async function simulateResearchStep(sessionId: string, step: string, input: ResearchInput) {
  const session = researchSessions.get(sessionId);
  if (!session) return;

  // Update progress
  session.progress.currentStep = step;
  session.progress.percentage = Math.min(
    ((session.progress.completedSteps.length + 1) / 5) * 100,
    100
  );
  session.updatedAt = new Date().toISOString();
  researchSessions.set(sessionId, session);

  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Generate mock data based on step
  switch (step) {
    case 'gbp':
      session.results.gbp = {
        name: input.businessName,
        rating: 4.5,
        reviewCount: 127,
        categories: ['Service Provider'],
        phone: '(555) 123-4567',
        address: input.location || 'Local Area',
        website: input.websiteUrl,
      };
      break;
    case 'competitors':
      session.results.competitors = [
        { rank: 1, name: 'Competitor A', rating: 4.7, reviewCount: 234 },
        { rank: 2, name: 'Competitor B', rating: 4.3, reviewCount: 156 },
        { rank: 3, name: 'Competitor C', rating: 4.1, reviewCount: 89 },
      ];
      break;
    case 'website':
      session.results.websiteCrawl = {
        cms: 'WordPress',
        technologies: ['React', 'Tailwind CSS'],
        ssl: true,
        mobileResponsive: true,
        structuredData: true,
        schemaTypes: ['LocalBusiness', 'Organization'],
        description: `${input.businessName} - Quality services in ${input.location || 'your area'}`,
        title: input.businessName,
        pages: [],
      };
      break;
    case 'sitemap':
      session.results.sitemap = {
        totalPages: 25,
        pageTypes: { services: 5, blog: 10, about: 1, contact: 1, other: 8 },
        hasServicePages: true,
        hasBlog: true,
        hasLocationPages: false,
        recentlyUpdated: 5,
      };
      break;
    case 'seo':
      session.results.seoAudit = {
        score: 75,
        mobile: { score: 80, usability: true, viewport: true, textSize: true },
        performance: { score: 70, lcp: 2800, fid: 50, cls: 0.1, ttfb: 400 },
        technical: {
          ssl: true,
          canonicalTag: true,
          robotsTxt: true,
          sitemap: true,
          structuredData: ['LocalBusiness'],
          metaDescription: true,
          h1Tags: 1,
        },
        content: {
          wordCount: 1500,
          headings: 8,
          images: 12,
          imagesWithAlt: 10,
          internalLinks: 15,
          externalLinks: 3,
        },
      };
      break;
  }

  // Mark step completed
  session.progress.completedSteps.push(step);
  session.updatedAt = new Date().toISOString();
  researchSessions.set(sessionId, session);
}
