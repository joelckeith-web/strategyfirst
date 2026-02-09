import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/research/status/[sessionId]
 * Poll research status by session ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Fetch session from Supabase
    const { data: sessionData, error } = await supabaseAdmin
      .from('research_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Type the session data
    const session = sessionData as {
      id: string;
      client_id: string | null;
      location_id: string | null;
      status: string;
      progress: unknown;
      results: unknown;
      errors: unknown;
      input: unknown;
      created_at: string;
      updated_at: string;
      completed_at: string | null;
    };

    // Return session status and progress
    return NextResponse.json({
      sessionId: session.id,
      clientId: session.client_id,
      locationId: session.location_id,
      status: session.status,
      progress: session.progress,
      results: session.results,
      errors: session.errors,
      input: session.input,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      completedAt: session.completed_at,
    });
  } catch (error) {
    console.error('Error fetching research status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research status' },
      { status: 500 }
    );
  }
}
