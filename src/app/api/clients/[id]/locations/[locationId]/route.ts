import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/clients/[id]/locations/[locationId]
 * Get a single location
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const { id, locationId } = await params;

    const { data, error } = await supabaseAdmin
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .eq('client_id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ location: data });
  } catch (error) {
    console.error('Error in GET /api/clients/[id]/locations/[locationId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/clients/[id]/locations/[locationId]
 * Update a location
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const { id, locationId } = await params;
    const body = await request.json();

    const allowedFields = [
      'label', 'city', 'state', 'service_area', 'gbp_url',
      'address', 'zip', 'phone', 'is_primary', 'metadata',
    ];
    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('locations')
      .update(updateData as never)
      .eq('id', locationId)
      .eq('client_id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      );
    }

    return NextResponse.json({ location: data });
  } catch (error) {
    console.error('Error in PATCH /api/clients/[id]/locations/[locationId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[id]/locations/[locationId]
 * Delete a location
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const { id, locationId } = await params;

    const { error } = await supabaseAdmin
      .from('locations')
      .delete()
      .eq('id', locationId)
      .eq('client_id', id);

    if (error) {
      console.error('Error deleting location:', error);
      return NextResponse.json(
        { error: 'Failed to delete location' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/clients/[id]/locations/[locationId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
