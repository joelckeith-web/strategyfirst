import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { ResearchSession } from '@/lib/supabase/types';

/**
 * POST /api/research/[id]/verify
 *
 * Saves manual verification data for a session.
 * This data will be used in subsequent AI analyses to improve confidence.
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

    // Parse request body
    const body = await request.json();
    const { manualInput } = body as {
      manualInput: Record<string, Record<string, unknown>>;
    };

    if (!manualInput || typeof manualInput !== 'object') {
      return NextResponse.json(
        { error: 'Manual input data is required' },
        { status: 400 }
      );
    }

    // Fetch the current session
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

    const session = sessionData as unknown as ResearchSession;

    // Get existing results and manual input
    const currentResults = (session.results as Record<string, unknown>) || {};
    const existingManualInput = (currentResults.manualInput as Record<string, unknown>) || {};

    // Merge new manual input with existing (deep merge by category)
    const mergedManualInput: Record<string, Record<string, unknown>> = {};

    // First, copy existing manual input
    for (const [category, fields] of Object.entries(existingManualInput)) {
      if (typeof fields === 'object' && fields !== null) {
        mergedManualInput[category] = { ...(fields as Record<string, unknown>) };
      }
    }

    // Then, merge in new manual input
    for (const [category, fields] of Object.entries(manualInput)) {
      if (typeof fields === 'object' && fields !== null) {
        if (!mergedManualInput[category]) {
          mergedManualInput[category] = {};
        }
        mergedManualInput[category] = {
          ...mergedManualInput[category],
          ...fields,
        };
      }
    }

    // Update session with merged manual input
    const updatedResults = {
      ...currentResults,
      manualInput: mergedManualInput,
      manualInputUpdatedAt: new Date().toISOString(),
    };

    const { error: updateError } = await supabaseAdmin
      .from('research_sessions')
      .update({
        results: updatedResults,
      } as never)
      .eq('id', sessionId);

    if (updateError) {
      console.error('Failed to update session:', updateError);
      return NextResponse.json(
        { error: 'Failed to save verification data' },
        { status: 500 }
      );
    }

    // Count how many fields were saved
    let fieldCount = 0;
    for (const fields of Object.values(mergedManualInput)) {
      if (typeof fields === 'object' && fields !== null) {
        fieldCount += Object.keys(fields).length;
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      fieldsSaved: fieldCount,
      message: 'Verification data saved successfully. Ready for re-analysis.',
    });
  } catch (error) {
    console.error('Error in verify endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to save verification data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/research/[id]/verify
 *
 * Returns the current manual input data for a session.
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

    // Fetch the session
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

    const results = (sessionData as { results: Record<string, unknown> }).results || {};
    const manualInput = results.manualInput || {};
    const updatedAt = results.manualInputUpdatedAt || null;

    return NextResponse.json({
      success: true,
      sessionId,
      manualInput,
      updatedAt,
    });
  } catch (error) {
    console.error('Error fetching verification data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification data' },
      { status: 500 }
    );
  }
}
