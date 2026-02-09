import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/clients/[id]/sessions
 * Get audit history for a client. Supports ?locationId= filter.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    let query = supabaseAdmin
      .from('research_sessions')
      .select('id, client_id, location_id, input, status, progress, created_at, updated_at, completed_at')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions: data || [] });
  } catch (error) {
    console.error('Error in GET /api/clients/[id]/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
