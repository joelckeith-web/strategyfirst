import { NextRequest, NextResponse } from 'next/server';
import { createResearchJob, runResearch, listClients } from '@/services/researchOrchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, websiteUrl, gbpUrl, primaryServiceArea } = body;

    // Validate required fields
    if (!businessName || !websiteUrl || !primaryServiceArea) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the research job
    const clientId = await createResearchJob({
      businessName,
      websiteUrl,
      gbpUrl,
      primaryServiceArea,
    });

    // Start research in background (don't await)
    runResearch(clientId).catch(err => {
      console.error('Research failed:', err);
    });

    return NextResponse.json({ clientId });
  } catch (error) {
    console.error('Error creating research job:', error);
    return NextResponse.json(
      { error: 'Failed to create research job' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const clients = await listClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error listing clients:', error);
    return NextResponse.json(
      { error: 'Failed to list clients' },
      { status: 500 }
    );
  }
}
