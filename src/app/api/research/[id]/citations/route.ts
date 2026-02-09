import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { checkCitations, transformCitationResults } from '@/services/apify/citationChecker';
import type { ResearchSession } from '@/lib/supabase/types';

/**
 * POST /api/research/[id]/citations
 *
 * Triggers citation check for a completed research session.
 * Uses GBP data from the session to check NAP consistency across 36+ directories.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Fetch the research session
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from('research_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !sessionData) {
      console.error('Failed to fetch session:', fetchError);
      return NextResponse.json(
        { error: 'Research session not found' },
        { status: 404 }
      );
    }

    // Cast to proper type
    const session = sessionData as unknown as ResearchSession;

    // Check if research is complete
    if (session.status !== 'completed') {
      return NextResponse.json(
        {
          error: 'Research must be completed before running citation check',
          status: session.status,
        },
        { status: 400 }
      );
    }

    // Get data from session
    const results = session.results as Record<string, unknown>;
    const input = session.input as {
      businessName: string;
      website: string;
      city?: string;
      state?: string;
    };

    // Get GBP data for citation check input
    const gbpData = results.gbp as {
      name?: string;
      phone?: string;
      address?: string;
      website?: string;
      mapsUrl?: string;
    } | undefined;

    if (!gbpData) {
      return NextResponse.json(
        { error: 'No Google Business Profile data available. GBP data is required for citation check.' },
        { status: 400 }
      );
    }

    // Use the business name from GBP if available (more accurate)
    const citationBusinessName = gbpData.name || input.businessName;

    // Parse GBP address into components
    let streetAddress = '';
    let citationCity = input.city;
    let citationState = input.state;

    if (gbpData.address) {
      const addressParts = gbpData.address.split(',').map(p => p.trim());
      if (addressParts.length >= 1) streetAddress = addressParts[0];
      if (addressParts.length >= 2) citationCity = addressParts[1];
      if (addressParts.length >= 3) {
        const stateZip = addressParts[2].trim().split(' ');
        citationState = stateZip[0];
      }
    }

    // Validate required fields
    if (!citationCity || !citationState) {
      return NextResponse.json(
        { error: 'City and state are required for citation check. Please ensure GBP data includes a complete address.' },
        { status: 400 }
      );
    }

    // Build providedUrls map if we have the GBP Maps URL
    const providedUrls: Record<string, string> = {};
    if (gbpData.mapsUrl) {
      providedUrls['Google Business'] = gbpData.mapsUrl;
    }

    console.log('Starting citation check for session:', sessionId);
    console.log('Citation check input:', {
      businessName: citationBusinessName,
      streetAddress,
      city: citationCity,
      state: citationState,
      phone: gbpData.phone,
      website: input.website,
      providedUrls,
    });

    // Run the citation check
    const citationResult = await checkCitations({
      businessName: citationBusinessName,
      streetAddress,
      city: citationCity,
      state: citationState,
      phone: gbpData.phone,
      website: input.website,
      preknownUrls: Object.keys(providedUrls).length > 0 ? providedUrls : undefined,
    });

    if (!citationResult.success) {
      console.error('Citation check failed:', citationResult.error);
      return NextResponse.json(
        { error: citationResult.error || 'Citation check failed' },
        { status: 500 }
      );
    }

    // Transform and store results
    const citations = transformCitationResults(citationResult);
    const citationSummary = {
      totalChecked: citationResult.totalDirectoriesChecked,
      found: citationResult.directoriesFound,
      withIssues: citationResult.directoriesWithIssues,
      napConsistencyScore: citationResult.napConsistencyScore,
      commonIssues: citationResult.commonIssues,
      recommendations: citationResult.recommendations,
      checkedAt: new Date().toISOString(),
    };

    // Update session with citation results
    const updatedResults = {
      ...results,
      citations,
      citationSummary,
    };

    await supabaseAdmin
      .from('research_sessions')
      .update({
        results: updatedResults,
      } as never)
      .eq('id', sessionId);

    console.log(`Citation check completed: ${citationResult.directoriesFound}/${citationResult.totalDirectoriesChecked} found, ${citationResult.napConsistencyScore}% consistent`);

    return NextResponse.json({
      success: true,
      sessionId,
      data: {
        citations,
        summary: citationSummary,
      },
    });
  } catch (error) {
    console.error('Error in citations endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to run citation check' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research/[id]/citations
 *
 * Returns the citation check results for a session if available.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Fetch the research session
    const { data: sessionData, error: fetchError } = await supabaseAdmin
      .from('research_sessions')
      .select('results')
      .eq('id', sessionId)
      .single();

    if (fetchError || !sessionData) {
      return NextResponse.json(
        { error: 'Research session not found' },
        { status: 404 }
      );
    }

    const results = (sessionData as { results: Record<string, unknown> }).results;

    if (!results.citations || !results.citationSummary) {
      return NextResponse.json(
        {
          success: false,
          error: 'Citation check not yet performed',
          available: false,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      data: {
        citations: results.citations,
        summary: results.citationSummary,
      },
    });
  } catch (error) {
    console.error('Error fetching citations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch citation results' },
      { status: 500 }
    );
  }
}
