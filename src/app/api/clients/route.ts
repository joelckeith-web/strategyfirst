import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * GET /api/clients
 * List all clients with their locations. Supports ?search= query param.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('clients')
      .select('*, locations(*)')
      .order('updated_at', { ascending: false });

    if (search) {
      query = query.or(
        `business_name.ilike.%${search}%,website_url.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json(
        { error: 'Failed to fetch clients' },
        { status: 500 }
      );
    }

    return NextResponse.json({ clients: data || [] });
  } catch (error) {
    console.error('Error in GET /api/clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Create a new client
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { business_name, website_url, gbp_url, primary_service_area, phone, industry, notes } = body;

    if (!business_name || !website_url || !primary_service_area) {
      return NextResponse.json(
        { error: 'business_name, website_url, and primary_service_area are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .insert({
        business_name,
        website_url,
        gbp_url: gbp_url || null,
        primary_service_area,
        phone: phone || null,
        industry: industry || null,
        notes: notes || null,
        status: 'active',
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      return NextResponse.json(
        { error: 'Failed to create client' },
        { status: 500 }
      );
    }

    return NextResponse.json({ client: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/clients:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
