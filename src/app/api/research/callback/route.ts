import { NextRequest, NextResponse } from 'next/server';
import type { ResearchCallbackPayload, ResearchSession } from '@/types/research';

// Import the shared sessions map from trigger route
// In production, this would be a database query
import { researchSessions } from '../trigger/route';

// POST - Receive callback from n8n when a step completes
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

    const payload = (await request.json()) as ResearchCallbackPayload;
    const { sessionId, step, status, data, error } = payload;

    // Find the session
    const session = researchSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session based on step
    session.updatedAt = new Date().toISOString();

    if (status === 'completed' && data) {
      // Store the results for this step
      switch (step) {
        case 'gbp':
          session.results.gbp = data as ResearchSession['results']['gbp'];
          session.progress.completedSteps.push('gbp');
          break;
        case 'competitors':
          session.results.competitors = data as ResearchSession['results']['competitors'];
          session.progress.completedSteps.push('competitors');
          break;
        case 'seo':
          session.results.seoAudit = data as ResearchSession['results']['seoAudit'];
          session.progress.completedSteps.push('seo');
          break;
        case 'sitemap':
          session.results.sitemap = data as ResearchSession['results']['sitemap'];
          session.progress.completedSteps.push('sitemap');
          break;
        case 'website':
          session.results.websiteCrawl = data as ResearchSession['results']['websiteCrawl'];
          session.progress.completedSteps.push('website');
          break;
        case 'citations':
          session.results.citations = data as ResearchSession['results']['citations'];
          session.progress.completedSteps.push('citations');
          break;
        case 'complete':
          // Final callback - mark session complete
          session.status = 'completed';
          session.completedAt = new Date().toISOString();
          session.progress.percentage = 100;
          session.progress.currentStep = 'complete';
          // Merge any final metadata
          if (data && typeof data === 'object' && 'metadata' in data) {
            session.results.metadata = (data as { metadata: ResearchSession['results']['metadata'] }).metadata;
          }
          break;
      }
    } else if (status === 'failed') {
      // Handle step failure
      session.progress.failedSteps.push(step);
      if (error) {
        session.errors.push(error);
      }
    }

    // Update progress percentage
    const totalSteps = 6; // gbp, competitors, seo, sitemap, website, citations
    const completedCount = session.progress.completedSteps.length;
    session.progress.percentage = Math.round((completedCount / totalSteps) * 100);
    session.progress.currentStep = step;

    // Check if all steps are done (either completed or failed)
    const processedSteps = new Set([
      ...session.progress.completedSteps,
      ...session.progress.failedSteps,
    ]);

    if (processedSteps.size >= totalSteps && session.status !== 'completed') {
      if (session.progress.failedSteps.length === totalSteps) {
        session.status = 'failed';
      } else if (session.progress.failedSteps.length > 0) {
        session.status = 'partial';
      } else {
        session.status = 'completed';
      }
      session.completedAt = new Date().toISOString();
    }

    // Save updated session
    researchSessions.set(sessionId, session);

    return NextResponse.json({
      success: true,
      sessionId,
      status: session.status,
      progress: session.progress,
    });
  } catch (error) {
    console.error('Error processing callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback' },
      { status: 500 }
    );
  }
}

// PATCH - Update session status (alternative to POST)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, status, results, errors } = body;

    const session = researchSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Merge updates
    if (status) session.status = status;
    if (results) session.results = { ...session.results, ...results };
    if (errors) session.errors = [...session.errors, ...errors];

    session.updatedAt = new Date().toISOString();

    if (status === 'completed' || status === 'failed' || status === 'partial') {
      session.completedAt = new Date().toISOString();
    }

    researchSessions.set(sessionId, session);

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
