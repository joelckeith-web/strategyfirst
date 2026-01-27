import { NextRequest, NextResponse } from 'next/server';
import { AnalysisRequest } from '@/lib/types';
import { createAnalysisJob, runFullAnalysis } from '@/services/analysisOrchestrator';
import { listAnalyses } from '@/lib/store';

export async function GET() {
  try {
    const analyses = listAnalyses();
    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Failed to list analyses:', error);
    return NextResponse.json(
      { error: 'Failed to list analyses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const { businessName, location, industry, specificServices } = body as AnalysisRequest;

    if (!businessName || typeof businessName !== 'string') {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'string') {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    if (!industry || !['home_services', 'law_firm'].includes(industry)) {
      return NextResponse.json(
        { error: 'Industry must be "home_services" or "law_firm"' },
        { status: 400 }
      );
    }

    const analysisRequest: AnalysisRequest = {
      businessName: businessName.trim(),
      location: location.trim(),
      industry,
      specificServices: specificServices || [],
    };

    // Create the job
    const id = createAnalysisJob(analysisRequest);

    // Run analysis asynchronously (don't await)
    runFullAnalysis(id, analysisRequest).catch(error => {
      console.error(`Analysis ${id} failed:`, error);
    });

    return NextResponse.json({ id, status: 'pending' }, { status: 201 });
  } catch (error) {
    console.error('Failed to create analysis:', error);
    return NextResponse.json(
      { error: 'Failed to create analysis' },
      { status: 500 }
    );
  }
}
