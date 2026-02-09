import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/clients/[id]
 * Get a single client with locations and recent sessions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: client, error } = await supabaseAdmin
      .from('clients')
      .select('*, locations(*)')
      .eq('id', id)
      .single();

    if (error || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error in GET /api/clients/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/clients/[id]
 * Update a client
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      'business_name', 'website_url', 'gbp_url', 'primary_service_area',
      'phone', 'industry', 'notes', 'metadata', 'status',
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
      .from('clients')
      .update(updateData as never)
      .eq('id', id)
      .select('*, locations(*)')
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return NextResponse.json(
        { error: 'Failed to update client' },
        { status: 500 }
      );
    }

    return NextResponse.json({ client: data });
  } catch (error) {
    console.error('Error in PATCH /api/clients/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[id]
 * Delete a client (cascades to locations)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      return NextResponse.json(
        { error: 'Failed to delete client' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/clients/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
