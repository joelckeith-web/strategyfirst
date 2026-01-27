import { NextRequest, NextResponse } from 'next/server';
import {
  findCompetitors,
  extractGbpMetrics,
} from '@/services/apify/googlePlaces';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessType, location, maxCompetitors = 5 } = body;

    if (!businessType) {
      return NextResponse.json(
        { error: 'Business type is required' },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const result = await findCompetitors(businessType, location, maxCompetitors);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Competitor search failed' },
        { status: 500 }
      );
    }

    // Extract metrics for each competitor
    const competitors = result.places.map((place, index) => ({
      rank: index + 1,
      ...extractGbpMetrics(place),
      rawData: place,
    }));

    return NextResponse.json({
      status: 'completed',
      competitors,
      totalFound: result.totalResults,
    });
  } catch (error) {
    console.error('Competitor search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
