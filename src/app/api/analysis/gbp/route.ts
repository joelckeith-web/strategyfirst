import { NextRequest, NextResponse } from 'next/server';
import {
  getGooglePlaceByUrl,
  searchGooglePlaces,
  extractGbpMetrics,
} from '@/services/apify/googlePlaces';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, searchQuery, location, options = {} } = body;

    // Either URL or search query + location is required
    if (!url && (!searchQuery || !location)) {
      return NextResponse.json(
        { error: 'Either Google Maps URL or search query with location is required' },
        { status: 400 }
      );
    }

    let result;

    if (url) {
      // Search by Google Maps URL
      result = await getGooglePlaceByUrl(url, options);
    } else {
      // Search by query and location
      result = await searchGooglePlaces(searchQuery, location, {
        ...options,
        maxResults: 1, // Only get the first result for GBP analysis
      });
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'GBP analysis failed' },
        { status: 500 }
      );
    }

    if (result.places.length === 0) {
      return NextResponse.json(
        { error: 'No business found' },
        { status: 404 }
      );
    }

    // Extract metrics from the first result
    const place = result.places[0];
    const metrics = extractGbpMetrics(place);

    return NextResponse.json({
      status: 'completed',
      place,
      metrics,
    });
  } catch (error) {
    console.error('GBP analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
