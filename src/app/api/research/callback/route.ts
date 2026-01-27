import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { transformApifyResultsToResearch } from '@/lib/transformers';
import type { N8NCallbackPayload } from '@/types/apify-outputs';

/**
 * POST /api/research/callback
 * Receives callbacks from n8n when research steps complete
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const secret = process.env.N8N_WEBHOOK_SECRET;
    if (secret) {
      const providedSecret = request.headers.get('X-Webhook-Secret');
      if (providedSecret !== secret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const payload = (await request.json()) as N8NCallbackPayload;
    const { sessionId, status, step, data, apifyResults, errors, executionId } = payload;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Find the session in Supabase
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from('research_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !sessionData) {
      console.error('Session not found:', sessionId, fetchError);
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Type the session data
    const session = sessionData as {
      id: string;
      status: string;
      progress: unknown;
      results: unknown;
      errors: unknown;
      input: unknown;
      n8n_execution_id: string | null;
    };

    // Get current state
    const currentResults = (session.results as Record<string, unknown>) || {};
    const currentProgress = (session.progress as {
      currentStep: string;
      completedSteps: string[];
      failedSteps: string[];
      percentage: number;
    }) || {
      currentStep: '',
      completedSteps: [],
      failedSteps: [],
      percentage: 0,
    };
    const currentErrors = (session.errors as Array<{
      step: string;
      code?: string;
      message: string;
      recoverable?: boolean;
    }>) || [];

    // Get input for transformations
    const input = session.input as {
      businessName?: string;
      website?: string;
    };
    const businessName = input?.businessName || '';
    const websiteUrl = input?.website || '';

    // Handle different callback formats

    // Format 1: Complete n8n response with apifyResults
    if (apifyResults && status === 'completed') {
      const transformedResults = transformApifyResultsToResearch(
        apifyResults,
        businessName,
        websiteUrl
      );

      await supabaseAdmin
        .from('research_sessions')
        .update({
          status: 'completed',
          results: { ...currentResults, ...transformedResults },
          progress: {
            currentStep: 'complete',
            completedSteps: ['gbp', 'competitors', 'website', 'sitemap', 'seo', 'citations'],
            failedSteps: [],
            percentage: 100,
          },
          completed_at: new Date().toISOString(),
          n8n_execution_id: executionId || session.n8n_execution_id,
        } as never)
        .eq('id', sessionId);

      return NextResponse.json({
        success: true,
        sessionId,
        status: 'completed',
      });
    }

    // Format 2: Step-by-step callbacks
    if (step) {
      const totalSteps = 6; // gbp, competitors, seo, sitemap, website, citations
      let newResults = { ...currentResults };
      let completedSteps = [...currentProgress.completedSteps];
      let failedSteps = [...currentProgress.failedSteps];
      let newErrors = [...currentErrors];
      let sessionStatus = session.status;

      if (status === 'completed' && data) {
        // Store the results for this step
        switch (step) {
          case 'gbp':
            newResults.gbp = data;
            if (!completedSteps.includes('gbp')) completedSteps.push('gbp');
            break;
          case 'competitors':
            newResults.competitors = data;
            if (!completedSteps.includes('competitors')) completedSteps.push('competitors');
            break;
          case 'seo':
            newResults.seoAudit = data;
            if (!completedSteps.includes('seo')) completedSteps.push('seo');
            break;
          case 'sitemap':
            newResults.sitemap = data;
            if (!completedSteps.includes('sitemap')) completedSteps.push('sitemap');
            break;
          case 'website':
            newResults.websiteCrawl = data;
            if (!completedSteps.includes('website')) completedSteps.push('website');
            break;
          case 'citations':
            newResults.citations = data;
            if (!completedSteps.includes('citations')) completedSteps.push('citations');
            break;
          case 'complete':
            // Final callback - mark session complete
            sessionStatus = 'completed';
            // Merge any final metadata
            if (data && typeof data === 'object' && 'metadata' in data) {
              newResults.metadata = (data as { metadata: unknown }).metadata;
            }
            break;
        }
      } else if (status === 'failed') {
        // Handle step failure
        if (!failedSteps.includes(step)) {
          failedSteps.push(step);
        }
        if (errors && errors.length > 0) {
          newErrors = [...newErrors, ...errors];
        } else if (payload.errors) {
          newErrors = [...newErrors, ...payload.errors];
        }
      }

      // Calculate progress percentage
      const completedCount = completedSteps.length;
      const percentage = step === 'complete' ? 100 : Math.round((completedCount / totalSteps) * 100);

      // Determine final status if all steps are processed
      const processedSteps = new Set([...completedSteps, ...failedSteps]);
      if (processedSteps.size >= totalSteps && sessionStatus !== 'completed') {
        if (failedSteps.length === totalSteps) {
          sessionStatus = 'failed';
        } else if (failedSteps.length > 0) {
          sessionStatus = 'partial';
        } else {
          sessionStatus = 'completed';
        }
      }

      // Update session
      const updateData: Record<string, unknown> = {
        status: sessionStatus,
        results: newResults,
        progress: {
          currentStep: step,
          completedSteps,
          failedSteps,
          percentage,
        },
        errors: newErrors,
      };

      if (sessionStatus === 'completed' || sessionStatus === 'failed' || sessionStatus === 'partial') {
        updateData.completed_at = new Date().toISOString();
      }

      await supabaseAdmin
        .from('research_sessions')
        .update(updateData as never)
        .eq('id', sessionId);

      return NextResponse.json({
        success: true,
        sessionId,
        status: sessionStatus,
        progress: {
          currentStep: step,
          completedSteps,
          failedSteps,
          percentage,
        },
      });
    }

    // Format 3: Status update without step (general update)
    if (status) {
      const updateData: Record<string, unknown> = {
        status,
      };

      if (errors && errors.length > 0) {
        updateData.errors = [...currentErrors, ...errors];
      }

      if (status === 'completed' || status === 'failed' || status === 'partial') {
        updateData.completed_at = new Date().toISOString();
      }

      await supabaseAdmin
        .from('research_sessions')
        .update(updateData as never)
        .eq('id', sessionId);

      return NextResponse.json({
        success: true,
        sessionId,
        status,
      });
    }

    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Callback received but no action taken',
    });
  } catch (error) {
    console.error('Error processing callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/research/callback
 * Alternative endpoint for updating session status
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, status, results, errors } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Find the session
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from('research_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Type the session data
    const session = sessionData as {
      results: unknown;
      errors: unknown;
    };

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
    }

    if (results) {
      const currentResults = (session.results as Record<string, unknown>) || {};
      updateData.results = { ...currentResults, ...results };
    }

    if (errors) {
      const currentErrors = (session.errors as unknown[]) || [];
      updateData.errors = [...currentErrors, ...errors];
    }

    if (status === 'completed' || status === 'failed' || status === 'partial') {
      updateData.completed_at = new Date().toISOString();
    }

    // Update session
    const { data: updatedSession, error: updateError } = await supabaseAdmin
      .from('research_sessions')
      .update(updateData as never)
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update session:', updateError);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
