import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/clients/[id]/locations
 * List all locations for a client
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .eq('client_id', id)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching locations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ locations: data || [] });
  } catch (error) {
    console.error('Error in GET /api/clients/[id]/locations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients/[id]/locations
 * Create a new location for a client
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { label, city, state, service_area, gbp_url, address, zip, phone, is_primary } = body;

    if (!label || !city || !state) {
      return NextResponse.json(
        { error: 'label, city, and state are required' },
        { status: 400 }
      );
    }

    // Verify client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('id', id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('locations')
      .insert({
        client_id: id,
        label,
        city,
        state,
        service_area: service_area || `${city}, ${state}`,
        gbp_url: gbp_url || null,
        address: address || null,
        zip: zip || null,
        phone: phone || null,
        is_primary: is_primary || false,
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      return NextResponse.json(
        { error: 'Failed to create location' },
        { status: 500 }
      );
    }

    return NextResponse.json({ location: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients/[id]/locations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
