import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { ResearchSessionInsert, Json } from '@/lib/supabase/types';

/**
 * Input payload expected by the n8n webhook
 */
interface N8NWebhookInput {
  // Required fields
  businessName: string;
  website: string;

  // Location for local SEO analysis
  city?: string;
  state?: string;
  serviceAreas?: string[];

  // Business context for keyword targeting
  industry?: string;
  primaryServices?: string[];

  // Callback configuration (added by this endpoint)
  sessionId: string;
  callbackUrl: string;
}

/**
 * Input from the client request
 */
interface TriggerRequestInput {
  businessName: string;
  websiteUrl?: string;
  website?: string;
  location?: string;
  city?: string;
  state?: string;
  serviceAreas?: string[];
  gbpUrl?: string;
  industry?: string;
  primaryServices?: string[];
}

/**
 * POST /api/research/trigger
 * Triggers the n8n research workflow
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TriggerRequestInput;

    // Normalize input (handle both websiteUrl and website)
    const website = body.website || body.websiteUrl;
    const businessName = body.businessName;

    // Validate required fields
    if (!businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    if (!website) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    // Validate website URL format
    try {
      new URL(website);
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL format' },
        { status: 400 }
      );
    }

    // Parse location into city/state if provided as single string
    let city = body.city;
    let state = body.state;
    if (!city && !state && body.location) {
      const locationParts = body.location.split(',').map(p => p.trim());
      if (locationParts.length >= 2) {
        city = locationParts[0];
        state = locationParts[1];
      } else {
        city = body.location;
      }
    }

    // Prepare input for storage
    const inputData = {
      businessName,
      website,
      city,
      state,
      serviceAreas: body.serviceAreas || [],
      industry: body.industry,
      primaryServices: body.primaryServices || [],
      gbpUrl: body.gbpUrl,
    };

    // Create research session in Supabase
    const sessionInsert: ResearchSessionInsert = {
      input: inputData as unknown as Json,
      status: 'pending',
      progress: {
        currentStep: 'initializing',
        completedSteps: [],
        failedSteps: [],
        percentage: 0,
      } as unknown as Json,
      results: {} as Json,
      errors: [] as unknown as Json,
    };

    const { data: sessionData, error: insertError } = await supabaseAdmin
      .from('research_sessions')
      .insert(sessionInsert as never)
      .select()
      .single();

    if (insertError || !sessionData) {
      console.error('Failed to create research session:', insertError);
      return NextResponse.json(
        { error: 'Failed to create research session' },
        { status: 500 }
      );
    }

    const session = sessionData as { id: string };
    const sessionId = session.id;

    // Check if n8n webhook URL is configured
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/research/callback`;

    if (n8nWebhookUrl) {
      // Prepare payload for n8n
      const n8nPayload: N8NWebhookInput = {
        businessName,
        website,
        city,
        state,
        serviceAreas: body.serviceAreas,
        industry: body.industry,
        primaryServices: body.primaryServices,
        sessionId,
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
          body: JSON.stringify(n8nPayload),
        });

        if (!n8nResponse.ok) {
          const errorText = await n8nResponse.text();
          console.error('n8n webhook failed:', errorText);

          // Update session with error and trigger fallback
          await supabaseAdmin
            .from('research_sessions')
            .update({
              status: 'running',
              progress: {
                currentStep: 'fallback_mode',
                completedSteps: [],
                failedSteps: [],
                percentage: 0,
              },
              errors: [{ step: 'trigger', code: 'N8N_ERROR', message: errorText, recoverable: true }],
            } as never)
            .eq('id', sessionId);

          // Trigger fallback research since n8n failed
          triggerFallbackResearch(sessionId, inputData);
        } else {
          const n8nResult = await n8nResponse.json();

          // Update session with n8n execution info
          await supabaseAdmin
            .from('research_sessions')
            .update({
              status: 'running',
              progress: {
                currentStep: 'n8n_triggered',
                completedSteps: [],
                failedSteps: [],
                percentage: 5,
              },
              n8n_execution_id: n8nResult.executionId || null,
              callback_url: callbackUrl,
            } as never)
            .eq('id', sessionId);

          console.log('n8n workflow triggered:', n8nResult);
        }
      } catch (n8nError) {
        console.error('Failed to trigger n8n webhook:', n8nError);

        // Update session to indicate fallback mode
        await supabaseAdmin
          .from('research_sessions')
          .update({
            status: 'running',
            progress: {
              currentStep: 'fallback_mode',
              completedSteps: [],
              failedSteps: [],
              percentage: 0,
            },
            errors: [{
              step: 'trigger',
              code: 'N8N_UNREACHABLE',
              message: n8nError instanceof Error ? n8nError.message : 'Failed to reach n8n',
              recoverable: true,
            }],
          } as never)
          .eq('id', sessionId);

        // Trigger fallback research (mock data for development)
        triggerFallbackResearch(sessionId, inputData);
      }
    } else {
      // No n8n configured - use fallback
      console.log('No N8N_WEBHOOK_URL configured, using fallback research');

      await supabaseAdmin
        .from('research_sessions')
        .update({
          status: 'running',
          progress: {
            currentStep: 'fallback_mode',
            completedSteps: [],
            failedSteps: [],
            percentage: 0,
          },
        } as never)
        .eq('id', sessionId);

      triggerFallbackResearch(sessionId, inputData);
    }

    return NextResponse.json({
      sessionId,
      status: 'running',
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

/**
 * Fallback research function when n8n is not available
 * Generates mock data for development/testing
 */
async function triggerFallbackResearch(
  sessionId: string,
  input: {
    businessName: string;
    website: string;
    city?: string;
    state?: string;
    industry?: string;
  }
) {
  const steps = ['gbp', 'competitors', 'website', 'sitemap', 'seo', 'citations'];

  // Keep accumulated results in memory to avoid race conditions
  let accumulatedResults: Record<string, unknown> = {};

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    // Update progress
    await supabaseAdmin
      .from('research_sessions')
      .update({
        progress: {
          currentStep: step,
          completedSteps: steps.slice(0, i),
          failedSteps: [],
          percentage: Math.round(((i + 0.5) / steps.length) * 100),
        },
      } as never)
      .eq('id', sessionId);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate mock data based on step
    let stepData: Record<string, unknown> = {};
    switch (step) {
      case 'gbp':
        stepData = {
          gbp: {
            name: input.businessName,
            rating: 4.5,
            reviewCount: 127,
            categories: [input.industry || 'Service Provider'],
            phone: '(555) 123-4567',
            address: `${input.city || 'Local Area'}, ${input.state || ''}`.trim(),
            website: input.website,
          },
        };
        break;
      case 'competitors':
        stepData = {
          competitors: [
            { rank: 1, name: 'Competitor A', rating: 4.7, reviewCount: 234 },
            { rank: 2, name: 'Competitor B', rating: 4.3, reviewCount: 156 },
            { rank: 3, name: 'Competitor C', rating: 4.1, reviewCount: 89 },
          ],
        };
        break;
      case 'website':
        stepData = {
          websiteCrawl: {
            cms: 'WordPress',
            technologies: ['React', 'Tailwind CSS'],
            ssl: input.website.startsWith('https'),
            mobileResponsive: true,
            structuredData: true,
            schemaTypes: ['LocalBusiness', 'Organization'],
            description: `${input.businessName} - Quality services`,
            title: input.businessName,
            pages: [],
          },
        };
        break;
      case 'sitemap':
        stepData = {
          sitemap: {
            totalPages: 25,
            pageTypes: { services: 5, blog: 10, about: 1, contact: 1, other: 8 },
            hasServicePages: true,
            hasBlog: true,
            hasLocationPages: false,
            recentlyUpdated: 5,
          },
        };
        break;
      case 'seo':
        stepData = {
          seoAudit: {
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
          },
        };
        break;
      case 'citations':
        stepData = {
          citations: [
            { source: 'Yelp', found: true, napConsistent: true },
            { source: 'BBB', found: true, napConsistent: false },
            { source: 'Yellow Pages', found: false },
          ],
        };
        break;
    }

    // Accumulate results in memory
    accumulatedResults = { ...accumulatedResults, ...stepData };

    // Update results
    await supabaseAdmin
      .from('research_sessions')
      .update({
        results: accumulatedResults,
        progress: {
          currentStep: step,
          completedSteps: [...steps.slice(0, i), step],
          failedSteps: [],
          percentage: Math.round(((i + 1) / steps.length) * 100),
        },
      } as never)
      .eq('id', sessionId);
  }

  // Mark complete
  await supabaseAdmin
    .from('research_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      progress: {
        currentStep: 'complete',
        completedSteps: steps,
        failedSteps: [],
        percentage: 100,
      },
    } as never)
    .eq('id', sessionId);
}
